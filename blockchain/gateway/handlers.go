package main

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/hyperledger/fabric-gateway/pkg/client"
)

// contractFor returns the named chaincode contract from the gateway.
func contractFor(gw *client.Gateway, cfg FabricConfig) *client.Contract {
	network := gw.GetNetwork(cfg.ChannelName)
	return network.GetContract(cfg.ChaincodeName)
}

// submit calls a chaincode transaction that writes state.
func submit(contract *client.Contract, fn string, args ...string) ([]byte, error) {
	return contract.SubmitTransaction(fn, args...)
}

// evaluate calls a chaincode query (read-only, no consensus needed).
func evaluate(contract *client.Contract, fn string, args ...string) ([]byte, error) {
	return contract.EvaluateTransaction(fn, args...)
}

// ─── Akad handlers ───────────────────────────────────────────────────────────

func handleCreateAkad(contract *client.Contract) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			ID              string  `json:"id" binding:"required"`
			CampaignID      string  `json:"campaignId" binding:"required"`
			InvestmentID    string  `json:"investmentId" binding:"required"`
			InvestorID      string  `json:"investorId" binding:"required"`
			UmkmID          string  `json:"umkmId" binding:"required"`
			AkadType        string  `json:"akadType" binding:"required"`
			PrincipalAmount float64 `json:"principalAmount" binding:"required"`
			NisbahInvestor  float64 `json:"nisbahInvestor" binding:"required"`
			NisbahUmkm      float64 `json:"nisbahUmkm" binding:"required"`
			PlatformFeeRate float64 `json:"platformFeeRate"`
			DurationMonths  int     `json:"durationMonths" binding:"required"`
			StartDate       string  `json:"startDate" binding:"required"`
			EndDate         string  `json:"endDate" binding:"required"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		_, err := submit(contract, "AkadContract:CreateAkad",
			req.ID, req.CampaignID, req.InvestmentID, req.InvestorID, req.UmkmID,
			req.AkadType,
			fmt.Sprintf("%.2f", req.PrincipalAmount),
			fmt.Sprintf("%.4f", req.NisbahInvestor),
			fmt.Sprintf("%.4f", req.NisbahUmkm),
			fmt.Sprintf("%.4f", req.PlatformFeeRate),
			strconv.Itoa(req.DurationMonths),
			req.StartDate, req.EndDate,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"message": "akad created", "id": req.ID})
	}
}

func handleSignAkad(contract *client.Contract) gin.HandlerFunc {
	return func(c *gin.Context) {
		akadID := c.Param("id")
		var req struct {
			Signer   string `json:"signer" binding:"required"`   // investor | umkm | admin
			SignerID string `json:"signerId" binding:"required"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		_, err := submit(contract, "AkadContract:SignAkad", akadID, req.Signer, req.SignerID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "akad signed", "akadId": akadID, "signer": req.Signer})
	}
}

func handleUpdateAkadStatus(contract *client.Contract) gin.HandlerFunc {
	return func(c *gin.Context) {
		akadID := c.Param("id")
		var req struct {
			Status  string `json:"status" binding:"required"`
			ActorID string `json:"actorId" binding:"required"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		_, err := submit(contract, "AkadContract:UpdateAkadStatus", akadID, req.Status, req.ActorID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "akad status updated"})
	}
}

func handleGetAkad(contract *client.Contract) gin.HandlerFunc {
	return func(c *gin.Context) {
		result, err := evaluate(contract, "AkadContract:GetAkad", c.Param("id"))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.Data(http.StatusOK, "application/json", result)
	}
}

func handleGetAkadHistory(contract *client.Contract) gin.HandlerFunc {
	return func(c *gin.Context) {
		result, err := evaluate(contract, "AkadContract:GetAkadHistory", c.Param("id"))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Data(http.StatusOK, "application/json", result)
	}
}

func handleQueryAkadByInvestor(contract *client.Contract) gin.HandlerFunc {
	return func(c *gin.Context) {
		result, err := evaluate(contract, "AkadContract:QueryAkadByInvestor", c.Param("investorId"))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Data(http.StatusOK, "application/json", result)
	}
}

func handleQueryAkadByUmkm(contract *client.Contract) gin.HandlerFunc {
	return func(c *gin.Context) {
		result, err := evaluate(contract, "AkadContract:QueryAkadByUmkm", c.Param("umkmId"))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Data(http.StatusOK, "application/json", result)
	}
}

// ─── Investment handlers ──────────────────────────────────────────────────────

func handleRecordInvestment(contract *client.Contract) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			ID         string  `json:"id" binding:"required"`
			InvestorID string  `json:"investorId" binding:"required"`
			CampaignID string  `json:"campaignId" binding:"required"`
			UmkmID     string  `json:"umkmId" binding:"required"`
			Amount     float64 `json:"amount" binding:"required"`
			AkadType   string  `json:"akadType" binding:"required"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		_, err := submit(contract, "InvestmentContract:RecordInvestment",
			req.ID, req.InvestorID, req.CampaignID, req.UmkmID,
			fmt.Sprintf("%.2f", req.Amount), req.AkadType,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"message": "investment recorded", "id": req.ID})
	}
}

func handleLinkAkad(contract *client.Contract) gin.HandlerFunc {
	return func(c *gin.Context) {
		investmentID := c.Param("id")
		var req struct {
			AkadID string `json:"akadId" binding:"required"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		_, err := submit(contract, "InvestmentContract:LinkAkad", investmentID, req.AkadID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "akad linked to investment"})
	}
}

func handleGetInvestment(contract *client.Contract) gin.HandlerFunc {
	return func(c *gin.Context) {
		result, err := evaluate(contract, "InvestmentContract:GetInvestment", c.Param("id"))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.Data(http.StatusOK, "application/json", result)
	}
}

func handleQueryInvestmentsByInvestor(contract *client.Contract) gin.HandlerFunc {
	return func(c *gin.Context) {
		result, err := evaluate(contract, "InvestmentContract:QueryInvestmentsByInvestor", c.Param("investorId"))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Data(http.StatusOK, "application/json", result)
	}
}

// ─── ProfitSharing handlers ───────────────────────────────────────────────────

func handleCreatePeriod(contract *client.Contract) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			ID            string  `json:"id" binding:"required"`
			AkadID        string  `json:"akadId" binding:"required"`
			InvestmentID  string  `json:"investmentId" binding:"required"`
			InvestorID    string  `json:"investorId" binding:"required"`
			UmkmID        string  `json:"umkmId" binding:"required"`
			PeriodStart   string  `json:"periodStart" binding:"required"`
			PeriodEnd     string  `json:"periodEnd" binding:"required"`
			DueDate       string  `json:"dueDate" binding:"required"`
			GrossRevenue  float64 `json:"grossRevenue" binding:"required"`
			InvestorShare float64 `json:"investorShare" binding:"required"`
			UmkmShare     float64 `json:"umkmShare" binding:"required"`
			PlatformFee   float64 `json:"platformFee"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		_, err := submit(contract, "ProfitSharingContract:CreatePeriod",
			req.ID, req.AkadID, req.InvestmentID, req.InvestorID, req.UmkmID,
			req.PeriodStart, req.PeriodEnd, req.DueDate,
			fmt.Sprintf("%.2f", req.GrossRevenue),
			fmt.Sprintf("%.2f", req.InvestorShare),
			fmt.Sprintf("%.2f", req.UmkmShare),
			fmt.Sprintf("%.2f", req.PlatformFee),
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"message": "profit sharing period created", "id": req.ID})
	}
}

func handleRecordPayment(contract *client.Contract) gin.HandlerFunc {
	return func(c *gin.Context) {
		periodID := c.Param("id")
		var req struct {
			ActorID string `json:"actorId" binding:"required"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		_, err := submit(contract, "ProfitSharingContract:RecordPayment", periodID, req.ActorID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "payment recorded", "periodId": periodID})
	}
}

func handleGetPeriod(contract *client.Contract) gin.HandlerFunc {
	return func(c *gin.Context) {
		result, err := evaluate(contract, "ProfitSharingContract:GetPeriod", c.Param("id"))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.Data(http.StatusOK, "application/json", result)
	}
}

func handleQueryPeriodsByAkad(contract *client.Contract) gin.HandlerFunc {
	return func(c *gin.Context) {
		result, err := evaluate(contract, "ProfitSharingContract:QueryByAkad", c.Param("akadId"))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Data(http.StatusOK, "application/json", result)
	}
}

func handleQueryOverdue(contract *client.Contract) gin.HandlerFunc {
	return func(c *gin.Context) {
		result, err := evaluate(contract, "ProfitSharingContract:QueryOverdue")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Data(http.StatusOK, "application/json", result)
	}
}

// ─── Audit handlers ───────────────────────────────────────────────────────────

func handleGetEventsByAkad(contract *client.Contract) gin.HandlerFunc {
	return func(c *gin.Context) {
		result, err := evaluate(contract, "AuditContract:GetEventsByAkad", c.Param("akadId"))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Data(http.StatusOK, "application/json", result)
	}
}
