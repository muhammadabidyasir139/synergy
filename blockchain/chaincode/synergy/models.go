package main

// AkadType represents the type of sharia contract
type AkadType string

const (
	AkadMusyarakah AkadType = "MUSYARAKAH"
	AkadMurabahah  AkadType = "MURABAHAH"
)

// AkadStatus tracks lifecycle of a sharia contract
type AkadStatus string

const (
	AkadPending   AkadStatus = "PENDING"
	AkadActive    AkadStatus = "ACTIVE"
	AkadCompleted AkadStatus = "COMPLETED"
	AkadDefaulted AkadStatus = "DEFAULTED"
	AkadCancelled AkadStatus = "CANCELLED"
)

// InvestmentStatus tracks the investment lifecycle
type InvestmentStatus string

const (
	InvestmentOngoing   InvestmentStatus = "ONGOING"
	InvestmentCompleted InvestmentStatus = "COMPLETED"
	InvestmentDefaulted InvestmentStatus = "DEFAULTED"
)

// ProfitSharingStatus tracks payment status per period
type ProfitSharingStatus string

const (
	ProfitSharingPending  ProfitSharingStatus = "PENDING"
	ProfitSharingPaid     ProfitSharingStatus = "PAID"
	ProfitSharingOverdue  ProfitSharingStatus = "OVERDUE"
)

// EventType for blockchain audit trail
type EventType string

const (
	EventDeploy        EventType = "DEPLOY"
	EventInvestment    EventType = "INVESTMENT"
	EventAkadSign      EventType = "AKAD_SIGN"
	EventAkadActivate  EventType = "AKAD_ACTIVATE"
	EventProfitSharing EventType = "PROFIT_SHARING"
	EventCompletion    EventType = "COMPLETION"
	EventDefaulted     EventType = "DEFAULTED"
	EventValidation    EventType = "VALIDATION"
)

// Akad is the on-chain sharia contract between investor and UMKM
type Akad struct {
	DocType          string     `json:"docType"`          // "akad" — for CouchDB rich queries
	ID               string     `json:"id"`
	CampaignID       string     `json:"campaignId"`
	InvestmentID     string     `json:"investmentId"`
	InvestorID       string     `json:"investorId"`
	UmkmID           string     `json:"umkmId"`
	AkadType         AkadType   `json:"akadType"`
	Status           AkadStatus `json:"status"`
	PrincipalAmount  float64    `json:"principalAmount"`
	NisbahInvestor   float64    `json:"nisbahInvestor"` // profit share ratio for investor (e.g. 0.7 = 70%)
	NisbahUmkm       float64    `json:"nisbahUmkm"`     // profit share ratio for UMKM
	PlatformFeeRate  float64    `json:"platformFeeRate"`
	DurationMonths   int        `json:"durationMonths"`
	StartDate        string     `json:"startDate"` // RFC3339
	EndDate          string     `json:"endDate"`
	UmkmSignedAt     string     `json:"umkmSignedAt"`
	InvestorSignedAt string     `json:"investorSignedAt"`
	ApprovedAt       string     `json:"approvedAt"`
	ApprovedBy       string     `json:"approvedBy"`
	DeployedAt       string     `json:"deployedAt"`
	CreatedAt        string     `json:"createdAt"`
	UpdatedAt        string     `json:"updatedAt"`
}

// Investment represents an investor funding a campaign, recorded on-chain
type Investment struct {
	DocType          string           `json:"docType"` // "investment"
	ID               string           `json:"id"`
	InvestorID       string           `json:"investorId"`
	CampaignID       string           `json:"campaignId"`
	UmkmID           string           `json:"umkmId"`
	Amount           float64          `json:"amount"`
	AkadType         AkadType         `json:"akadType"`
	Status           InvestmentStatus `json:"status"`
	AkadID           string           `json:"akadId"` // linked after akad is created
	CreatedAt        string           `json:"createdAt"`
	UpdatedAt        string           `json:"updatedAt"`
}

// ProfitSharing records one profit-sharing period between investor and UMKM
type ProfitSharing struct {
	DocType       string              `json:"docType"` // "profitSharing"
	ID            string              `json:"id"`
	AkadID        string              `json:"akadId"`
	InvestmentID  string              `json:"investmentId"`
	InvestorID    string              `json:"investorId"`
	UmkmID        string              `json:"umkmId"`
	PeriodStart   string              `json:"periodStart"`
	PeriodEnd     string              `json:"periodEnd"`
	DueDate       string              `json:"dueDate"`
	GrossRevenue  float64             `json:"grossRevenue"`
	InvestorShare float64             `json:"investorShare"`
	UmkmShare     float64             `json:"umkmShare"`
	PlatformFee   float64             `json:"platformFee"`
	Status        ProfitSharingStatus `json:"status"`
	PaidAt        string              `json:"paidAt"`
	TxHash        string              `json:"txHash"` // blockchain tx that recorded payment
	CreatedAt     string              `json:"createdAt"`
	UpdatedAt     string              `json:"updatedAt"`
}

// BlockchainEvent is an immutable audit record for every major event
type BlockchainEvent struct {
	DocType     string    `json:"docType"` // "blockchainEvent"
	ID          string    `json:"id"`
	TxID        string    `json:"txId"`       // Fabric transaction ID
	AkadID      string    `json:"akadId"`
	EventType   EventType `json:"eventType"`
	RelatedID   string    `json:"relatedId"`   // ID of Investment / ProfitSharing / etc.
	ActorID     string    `json:"actorId"`     // who triggered the event
	Description string    `json:"description"`
	RawData     string    `json:"rawData"`     // JSON snapshot of the entity at event time
	Timestamp   string    `json:"timestamp"`
}

// Query result wrappers
type QueryResult[T any] struct {
	Key    string `json:"key"`
	Record T      `json:"record"`
}
