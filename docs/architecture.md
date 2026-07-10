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
