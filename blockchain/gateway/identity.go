package main

import (
	"crypto/ecdsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"os"
	"path/filepath"

	"github.com/hyperledger/fabric-gateway/pkg/client"
	"github.com/hyperledger/fabric-gateway/pkg/identity"
)

func newIdentity(certPEM []byte, mspID string) (*identity.X509Identity, error) {
	block, _ := pem.Decode(certPEM)
	if block == nil {
		return nil, fmt.Errorf("failed to decode cert PEM")
	}
	cert, err := x509.ParseCertificate(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("parse cert: %w", err)
	}
	return identity.NewX509Identity(mspID, cert)
}

func newSigner(keyPEM []byte) (client.Sign, error) {
	block, _ := pem.Decode(keyPEM)
	if block == nil {
		return nil, fmt.Errorf("failed to decode key PEM")
	}
	key, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("parse private key: %w", err)
	}
	ecKey, ok := key.(*ecdsa.PrivateKey)
	if !ok {
		return nil, fmt.Errorf("expected ECDSA private key")
	}
	return identity.NewPrivateKeySign(ecKey)
}

// findPrivateKey reads key from cfg.KeyPath or auto-discovers it from the keystore dir.
func findPrivateKey(cfg FabricConfig) ([]byte, error) {
	if cfg.KeyPath != "" {
		return os.ReadFile(cfg.KeyPath)
	}
	// Auto-discover: the keystore dir sits next to the signcerts dir
	keystoreDir := filepath.Join(filepath.Dir(filepath.Dir(cfg.CertPath)), "keystore")
	entries, err := os.ReadDir(keystoreDir)
	if err != nil {
		return nil, fmt.Errorf("read keystore dir %s: %w", keystoreDir, err)
	}
	if len(entries) == 0 {
		return nil, fmt.Errorf("no keys found in keystore dir %s", keystoreDir)
	}
	return os.ReadFile(filepath.Join(keystoreDir, entries[0].Name()))
}
