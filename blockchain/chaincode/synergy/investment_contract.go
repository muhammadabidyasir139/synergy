package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// InvestmentContract manages investment records on-chain.
// Off-chain wallet/ledger balances live in PostgreSQL; this provides
// an immutable audit trail and cross-party consensus.
type InvestmentContract struct {
	contractapi.Contract
}

// RecordInvestment writes a new investment to the ledger.
// Called by the backend when an investor confirms funding a campaign.
func (c *InvestmentContract) RecordInvestment(ctx contractapi.TransactionContextInterface,
	id, investorID, campaignID, umkmID string,
	amount float64,
	akadType AkadType,
) error {
	exists, err := c.investmentExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("investment %s already exists", id)
	}

	now := time.Now().UTC().Format(time.RFC3339)
	inv := Investment{
		DocType:    "investment",
		ID:         id,
		InvestorID: investorID,
		CampaignID: campaignID,
		UmkmID:     umkmID,
		Amount:     amount,
		AkadType:   akadType,
		Status:     InvestmentOngoing,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	data, err := json.Marshal(inv)
	if err != nil {
		return err
	}
	if err := ctx.GetStub().PutState(id, data); err != nil {
		return err
	}

	// Emit Fabric event for real-time subscribers (backend listener)
	return ctx.GetStub().SetEvent(string(EventInvestment), data)
}

// LinkAkad associates an akad with an investment once the akad is created.
func (c *InvestmentContract) LinkAkad(ctx contractapi.TransactionContextInterface,
	investmentID, akadID string,
) error {
	inv, err := c.getInvestment(ctx, investmentID)
	if err != nil {
		return err
	}
	if inv.AkadID != "" {
		return fmt.Errorf("investment %s is already linked to akad %s", investmentID, inv.AkadID)
	}

	inv.AkadID = akadID
	inv.UpdatedAt = time.Now().UTC().Format(time.RFC3339)

	data, err := json.Marshal(inv)
	if err != nil {
		return err
	}
	return ctx.GetStub().PutState(investmentID, data)
}

// UpdateInvestmentStatus transitions the investment status.
// Allowed: ONGOING -> COMPLETED | DEFAULTED
func (c *InvestmentContract) UpdateInvestmentStatus(ctx contractapi.TransactionContextInterface,
	investmentID string, newStatus InvestmentStatus,
) error {
	inv, err := c.getInvestment(ctx, investmentID)
	if err != nil {
		return err
	}
	if inv.Status != InvestmentOngoing {
		return fmt.Errorf("investment %s is not ONGOING, cannot update", investmentID)
	}

	inv.Status = newStatus
	inv.UpdatedAt = time.Now().UTC().Format(time.RFC3339)

	data, err := json.Marshal(inv)
	if err != nil {
		return err
	}
	return ctx.GetStub().PutState(investmentID, data)
}

// GetInvestment retrieves a single investment by ID.
func (c *InvestmentContract) GetInvestment(ctx contractapi.TransactionContextInterface, investmentID string) (*Investment, error) {
	return c.getInvestment(ctx, investmentID)
}

// QueryInvestmentsByInvestor returns all investments for a given investor (CouchDB).
func (c *InvestmentContract) QueryInvestmentsByInvestor(ctx contractapi.TransactionContextInterface, investorID string) ([]*Investment, error) {
	query := fmt.Sprintf(`{"selector":{"docType":"investment","investorId":"%s"}}`, investorID)
	return c.queryInvestments(ctx, query)
}

// QueryInvestmentsByCampaign returns all investments for a campaign (CouchDB).
func (c *InvestmentContract) QueryInvestmentsByCampaign(ctx contractapi.TransactionContextInterface, campaignID string) ([]*Investment, error) {
	query := fmt.Sprintf(`{"selector":{"docType":"investment","campaignId":"%s"}}`, campaignID)
	return c.queryInvestments(ctx, query)
}

// QueryInvestmentsByUmkm returns all investments linked to an UMKM (CouchDB).
func (c *InvestmentContract) QueryInvestmentsByUmkm(ctx contractapi.TransactionContextInterface, umkmID string) ([]*Investment, error) {
	query := fmt.Sprintf(`{"selector":{"docType":"investment","umkmId":"%s"}}`, umkmID)
	return c.queryInvestments(ctx, query)
}

// --- internal helpers ---

func (c *InvestmentContract) investmentExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	data, err := ctx.GetStub().GetState(id)
	return data != nil, err
}

func (c *InvestmentContract) getInvestment(ctx contractapi.TransactionContextInterface, id string) (*Investment, error) {
	data, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, err
	}
	if data == nil {
		return nil, fmt.Errorf("investment %s not found", id)
	}
	var inv Investment
	return &inv, json.Unmarshal(data, &inv)
}

func (c *InvestmentContract) queryInvestments(ctx contractapi.TransactionContextInterface, query string) ([]*Investment, error) {
	iter, err := ctx.GetStub().GetQueryResult(query)
	if err != nil {
		return nil, err
	}
	defer iter.Close()

	var results []*Investment
	for iter.HasNext() {
		item, err := iter.Next()
		if err != nil {
			return nil, err
		}
		var inv Investment
		if err := json.Unmarshal(item.Value, &inv); err != nil {
			return nil, err
		}
		results = append(results, &inv)
	}
	return results, nil
}
