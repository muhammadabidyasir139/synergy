package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// AuditContract provides read-only audit trail queries across all event records.
type AuditContract struct {
	contractapi.Contract
}

// GetEventsByAkad returns all blockchain events for a given akad (CouchDB).
func (c *AuditContract) GetEventsByAkad(ctx contractapi.TransactionContextInterface, akadID string) ([]*BlockchainEvent, error) {
	query := fmt.Sprintf(`{"selector":{"docType":"blockchainEvent","akadId":"%s"},"sort":[{"timestamp":"asc"}]}`, akadID)
	return c.queryEvents(ctx, query)
}

// GetEventsByActor returns all blockchain events triggered by a specific actor (CouchDB).
func (c *AuditContract) GetEventsByActor(ctx contractapi.TransactionContextInterface, actorID string) ([]*BlockchainEvent, error) {
	query := fmt.Sprintf(`{"selector":{"docType":"blockchainEvent","actorId":"%s"}}`, actorID)
	return c.queryEvents(ctx, query)
}

// GetEventsByType returns all blockchain events of a given type (CouchDB).
func (c *AuditContract) GetEventsByType(ctx contractapi.TransactionContextInterface, eventType EventType) ([]*BlockchainEvent, error) {
	query := fmt.Sprintf(`{"selector":{"docType":"blockchainEvent","eventType":"%s"}}`, eventType)
	return c.queryEvents(ctx, query)
}

// GetEvent retrieves a single audit event by ID.
func (c *AuditContract) GetEvent(ctx contractapi.TransactionContextInterface, eventID string) (*BlockchainEvent, error) {
	data, err := ctx.GetStub().GetState(eventID)
	if err != nil {
		return nil, err
	}
	if data == nil {
		return nil, fmt.Errorf("event %s not found", eventID)
	}
	var ev BlockchainEvent
	return &ev, json.Unmarshal(data, &ev)
}

// --- internal helpers ---

func (c *AuditContract) queryEvents(ctx contractapi.TransactionContextInterface, query string) ([]*BlockchainEvent, error) {
	iter, err := ctx.GetStub().GetQueryResult(query)
	if err != nil {
		return nil, err
	}
	defer iter.Close()

	var results []*BlockchainEvent
	for iter.HasNext() {
		item, err := iter.Next()
		if err != nil {
			return nil, err
		}
		var ev BlockchainEvent
		if err := json.Unmarshal(item.Value, &ev); err != nil {
			return nil, err
		}
		results = append(results, &ev)
	}
	return results, nil
}
