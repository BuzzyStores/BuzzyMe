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

Planned modules from the clean-sheet architecture:

```txt
bookings
payments
payouts
logistics
crm
reviews
support
analytics
admin
partners
```

Each production module should keep controllers thin, put workflow logic in services, validate incoming DTOs, enforce roles at the boundary, and write audit logs for sensitive changes.
