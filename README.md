# BuzzyStores

BuzzyStores is an AI-assisted Local Commerce OS for vendor activation, QR storefronts, campaigns, orders, bookings, delivery coordination, CRM, analytics, and partner reporting.

This repository starts as a modular monolith. The code is split into apps and packages so the platform can ship simply now and later extract modules into services only when there is a clear operational reason.

## Workspace

```txt
apps/
  api/       NestJS REST API and modular domain controllers
  web/       Public marketplace and QR storefront entry point
  vendor/    Vendor dashboard
  admin/     Admin control tower
packages/
  database/  Prisma schema, PostgreSQL connection, seed data
  ui/        Shared React UI primitives
  types/     Shared platform enums and API types
  config/    Environment validation
  auth/      Roles and permission helpers
  ai/        AI provider abstraction and mock provider
  notifications/
  payments/
  utils/
docs/
infra/
scripts/
```

## Local Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy environment values:

   ```bash
   cp .env.example .env
   ```

3. Start local infrastructure:

   ```bash
   docker compose up -d
   ```

4. Generate Prisma and apply the first migration:

   ```bash
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed
   ```

5. Start apps:

   ```bash
   pnpm --filter @buzzystores/api dev
   pnpm --filter @buzzystores/web dev
   pnpm --filter @buzzystores/vendor dev
   pnpm --filter @buzzystores/admin dev
   ```

Default ports:

```txt
API:     http://localhost:4000/api
Swagger: http://localhost:4000/api/docs
Web:     http://localhost:3000
Vendor:  http://localhost:3001
Admin:   http://localhost:3002
```

## Vercel Deployment

This monorepo is standardized on pnpm. Vercel should use:

```bash
pnpm install --frozen-lockfile
pnpm build
```

Prefer one Vercel project per frontend app:

```txt
apps/web
apps/vendor
apps/admin
```

Each app needs:

```txt
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_APP_ENV
```

See [docs/deployment.md](docs/deployment.md) for app-specific settings.

## Phase 1 Scope

Implemented in this scaffold:

- Turborepo/pnpm monorepo structure
- TypeScript strict base config
- ESLint and Prettier config
- NestJS API scaffold with health, auth, users, vendors, lifecycle, catalog, orders, campaigns, AI, QR, notifications, and audit modules
- Role-based access guard scaffold
- PostgreSQL/PostGIS and Redis Docker Compose
- Prisma schema with the first foundation entities
- Seed data for a sample vendor, storefront, listing, campaign, QR code, order, AI output, notification, and audit log
- Next.js public, vendor, and admin apps
- Mock AI, payment, and notification provider abstractions
- Smoke tests that validate the scaffold shape without requiring dependency installation

## Phase 2 Scope

Phase 2 wires the vendor activation loop:

```txt
Vendor registration
→ lifecycle event
→ mock AI vendor intake draft
→ optional mock catalogue draft
→ AIJob and AIOutput persistence
→ vendor/admin review
→ admin vendor approval
→ storefront draft updated
→ deterministic QR short code ready for publishing
```

New API endpoints:

```txt
POST /api/vendors/register
GET  /api/vendors/:id/lifecycle

GET  /api/admin/ai-outputs
GET  /api/admin/ai-outputs/:id
POST /api/admin/ai-outputs/:id/approve
POST /api/admin/ai-outputs/:id/reject
POST /api/admin/vendors/:id/approve

GET  /api/vendor/me/ai-outputs
POST /api/vendor/ai-outputs/:id/approve
POST /api/vendor/ai-outputs/:id/request-changes
```

Local mock role headers for guarded endpoints:

```txt
x-user-id: <user id>
x-user-role: ADMIN | SUPER_ADMIN | VENDOR_OWNER | VENDOR_STAFF
```

New screens:

```txt
apps/vendor: /vendor/onboarding
apps/admin:  /admin/ai-review
apps/admin:  /admin/vendor-pipeline
apps/web:    /v/[shortCode]
apps/web:    /vendor/[vendorSlug]
```

AI approval policy:

- AI creates drafts only.
- Vendor approval means the vendor accepts the draft for admin review.
- Admin approval of an AI output does not automatically publish a storefront.
- Admin vendor approval moves the vendor to `PENDING_APPROVAL`, updates the storefront draft, and prepares QR data.
- Public routes hide unapproved/unpublished storefront content.

## Phase 3 Scope

Phase 3 proves the first transaction loop:

```txt
Admin publishes approved storefront
→ QR storefront is public
→ customer places a pickup order
→ vendor accepts/rejects/marks ready/completes
→ customer tracks status
→ completion triggers review request
```

New API endpoints:

```txt
POST /api/admin/vendors/:id/publish

GET  /api/admin/listings?status=AI_GENERATED
POST /api/admin/listings/:id/approve
POST /api/admin/listings/:id/reject
GET  /api/admin/orders

GET  /api/storefronts/vendor/:vendorSlug
GET  /api/storefronts/short/:shortCode

POST /api/orders
GET  /api/orders/:id/track

GET  /api/vendor/orders
POST /api/vendor/orders/:id/accept
POST /api/vendor/orders/:id/reject
POST /api/vendor/orders/:id/ready
POST /api/vendor/orders/:id/complete

POST /api/qr/:shortCode/scan
```

New UI routes:

```txt
apps/web:    /v/[shortCode]
apps/web:    /vendor/[vendorSlug]
apps/web:    /orders/[id]
apps/vendor: /vendor/orders
apps/admin:  /admin/orders
```

Storefront publishing rules:

- Vendor must be admin-approved or pending approval.
- Vendor must have a storefront with headline and description.
- Vendor must have at least one approved listing.
- Publishing transitions the vendor to `PUBLISHED`, writes lifecycle/audit records, prepares QR URLs, and records `VendorPublished`.

Pickup order rules:

- Phase 3 supports single-vendor `PICKUP` only.
- Listings must belong to the published vendor.
- Listings must be approved, published, and pickup-enabled.
- Payment is mocked with `PAYMENT_NOT_REQUIRED_FOR_PHASE_3`.
- Completing an order records `OrderCompleted`, creates a review request notification, records `ReviewRequested`, and can transition the vendor to `FIRST_ORDER_RECEIVED`.

## Phase 4 Scope

Phase 4 adds the first growth and retention loop:

```txt
AI campaign draft
→ vendor approval
→ admin approval
→ active public campaign
→ coupon-backed pickup order
→ customer CRM update
→ completed-order review
→ retention suggestions and health score
```

New API endpoints:

```txt
GET  /api/vendor/campaigns
POST /api/vendor/campaigns
POST /api/vendor/campaigns/generate
GET  /api/vendor/campaigns/:id
POST /api/vendor/campaigns/:id/approve
POST /api/vendor/campaigns/:id/pause
POST /api/vendor/campaigns/:id/end

GET  /api/admin/campaigns
GET  /api/admin/campaigns/:id
POST /api/admin/campaigns/:id/approve
POST /api/admin/campaigns/:id/reject
POST /api/admin/campaigns/:id/activate
POST /api/admin/campaigns/:id/pause

GET  /api/campaigns/:id/public
POST /api/orders/:id/review

GET  /api/vendor/customers
GET  /api/vendor/customers/:id
POST /api/vendor/customers/:id/tags
POST /api/vendor/customers/:id/notes
GET  /api/vendor/customers/retention-suggestions
GET  /api/vendor/health
```

New UI routes:

```txt
apps/vendor: /vendor/campaigns
apps/vendor: /vendor/campaigns/new
apps/vendor: /vendor/customers
apps/vendor: /vendor/customers/[id]
apps/vendor: /vendor/health
apps/admin:  /admin/campaigns
apps/admin:  /admin/campaigns/[id]
apps/web:    /campaigns/[id]
```

Campaign, CRM, coupon, and review policy:

- The mock campaign agent creates `AIJob`, `AIOutput`, and `Campaign` records with `AI_GENERATED` status.
- Vendors can approve, pause, or end only their own campaigns.
- Admin activation requires a published vendor storefront and public-approved listings.
- Only `ACTIVE` campaigns are returned to public campaign/storefront views.
- Coupons must belong to the order vendor, be active, be within date/usage limits, and meet the minimum order amount.
- Order creation creates or updates a vendor-scoped customer profile; completion increments order count and spend.
- Reviews require a `COMPLETED` order and are one per order.
- Vendor health combines storefront, listing, QR, order, cancellation, campaign, review, repeat-customer, and recency signals.

## Tests

Dependency-free scaffold smoke tests:

```bash
npm test
```

This now runs Phase 1-4 smoke tests.

After installing dependencies:

```bash
pnpm --filter @buzzystores/api test
pnpm --filter @buzzystores/api test:e2e
pnpm --filter @buzzystores/database test
```

The NestJS API includes a health service unit test and an e2e health check. The database package includes a mocked Prisma-compatible connection test.

## Architecture Notes

- AI outputs are drafts by default and require human approval before publishing.
- Payment code starts with a mock provider and a marketplace-ready interface, not custom fund splitting.
- Sensitive workflows should write audit logs and enforce admin/super-admin approval.
- Public marketplace checkout starts single-vendor; schema fields leave room for multi-vendor checkout later.
- Partner reporting should expose aggregated, approved data only.

## Known Limitations

- Authentication is still mock-header based for local development.
- AI providers are deterministic mocks and do not call external APIs.
- QR generation stores deterministic URLs and scan records, but does not render real QR images yet.
- Public/vendor/admin screens use typed API-client layers with mock fallbacks where runtime API fetches are not configured.
- Payments, delivery, multi-vendor checkout, real SMS/WhatsApp/email delivery, advanced loyalty points, and real AI calls are intentionally out of scope.

## Next Recommended Task

Phase 5 should focus on proper authentication, API integration hardening, runtime preview deployment, and a production-readiness baseline.
