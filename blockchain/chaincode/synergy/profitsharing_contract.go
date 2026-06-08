package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// ProfitSharingContract manages profit-sharing periods between investor and UMKM.
type ProfitSharingContract struct {
	contractapi.Contract
}

// CreatePeriod records a new profit-sharing period obligation on-chain.
// Called by the backend when a new payment period begins (e.g. monthly).
func (c *ProfitSharingContract) CreatePeriod(ctx contractapi.TransactionContextInterface,
	id, akadID, investmentID, investorID, umkmID string,
	periodStart, periodEnd, dueDate string,
	grossRevenue, investorShare, umkmShare, platformFee float64,
) error {
	exists, err := c.periodExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("profit sharing period %s already exists", id)
	}

	// Validate shares add up correctly (allow small float rounding)
	total := investorShare + umkmShare + platformFee
	if grossRevenue > 0 && (total < grossRevenue*0.99 || total > grossRevenue*1.01) {
		return fmt.Errorf("shares do not add up to gross revenue: %.2f vs %.2f", total, grossRevenue)
	}

	now := time.Now().UTC().Format(time.RFC3339)
	ps := ProfitSharing{
		DocType:       "profitSharing",
		ID:            id,
		AkadID:        akadID,
		InvestmentID:  investmentID,
		InvestorID:    investorID,
		UmkmID:        umkmID,
		PeriodStart:   periodStart,
		PeriodEnd:     periodEnd,
		DueDate:       dueDate,
		GrossRevenue:  grossRevenue,
		InvestorShare: investorShare,
		UmkmShare:     umkmShare,
		PlatformFee:   platformFee,
		Status:        ProfitSharingPending,
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	data, err := json.Marshal(ps)
	if err != nil {
		return err
	}
	return ctx.GetStub().PutState(id, data)
}

// RecordPayment marks a profit-sharing period as PAID and stores the confirming tx hash.
// Called by the backend after UMKM confirms payment and wallet transfer is done.
func (c *ProfitSharingContract) RecordPayment(ctx contractapi.TransactionContextInterface,
	periodID, actorID string,
) error {
	ps, err := c.getPeriod(ctx, periodID)
	if err != nil {
		return err
	}
	if ps.Status == ProfitSharingPaid {
		return fmt.Errorf("period %s is already paid", periodID)
	}

	now := time.Now().UTC().Format(time.RFC3339)
	ps.Status = ProfitSharingPaid
	ps.PaidAt = now
	ps.TxHash = ctx.GetStub().GetTxID()
	ps.UpdatedAt = now

	data, err := json.Marshal(ps)
	if err != nil {
		return err
	}
	if err := ctx.GetStub().PutState(periodID, data); err != nil {
		return err
	}

	// Emit event for backend listener
	return ctx.GetStub().SetEvent(string(EventProfitSharing), data)
}

// MarkOverdue transitions a PENDING period to OVERDUE.
// Called by the backend scheduler when dueDate has passed without payment.
func (c *ProfitSharingContract) MarkOverdue(ctx contractapi.TransactionContextInterface, periodID string) error {
	ps, err := c.getPeriod(ctx, periodID)
	if err != nil {
		return err
	}
	if ps.Status != ProfitSharingPending {
		return fmt.Errorf("period %s is not PENDING", periodID)
	}

	ps.Status = ProfitSharingOverdue
	ps.UpdatedAt = time.Now().UTC().Format(time.RFC3339)

	data, err := json.Marshal(ps)
	if err != nil {
		return err
	}
	return ctx.GetStub().PutState(periodID, data)
}

// GetPeriod retrieves a single profit-sharing period by ID.
func (c *ProfitSharingContract) GetPeriod(ctx contractapi.TransactionContextInterface, periodID string) (*ProfitSharing, error) {
	return c.getPeriod(ctx, periodID)
}

// QueryByAkad returns all profit-sharing periods for an akad (CouchDB).
func (c *ProfitSharingContract) QueryByAkad(ctx contractapi.TransactionContextInterface, akadID string) ([]*ProfitSharing, error) {
	query := fmt.Sprintf(`{"selector":{"docType":"profitSharing","akadId":"%s"}}`, akadID)
	return c.queryPeriods(ctx, query)
}

// QueryByInvestor returns all profit-sharing periods for an investor (CouchDB).
func (c *ProfitSharingContract) QueryByInvestor(ctx contractapi.TransactionContextInterface, investorID string) ([]*ProfitSharing, error) {
	query := fmt.Sprintf(`{"selector":{"docType":"profitSharing","investorId":"%s"}}`, investorID)
	return c.queryPeriods(ctx, query)
}

// QueryByUmkm returns all profit-sharing periods for a UMKM (CouchDB).
func (c *ProfitSharingContract) QueryByUmkm(ctx contractapi.TransactionContextInterface, umkmID string) ([]*ProfitSharing, error) {
	query := fmt.Sprintf(`{"selector":{"docType":"profitSharing","umkmId":"%s"}}`, umkmID)
	return c.queryPeriods(ctx, query)
}

// QueryOverdue returns all overdue periods across all akads (CouchDB).
func (c *ProfitSharingContract) QueryOverdue(ctx contractapi.TransactionContextInterface) ([]*ProfitSharing, error) {
	query := `{"selector":{"docType":"profitSharing","status":"OVERDUE"}}`
	return c.queryPeriods(ctx, query)
}

// GetTotalPaidToInvestor sums all PAID shares for an investor (CouchDB).
// Returns the total amount paid as a float64.
func (c *ProfitSharingContract) GetTotalPaidToInvestor(ctx contractapi.TransactionContextInterface, investorID string) (float64, error) {
	query := fmt.Sprintf(`{"selector":{"docType":"profitSharing","investorId":"%s","status":"PAID"}}`, investorID)
	periods, err := c.queryPeriods(ctx, query)
	if err != nil {
		return 0, err
	}
	var total float64
	for _, p := range periods {
		total += p.InvestorShare
	}
	return total, nil
}

// --- internal helpers ---

func (c *ProfitSharingContract) periodExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	data, err := ctx.GetStub().GetState(id)
	return data != nil, err
}

func (c *ProfitSharingContract) getPeriod(ctx contractapi.TransactionContextInterface, id string) (*ProfitSharing, error) {
	data, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, err
	}
	if data == nil {
		return nil, fmt.Errorf("profit sharing period %s not found", id)
	}
	var ps ProfitSharing
	return &ps, json.Unmarshal(data, &ps)
}

func (c *ProfitSharingContract) queryPeriods(ctx contractapi.TransactionContextInterface, query string) ([]*ProfitSharing, error) {
	iter, err := ctx.GetStub().GetQueryResult(query)
	if err != nil {
		return nil, err
	}
	defer iter.Close()

	var results []*ProfitSharing
	for iter.HasNext() {
		item, err := iter.Next()
		if err != nil {
			return nil, err
		}
		var ps ProfitSharing
		if err := json.Unmarshal(item.Value, &ps); err != nil {
			return nil, err
		}
		results = append(results, &ps)
	}
	return results, nil
}
