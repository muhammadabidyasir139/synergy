package main

import (
	"crypto/x509"
	"fmt"
	"os"
	"time"

	"github.com/hyperledger/fabric-gateway/pkg/client"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

// FabricConfig holds connection parameters loaded from env
type FabricConfig struct {
	PeerEndpoint    string // e.g. "localhost:7051"
	GatewayPeer     string // e.g. "peer0.investororg.synergy.com"
	MSPID           string // e.g. "InvestorOrgMSP"
	CertPath        string // path to user cert PEM
	KeyPath         string // path to user private key PEM
	TLSCertPath     string // path to peer TLS CA cert PEM
	ChannelName     string // e.g. "synergychannel"
	ChaincodeName   string // e.g. "synergy"
}

func configFromEnv() FabricConfig {
	return FabricConfig{
		PeerEndpoint:  getenv("FABRIC_PEER_ENDPOINT", "localhost:7051"),
		GatewayPeer:   getenv("FABRIC_GATEWAY_PEER", "peer0.investororg.synergy.com"),
		MSPID:         getenv("FABRIC_MSP_ID", "InvestorOrgMSP"),
		CertPath:      getenv("FABRIC_CERT_PATH", "../network/crypto-config/peerOrganizations/investororg.synergy.com/users/User1@investororg.synergy.com/msp/signcerts/User1@investororg.synergy.com-cert.pem"),
		KeyPath:       getenv("FABRIC_KEY_PATH", ""),     // auto-detected from keystore dir if empty
		TLSCertPath:   getenv("FABRIC_TLS_CERT_PATH", "../network/crypto-config/peerOrganizations/investororg.synergy.com/peers/peer0.investororg.synergy.com/tls/ca.crt"),
		ChannelName:   getenv("FABRIC_CHANNEL", "synergychannel"),
		ChaincodeName: getenv("FABRIC_CHAINCODE", "synergy"),
	}
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// newGatewayConnection opens a gRPC+TLS connection to the peer and returns a Fabric Gateway.
func newGatewayConnection(cfg FabricConfig) (*grpc.ClientConn, *client.Gateway, error) {
	tlsCert, err := os.ReadFile(cfg.TLSCertPath)
	if err != nil {
		return nil, nil, fmt.Errorf("read TLS cert: %w", err)
	}
	certPool := x509.NewCertPool()
	if !certPool.AppendCertsFromPEM(tlsCert) {
		return nil, nil, fmt.Errorf("failed to append TLS cert to pool")
	}

	conn, err := grpc.NewClient(
		cfg.PeerEndpoint,
		grpc.WithTransportCredentials(credentials.NewClientTLSFromCert(certPool, cfg.GatewayPeer)),
	)
	if err != nil {
		return nil, nil, fmt.Errorf("grpc dial: %w", err)
	}

	// Load identity (cert + key)
	certPEM, err := os.ReadFile(cfg.CertPath)
	if err != nil {
		return nil, nil, fmt.Errorf("read cert: %w", err)
	}

	keyPEM, err := findPrivateKey(cfg)
	if err != nil {
		return nil, nil, err
	}

	id, err := newIdentity(certPEM, cfg.MSPID)
	if err != nil {
		return nil, nil, err
	}
	sign, err := newSigner(keyPEM)
	if err != nil {
		return nil, nil, err
	}

	gw, err := client.Connect(
		id,
		client.WithSign(sign),
		client.WithClientConnection(conn),
		client.WithEvaluateTimeout(5*time.Second),
		client.WithEndorseTimeout(15*time.Second),
		client.WithSubmitTimeout(5*time.Second),
		client.WithCommitStatusTimeout(1*time.Minute),
	)
	if err != nil {
		conn.Close()
		return nil, nil, fmt.Errorf("connect gateway: %w", err)
	}

	return conn, gw, nil
}
