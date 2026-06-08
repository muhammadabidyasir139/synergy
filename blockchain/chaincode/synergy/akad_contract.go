package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// AkadContract handles all sharia contract (akad) operations on-chain
type AkadContract struct {
	contractapi.Contract
}

// CreateAkad records a new akad on the ledger with PENDING status.
// Called by the backend after investor commits to a campaign.
func (c *AkadContract) CreateAkad(ctx contractapi.TransactionContextInterface,
	id, campaignID, investmentID, investorID, umkmID string,
	akadType AkadType,
	principalAmount, nisbahInvestor, nisbahUmkm, platformFeeRate float64,
	durationMonths int,
	startDate, endDate string,
) error {
	exists, err := c.akadExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("akad %s already exists", id)
	}

	now := time.Now().UTC().Format(time.RFC3339)
	akad := Akad{
		DocType:         "akad",
		ID:              id,
		CampaignID:      campaignID,
		InvestmentID:    investmentID,
		InvestorID:      investorID,
		UmkmID:          umkmID,
		AkadType:        akadType,
		Status:          AkadPending,
		PrincipalAmount: principalAmount,
		NisbahInvestor:  nisbahInvestor,
		NisbahUmkm:      nisbahUmkm,
		PlatformFeeRate: platformFeeRate,
		DurationMonths:  durationMonths,
		StartDate:       startDate,
		EndDate:         endDate,
		CreatedAt:       now,
		UpdatedAt:       now,
	}

	data, err := json.Marshal(akad)
	if err != nil {
		return err
	}
	if err := ctx.GetStub().PutState(id, data); err != nil {
		return err
	}

	return c.emitEvent(ctx, id, EventDeploy, investorID, id, "Akad created with PENDING status", data)
}

// SignAkad records the digital signature of either investor, umkm, or admin.
// signer: "investor" | "umkm" | "admin"
func (c *AkadContract) SignAkad(ctx contractapi.TransactionContextInterface,
	akadID, signer, signerID string,
) error {
	akad, err := c.getAkad(ctx, akadID)
	if err != nil {
		return err
	}
	if akad.Status != AkadPending {
		return fmt.Errorf("akad %s is not in PENDING status, cannot sign", akadID)
	}

	now := time.Now().UTC().Format(time.RFC3339)
	switch signer {
	case "investor":
		akad.InvestorSignedAt = now
	case "umkm":
		akad.UmkmSignedAt = now
	case "admin":
		akad.ApprovedAt = now
		akad.ApprovedBy = signerID
	default:
		return fmt.Errorf("unknown signer type: %s", signer)
	}
	akad.UpdatedAt = now

	// Auto-activate when all required signatures are present
	if akad.InvestorSignedAt != "" && akad.UmkmSignedAt != "" && akad.ApprovedAt != "" {
		akad.Status = AkadActive
		akad.DeployedAt = now
	}

	data, err := json.Marshal(akad)
	if err != nil {
		return err
	}
	if err := ctx.GetStub().PutState(akadID, data); err != nil {
		return err
	}

	eventType := EventAkadSign
	desc := fmt.Sprintf("%s signed akad %s", signer, akadID)
	if akad.Status == AkadActive {
		eventType = EventAkadActivate
		desc = fmt.Sprintf("Akad %s activated after all signatures collected", akadID)
	}
	return c.emitEvent(ctx, akadID, eventType, signerID, akadID, desc, data)
}

// UpdateAkadStatus allows admin to manually transition akad status
// (e.g. mark as COMPLETED or DEFAULTED).
func (c *AkadContract) UpdateAkadStatus(ctx contractapi.TransactionContextInterface,
	akadID string, newStatus AkadStatus, actorID string,
) error {
	akad, err := c.getAkad(ctx, akadID)
	if err != nil {
		return err
	}

	validTransitions := map[AkadStatus][]AkadStatus{
		AkadPending:   {AkadActive, AkadCancelled},
		AkadActive:    {AkadCompleted, AkadDefaulted},
		AkadCompleted: {},
		AkadDefaulted: {},
		AkadCancelled: {},
	}

	allowed := false
	for _, s := range validTransitions[akad.Status] {
		if s == newStatus {
			allowed = true
			break
		}
	}
	if !allowed {
		return fmt.Errorf("cannot transition akad from %s to %s", akad.Status, newStatus)
	}

	akad.Status = newStatus
	akad.UpdatedAt = time.Now().UTC().Format(time.RFC3339)

	data, err := json.Marshal(akad)
	if err != nil {
		return err
	}
	if err := ctx.GetStub().PutState(akadID, data); err != nil {
		return err
	}

	eventType := EventValidation
	if newStatus == AkadCompleted {
		eventType = EventCompletion
	} else if newStatus == AkadDefaulted {
		eventType = EventDefaulted
	}
	return c.emitEvent(ctx, akadID, eventType, actorID, akadID,
		fmt.Sprintf("Akad status updated to %s", newStatus), data)
}

// GetAkad retrieves an akad by ID
func (c *AkadContract) GetAkad(ctx contractapi.TransactionContextInterface, akadID string) (*Akad, error) {
	return c.getAkad(ctx, akadID)
}

// QueryAkadByInvestor returns all akads for a given investor (requires CouchDB)
func (c *AkadContract) QueryAkadByInvestor(ctx contractapi.TransactionContextInterface, investorID string) ([]*Akad, error) {
	query := fmt.Sprintf(`{"selector":{"docType":"akad","investorId":"%s"}}`, investorID)
	return c.queryAkads(ctx, query)
}

// QueryAkadByUmkm returns all akads for a given UMKM (requires CouchDB)
func (c *AkadContract) QueryAkadByUmkm(ctx contractapi.TransactionContextInterface, umkmID string) ([]*Akad, error) {
	query := fmt.Sprintf(`{"selector":{"docType":"akad","umkmId":"%s"}}`, umkmID)
	return c.queryAkads(ctx, query)
}

// QueryAkadByStatus returns all akads with a given status (requires CouchDB)
func (c *AkadContract) QueryAkadByStatus(ctx contractapi.TransactionContextInterface, status AkadStatus) ([]*Akad, error) {
	query := fmt.Sprintf(`{"selector":{"docType":"akad","status":"%s"}}`, status)
	return c.queryAkads(ctx, query)
}

// GetAkadHistory returns the full history of changes to an akad (immutable ledger history)
func (c *AkadContract) GetAkadHistory(ctx contractapi.TransactionContextInterface, akadID string) ([]map[string]interface{}, error) {
	iter, err := ctx.GetStub().GetHistoryForKey(akadID)
	if err != nil {
		return nil, err
	}
	defer iter.Close()

	var history []map[string]interface{}
	for iter.HasNext() {
		mod, err := iter.Next()
		if err != nil {
			return nil, err
		}
		var akad Akad
		_ = json.Unmarshal(mod.Value, &akad)
		history = append(history, map[string]interface{}{
			"txId":      mod.TxId,
			"timestamp": mod.Timestamp,
			"isDelete":  mod.IsDelete,
			"value":     akad,
		})
	}
	return history, nil
}

// --- internal helpers ---

func (c *AkadContract) akadExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	data, err := ctx.GetStub().GetState(id)
	return data != nil, err
}

func (c *AkadContract) getAkad(ctx contractapi.TransactionContextInterface, id string) (*Akad, error) {
	data, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, err
	}
	if data == nil {
		return nil, fmt.Errorf("akad %s not found", id)
	}
	var akad Akad
	return &akad, json.Unmarshal(data, &akad)
}

func (c *AkadContract) queryAkads(ctx contractapi.TransactionContextInterface, query string) ([]*Akad, error) {
	iter, err := ctx.GetStub().GetQueryResult(query)
	if err != nil {
		return nil, err
	}
	defer iter.Close()

	var results []*Akad
	for iter.HasNext() {
		item, err := iter.Next()
		if err != nil {
			return nil, err
		}
		var akad Akad
		if err := json.Unmarshal(item.Value, &akad); err != nil {
			return nil, err
		}
		results = append(results, &akad)
	}
	return results, nil
}

func (c *AkadContract) emitEvent(ctx contractapi.TransactionContextInterface,
	akadID string, eventType EventType, actorID, relatedID, description string, rawData []byte,
) error {
	eventID := fmt.Sprintf("event-%s-%d", ctx.GetStub().GetTxID(), time.Now().UnixNano())
	event := BlockchainEvent{
		DocType:     "blockchainEvent",
		ID:          eventID,
		TxID:        ctx.GetStub().GetTxID(),
		AkadID:      akadID,
		EventType:   eventType,
		RelatedID:   relatedID,
		ActorID:     actorID,
		Description: description,
		RawData:     string(rawData),
		Timestamp:   time.Now().UTC().Format(time.RFC3339),
	}
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	if err := ctx.GetStub().PutState(eventID, data); err != nil {
		return err
	}
	// Also emit as Fabric event for subscribers
	return ctx.GetStub().SetEvent(string(eventType), data)
}
