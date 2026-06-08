package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := configFromEnv()

	conn, gw, err := newGatewayConnection(cfg)
	if err != nil {
		log.Fatalf("failed to connect to Fabric gateway: %v", err)
	}
	defer gw.Close()
	defer conn.Close()

	contract := contractFor(gw, cfg)

	r := gin.Default()

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "channel": cfg.ChannelName, "chaincode": cfg.ChaincodeName})
	})

	api := r.Group("/api/v1")

	// ── Akad ──────────────────────────────────────────────────────────────────
	akad := api.Group("/akad")
	akad.POST("", handleCreateAkad(contract))
	akad.GET("/:id", handleGetAkad(contract))
	akad.GET("/:id/history", handleGetAkadHistory(contract))
	akad.POST("/:id/sign", handleSignAkad(contract))
	akad.PATCH("/:id/status", handleUpdateAkadStatus(contract))
	akad.GET("/investor/:investorId", handleQueryAkadByInvestor(contract))
	akad.GET("/umkm/:umkmId", handleQueryAkadByUmkm(contract))

	// ── Investment ────────────────────────────────────────────────────────────
	inv := api.Group("/investment")
	inv.POST("", handleRecordInvestment(contract))
	inv.GET("/:id", handleGetInvestment(contract))
	inv.POST("/:id/link-akad", handleLinkAkad(contract))
	inv.GET("/investor/:investorId", handleQueryInvestmentsByInvestor(contract))

	// ── Profit Sharing ────────────────────────────────────────────────────────
	ps := api.Group("/profit-sharing")
	ps.POST("", handleCreatePeriod(contract))
	ps.GET("/:id", handleGetPeriod(contract))
	ps.POST("/:id/pay", handleRecordPayment(contract))
	ps.GET("/akad/:akadId", handleQueryPeriodsByAkad(contract))
	ps.GET("/overdue", handleQueryOverdue(contract))

	// ── Audit ─────────────────────────────────────────────────────────────────
	audit := api.Group("/audit")
	audit.GET("/akad/:akadId", handleGetEventsByAkad(contract))

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	port := getenv("GATEWAY_PORT", "8080")
	go func() {
		log.Printf("Synergy Fabric Gateway listening on :%s", port)
		if err := r.Run(":" + port); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	<-quit
	log.Println("Shutting down gateway...")
}
