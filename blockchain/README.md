# Synergy Blockchain — Hyperledger Fabric 2.5

## Structure

```
blockchain/
├── chaincode/synergy/       # Go chaincode (deployed on-chain)
│   ├── main.go              # Entry point — registers all contracts
│   ├── models.go            # Shared data types (Akad, Investment, etc.)
│   ├── akad_contract.go     # Sharia contract lifecycle
│   ├── investment_contract.go
│   ├── profitsharing_contract.go
│   └── audit_contract.go    # Read-only audit trail queries
│
├── network/                 # Network bootstrap files
│   ├── docker-compose.yaml  # 1 orderer + 2 peers + 2 CouchDB instances
│   ├── crypto-config.yaml   # cryptogen config (2 orgs)
│   ├── configtx/
│   │   └── configtx.yaml    # Channel + genesis block config
│   └── scripts/
│       ├── setup.sh         # One-shot bootstrap script
│       └── teardown.sh      # Full cleanup
│
└── gateway/                 # Go HTTP gateway (called by FastAPI backend)
    ├── main.go              # Gin router + signal handling
    ├── config.go            # Env-based Fabric connection config
    ├── identity.go          # X.509 identity + ECDSA signer helpers
    ├── handlers.go          # REST → chaincode function mapping
    └── .env.example
```

## Orgs & Ports

| Component | Port |
|---|---|
| Orderer | 7050 |
| peer0.investororg | 7051 |
| peer0.umkmorg | 9051 |
| CouchDB (investororg) | 5985 |
| CouchDB (umkmorg) | 5986 |
| Go Gateway (HTTP) | 8080 |

## Quick Start

### 1. Bootstrap the network

```bash
cd blockchain/network
bash scripts/setup.sh
```

This will:
- Download Fabric 2.5 binaries (cryptogen, configtxgen, peer)
- Generate crypto material and channel artifacts
- Start Docker containers
- Create channel `synergychannel`, join both peers
- Package, install, approve, and commit the `synergy` chaincode

### 2. Start the gateway

```bash
cd blockchain/gateway
cp .env.example .env
go mod tidy
go run .
```

Gateway listens on `http://localhost:8080`.

### 3. Tear down

```bash
cd blockchain/network
bash scripts/teardown.sh
```

## REST API (Gateway)

### Akad
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/akad` | Create akad (PENDING) |
| GET | `/api/v1/akad/:id` | Get akad |
| GET | `/api/v1/akad/:id/history` | Full ledger history |
| POST | `/api/v1/akad/:id/sign` | Sign (investor/umkm/admin) |
| PATCH | `/api/v1/akad/:id/status` | Update status |
| GET | `/api/v1/akad/investor/:investorId` | Query by investor |
| GET | `/api/v1/akad/umkm/:umkmId` | Query by UMKM |

### Investment
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/investment` | Record investment |
| GET | `/api/v1/investment/:id` | Get investment |
| POST | `/api/v1/investment/:id/link-akad` | Link akad to investment |
| GET | `/api/v1/investment/investor/:investorId` | Query by investor |

### Profit Sharing
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/profit-sharing` | Create period |
| GET | `/api/v1/profit-sharing/:id` | Get period |
| POST | `/api/v1/profit-sharing/:id/pay` | Record payment (UMKM confirms) |
| GET | `/api/v1/profit-sharing/akad/:akadId` | All periods for an akad |
| GET | `/api/v1/profit-sharing/overdue` | All overdue periods |

### Audit
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/audit/akad/:akadId` | All events for an akad |

## Akad Lifecycle

```
PENDING → (all 3 signatures collected) → ACTIVE → COMPLETED
                                                 ↘ DEFAULTED
       ↘ CANCELLED
```

## Profit Sharing Flow

1. Backend creates period via `POST /api/v1/profit-sharing` when monthly cycle starts
2. UMKM submits revenue data (off-chain via FastAPI)
3. Backend calculates shares (using nisbah from akad), updates period
4. UMKM confirms payment → `POST /api/v1/profit-sharing/:id/pay`
5. Backend scheduler marks overdue periods via chaincode if not paid by dueDate
