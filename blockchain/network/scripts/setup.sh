#!/usr/bin/env bash
# setup.sh — bootstrap the Synergy Fabric network
# Run from the blockchain/network/ directory.
set -euo pipefail

CHANNEL_NAME="synergychannel"
CC_NAME="synergy"
CC_PATH="../chaincode/synergy"
CC_VERSION="1.0"
CC_SEQUENCE=1

FABRIC_BIN="${FABRIC_BIN:-$(pwd)/bin}"  # download binaries here if not on PATH
export PATH="${FABRIC_BIN}:${PATH}"

log() { echo "▶ $*"; }

# ─── 1. Download Fabric binaries if not present ──────────────────────────────
if ! command -v cryptogen &>/dev/null; then
  log "Downloading Fabric 2.5 binaries..."
  curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh
  chmod +x install-fabric.sh
  ./install-fabric.sh --fabric-version 2.5.12 binary
  export PATH="$(pwd)/bin:${PATH}"
fi

# ─── 2. Generate crypto material ──────────────────────────────────────────────
log "Generating crypto material..."
cryptogen generate --config=./crypto-config.yaml --output=./crypto-config

# ─── 3. Generate channel artifacts ────────────────────────────────────────────
mkdir -p channel-artifacts

log "Generating genesis block (system channel)..."
configtxgen \
  -profile SynergyGenesis \
  -configPath ./configtx \
  -channelID system-channel \
  -outputBlock ./channel-artifacts/genesis.block

log "Generating channel transaction..."
configtxgen \
  -profile SynergyChannel \
  -configPath ./configtx \
  -channelID "${CHANNEL_NAME}" \
  -outputCreateChannelTx ./channel-artifacts/channel.tx

log "Generating anchor peer updates..."
configtxgen \
  -profile SynergyChannel \
  -configPath ./configtx \
  -channelID "${CHANNEL_NAME}" \
  -outputAnchorPeersUpdate ./channel-artifacts/InvestorOrgMSPanchors.tx \
  -asOrg InvestorOrgMSP

configtxgen \
  -profile SynergyChannel \
  -configPath ./configtx \
  -channelID "${CHANNEL_NAME}" \
  -outputAnchorPeersUpdate ./channel-artifacts/UmkmOrgMSPanchors.tx \
  -asOrg UmkmOrgMSP

# ─── 4. Start network ─────────────────────────────────────────────────────────
log "Starting Docker network..."
docker compose up -d

log "Waiting for network to be ready..."
sleep 10

# ─── 5. Create and join channel ───────────────────────────────────────────────
log "Creating channel ${CHANNEL_NAME}..."
docker exec cli peer channel create \
  -o orderer.synergy.com:7050 \
  -c "${CHANNEL_NAME}" \
  -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/channel.tx \
  --tls \
  --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/synergy.com/orderers/orderer.synergy.com/msp/tlscacerts/tlsca.synergy.com-cert.pem

log "Joining peer0.investororg to channel..."
docker exec cli peer channel join \
  -b "${CHANNEL_NAME}.block"

log "Joining peer0.umkmorg to channel..."
docker exec \
  -e CORE_PEER_ADDRESS=peer0.umkmorg.synergy.com:9051 \
  -e CORE_PEER_LOCALMSPID=UmkmOrgMSP \
  -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/umkmorg.synergy.com/peers/peer0.umkmorg.synergy.com/tls/ca.crt \
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/umkmorg.synergy.com/users/Admin@umkmorg.synergy.com/msp \
  cli peer channel join \
  -b "${CHANNEL_NAME}.block"

# ─── 6. Update anchor peers ───────────────────────────────────────────────────
log "Updating anchor peers for InvestorOrg..."
docker exec cli peer channel update \
  -o orderer.synergy.com:7050 \
  -c "${CHANNEL_NAME}" \
  -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/InvestorOrgMSPanchors.tx \
  --tls \
  --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/synergy.com/orderers/orderer.synergy.com/msp/tlscacerts/tlsca.synergy.com-cert.pem

log "Updating anchor peers for UmkmOrg..."
docker exec \
  -e CORE_PEER_ADDRESS=peer0.umkmorg.synergy.com:9051 \
  -e CORE_PEER_LOCALMSPID=UmkmOrgMSP \
  -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/umkmorg.synergy.com/peers/peer0.umkmorg.synergy.com/tls/ca.crt \
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/umkmorg.synergy.com/users/Admin@umkmorg.synergy.com/msp \
  cli peer channel update \
  -o orderer.synergy.com:7050 \
  -c "${CHANNEL_NAME}" \
  -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/UmkmOrgMSPanchors.tx \
  --tls \
  --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/synergy.com/orderers/orderer.synergy.com/msp/tlscacerts/tlsca.synergy.com-cert.pem

# ─── 7. Package and install chaincode ─────────────────────────────────────────
log "Packaging chaincode..."
docker exec cli peer lifecycle chaincode package \
  "${CC_NAME}.tar.gz" \
  --path "/opt/gopath/src/github.com/chaincode/synergy" \
  --lang golang \
  --label "${CC_NAME}_${CC_VERSION}"

log "Installing chaincode on peer0.investororg..."
docker exec cli peer lifecycle chaincode install "${CC_NAME}.tar.gz"

log "Installing chaincode on peer0.umkmorg..."
docker exec \
  -e CORE_PEER_ADDRESS=peer0.umkmorg.synergy.com:9051 \
  -e CORE_PEER_LOCALMSPID=UmkmOrgMSP \
  -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/umkmorg.synergy.com/peers/peer0.umkmorg.synergy.com/tls/ca.crt \
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/umkmorg.synergy.com/users/Admin@umkmorg.synergy.com/msp \
  cli peer lifecycle chaincode install "${CC_NAME}.tar.gz"

# ─── 8. Approve and commit chaincode ──────────────────────────────────────────
CC_PACKAGE_ID=$(docker exec cli peer lifecycle chaincode queryinstalled 2>&1 | grep "${CC_NAME}_${CC_VERSION}" | awk '{print $3}' | tr -d ',')
log "Package ID: ${CC_PACKAGE_ID}"

ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/synergy.com/orderers/orderer.synergy.com/msp/tlscacerts/tlsca.synergy.com-cert.pem

log "Approving for InvestorOrg..."
docker exec cli peer lifecycle chaincode approveformyorg \
  -o orderer.synergy.com:7050 \
  --channelID "${CHANNEL_NAME}" \
  --name "${CC_NAME}" \
  --version "${CC_VERSION}" \
  --package-id "${CC_PACKAGE_ID}" \
  --sequence ${CC_SEQUENCE} \
  --tls --cafile "${ORDERER_CA}"

log "Approving for UmkmOrg..."
docker exec \
  -e CORE_PEER_ADDRESS=peer0.umkmorg.synergy.com:9051 \
  -e CORE_PEER_LOCALMSPID=UmkmOrgMSP \
  -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/umkmorg.synergy.com/peers/peer0.umkmorg.synergy.com/tls/ca.crt \
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/umkmorg.synergy.com/users/Admin@umkmorg.synergy.com/msp \
  cli peer lifecycle chaincode approveformyorg \
  -o orderer.synergy.com:7050 \
  --channelID "${CHANNEL_NAME}" \
  --name "${CC_NAME}" \
  --version "${CC_VERSION}" \
  --package-id "${CC_PACKAGE_ID}" \
  --sequence ${CC_SEQUENCE} \
  --tls --cafile "${ORDERER_CA}"

log "Committing chaincode..."
docker exec cli peer lifecycle chaincode commit \
  -o orderer.synergy.com:7050 \
  --channelID "${CHANNEL_NAME}" \
  --name "${CC_NAME}" \
  --version "${CC_VERSION}" \
  --sequence ${CC_SEQUENCE} \
  --tls --cafile "${ORDERER_CA}" \
  --peerAddresses peer0.investororg.synergy.com:7051 \
  --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/investororg.synergy.com/peers/peer0.investororg.synergy.com/tls/ca.crt \
  --peerAddresses peer0.umkmorg.synergy.com:9051 \
  --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/umkmorg.synergy.com/peers/peer0.umkmorg.synergy.com/tls/ca.crt

log "Network is ready! Channel: ${CHANNEL_NAME}, Chaincode: ${CC_NAME}"
