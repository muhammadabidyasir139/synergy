package main

import (
	"log"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func main() {
	akadContract := new(AkadContract)
	investmentContract := new(InvestmentContract)
	profitSharingContract := new(ProfitSharingContract)
	auditContract := new(AuditContract)

	chaincode, err := contractapi.NewChaincode(
		akadContract,
		investmentContract,
		profitSharingContract,
		auditContract,
	)
	if err != nil {
		log.Fatalf("error creating synergy chaincode: %v", err)
	}

	if err := chaincode.Start(); err != nil {
		log.Fatalf("error starting synergy chaincode: %v", err)
	}
}
