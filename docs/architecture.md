# BuzzyStores Architecture

## Style

BuzzyStores starts as a modular monolith:

- API-first REST boundary
- PostgreSQL-first persistence
- event-driven workflow hooks
- human approval gates for AI and sensitive operations
- strict role-based access control
- provider abstractions for AI, payments, and notifications

The module boundaries in `apps/api/src/modules` are intentionally close to eventual service boundaries. The first implementation should keep shared transactions and local development simple.

## Core Flow

```mermaid
flowchart LR
  Lead["Vendor lead"] --> Intake["Vendor intake"]
  Intake --> AIDraft["AI drafts profile/listings"]
  AIDraft --> VendorReview["Vendor review"]
  VendorReview --> AdminApproval["Admin approval"]
  AdminApproval --> Storefront["Published storefront"]
  Storefront --> QR["QR generated"]
  QR --> Campaign["First campaign draft"]
  Storefront --> Order["Customer order"]
  Order --> Health["Health score and analytics"]
```

## Approval Policy

AI can create drafts, summarize, translate, classify, and recommend. AI cannot publish listings, approve vendors, refund money, suspend accounts, alter payouts, or make compliance decisions.

## Event Hooks

The foundation has not wired BullMQ yet, but modules should emit durable events for:

- vendor lifecycle changes
- AI job completion
- listing approval/publishing
- QR generation and scan analytics
- order status transitions
- review requests
- payout/refund workflows
- support escalations

Phase 2 should introduce a lightweight event publisher before controllers start accumulating workflow logic.

## Phase 2 Activation Flow

The Phase 2 implementation keeps lifecycle movement explicit:

```mermaid
sequenceDiagram
  participant Vendor
  participant API
  participant DB
  participant AI as Mock AI
  participant Admin

  Vendor->>API: POST /api/vendors/register
  API->>DB: upsert owner, create vendor/storefront
  API->>DB: create VendorLifecycleEvent
  API->>AI: vendor-intake draft
  API->>DB: create AIJob and AIOutput
  API->>AI: catalogue-builder draft when productText exists
  API->>DB: create AIOutput and AI-generated Listing drafts
  Vendor->>API: approve/request changes on drafts
  Admin->>API: approve/reject AI outputs
  Admin->>API: approve vendor activation draft
  API->>DB: update storefront draft, create QR record, write audit logs
```

Admin approval moves the vendor to `PENDING_APPROVAL`. Public storefront publishing remains a separate Phase 3 action so AI-generated content is never exposed before approval and publishing.

## Phase 3 Transaction Flow

```mermaid
sequenceDiagram
  participant Admin
  participant API
  participant QR
  participant Customer
  participant Vendor
  participant DB

  Admin->>API: POST /api/admin/vendors/:id/publish
  API->>DB: publish storefront, lifecycle event, audit log
  API->>DB: PlatformEvent VendorPublished
  Customer->>QR: visit /v/[shortCode]
  QR->>API: POST /api/qr/:shortCode/scan
  Customer->>API: POST /api/orders
  API->>DB: create order and order items
  API->>DB: PlatformEvent OrderPlaced
  API->>Vendor: mock notification
  Vendor->>API: accept/ready/complete
  API->>DB: status events and notifications
  API->>Customer: review request notification
```

The first checkout is deliberately single-vendor pickup only. Payment status is stored as mock metadata, not processed by a provider.

## Phase 4 Growth Flow

```mermaid
sequenceDiagram
  participant Vendor
  participant API
  participant AI as Mock AI
  participant Admin
  participant Customer
  participant DB

  Vendor->>API: POST /api/vendor/campaigns/generate
  API->>AI: deterministic campaign draft
  API->>DB: AIJob, AIOutput, Campaign(AI_GENERATED)
  Vendor->>API: POST /api/vendor/campaigns/:id/approve
  API->>DB: Campaign(VENDOR_APPROVED), audit, event
  Admin->>API: approve and activate campaign
  API->>DB: Campaign(ACTIVE), Coupon, CampaignActivated
  Customer->>API: POST /api/orders with couponCode
  API->>DB: validate coupon, discount order, CouponApplied
  API->>DB: create/update VendorCustomerProfile
  Vendor->>API: complete order
  API->>DB: increment CRM order count and spend
  Customer->>API: POST /api/orders/:id/review
  API->>DB: ReviewSubmitted, rating summary
  Vendor->>API: GET /api/vendor/customers/retention-suggestions
  Vendor->>API: GET /api/vendor/health
```

Phase 4 keeps campaign publishing human-gated. The public web app receives active campaigns only, and unpublished storefronts still return the safe placeholder. Coupon validation is intentionally simple: vendor ownership, active flag, date window, usage limit, campaign active state, and minimum order amount.

Vendor health is a lightweight operational score, not a financial ledger. It combines published storefront status, approved listings, QR scan count, received/completed orders, cancellation/rejection rate, active campaigns, reviews, repeat customers, and days since last order. The next production pass should harden authentication and replace mock fallbacks with fully authenticated API sessions.
