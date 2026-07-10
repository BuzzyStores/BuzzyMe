# Domain Modules

The API scaffold includes these Phase 1 modules:

```txt
auth
users
vendors
vendor-lifecycle
catalog
orders
campaigns
ai
qr
notifications
audit
health
```

Phase 2 adds:

```txt
admin
vendor-portal
```

Phase 3 adds:

```txt
events
storefronts
```

Phase 4 upgrades existing modules instead of introducing services:

```txt
campaigns
orders
vendor-portal
admin
storefronts
ai
events
notifications
audit
```

Phase 2 also upgrades:

- `vendors` with `POST /vendors/register` and lifecycle timeline access
- `vendor-lifecycle` with transition and event creation methods
- `ai` with persisted AIJob and AIOutput draft generation
- `audit` schema support for actor roles and metadata

Phase 3 upgrades:

- `admin` with vendor publishing, listing approval, and order monitoring
- `orders` with single-vendor pickup creation, vendor status transitions, safe tracking, notifications, and review request events
- `qr` with scan tracking
- `storefronts` with public published-only storefront responses
- `events` with a lightweight database-backed platform event publisher

Phase 4 upgrades:

- `campaigns` with AI draft generation, vendor approval, admin approval, activation, pause/end, active-only public reads, and coupon creation
- `orders` with coupon validation/application, customer profile updates, campaign order metrics, and one-review-per-completed-order submission
- `vendor-portal` with campaign management, vendor-scoped customer CRM, retention suggestions, and health scoring
- `admin` with campaign review, rejection, activation, and pause controls
- `storefronts` with active campaign banners, offer labels, rating summaries, and approved reviews
- `ai` with a deterministic mock campaign draft agent
- `events`, `notifications`, and `audit` with Phase 4 actions such as `CampaignActivated`, `CouponApplied`, `ReviewSubmitted`, and `VendorHealthScoreUpdated`

Planned modules from the clean-sheet architecture:

```txt
bookings
payments
payouts
logistics
support
analytics
admin
partners
```

Each production module should keep controllers thin, put workflow logic in services, validate incoming DTOs, enforce roles at the boundary, and write audit logs for sensitive changes.
