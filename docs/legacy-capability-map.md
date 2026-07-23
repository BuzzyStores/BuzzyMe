# Legacy Capability Map

Updated: 2026-07-23

This document preserves business knowledge from the legacy BuzzyStores admin, customer order, driver dispatch, and partner-site surfaces. It is not an implementation plan for copying legacy architecture or code.

## Guardrails

- Do not copy legacy PHP, React Native, Royo, Redux, route, database, or provider-specific code into the rebuild.
- Preserve business capabilities and operational intent, then rebuild them inside the modular monolith boundaries.
- Keep `LocalBusinessProspect` strictly separate from `Vendor`; prospecting remains admin-only until a consent-based vendor application is created.
- Keep AI output, campaign, storefront, listing, and prospect content draft-only until the appropriate human approval gate is passed.
- Keep payments, delivery providers, notifications, and AI behind provider abstractions.

## Sources Inspected

- `BuzzyStores/order_app`
  - README: customer React Native app for catalog browsing, ordering, and live delivery tracking.
  - `package.json`: OTP/social auth, payments, maps, realtime sockets, push notifications, reviews/ratings, printers, sharing, localization, support chat, and extensive native UI dependencies.
  - `.env.example`: API base URL, socket URL, Google Maps, Stripe, Razorpay, Facebook SDK, CodePush, and Sentry placeholders.
- `BuzzyStores/dispatch_app`
  - README: React Native driver/courier app for receiving, managing, and executing deliveries.
  - `package.json`: background geolocation, maps/directions, task workflows, QR scanning, signature capture, push notifications, payments/wallet-adjacent dependencies, support chat, and identity/face verification dependencies.
  - `.env.example`: API base URL, socket URL, Google Maps, Firebase, Stripe, CodePush, and Sentry placeholders.
- `BuzzyStores/buzzy-store_partner-site`
  - README: WordPress/PHP partner website plus hardened administrative CMS panel.
  - `.env.example`: admin credentials, Google service account, Google Analytics.
  - `api-smoke-tests.postman.json`: partner homepage, admin login, auth endpoints, task list/history, wallet, payout, update status, accept/reject task, CMS content, payment options, subscription plans, agent delete, HTTPS, and security-header checks.
- Current `BuzzyStores/BuzzyMe` rebuild
  - Local monorepo docs, Prisma schema, API modules, admin/vendor/web routes, and smoke-test inventory.
  - Current state includes Phase 1 through Phase 4 surfaces plus an in-progress admin-only local business prospecting layer in this workspace.

## Status Legend

- `already built`: The rebuild has a working first-pass implementation.
- `partially built`: A foundation exists, but the legacy capability is broader than the current rebuild.
- `planned`: The clean-sheet architecture already has a clear place for it, but it is not implemented yet.
- `missing`: No meaningful rebuild support yet.
- `deprecated`: Preserve the business lesson only; do not rebuild the legacy mechanism directly.

## Admin Capability Map

| Legacy capability | Business intent | Recommended owner | Rebuild status | Rebuild mapping and notes | Do-not-copy / tech-debt flags |
| --- | --- | --- | --- | --- | --- |
| Dashboard | Operational overview for orders, vendors, campaigns, delivery, finance, and alerts. | Admin Control Tower | partially built | Admin shell and focused pages exist for AI review, vendor pipeline, orders, campaigns, and recruitment. Needs consolidated metrics and alerting. | Do not copy a monolithic dashboard with mixed SQL/view logic. |
| Orders | Search, monitor, and intervene in customer orders. | Orders & Fulfilment | partially built | Phase 3 added single-vendor pickup orders, tracking, admin order list, and vendor order actions. Delivery, payment, refunds, disputes, and multi-vendor checkout are not built. | Do not import old order status endpoints directly; normalize into the `OrderStatus` workflow. |
| Vendors | Vendor management, approval, lifecycle visibility, and operational support. | Vendor Activation | already built | Phase 2 and Phase 3 added vendor registration, lifecycle events, AI drafts, approval, publishing, and QR readiness. | Keep vendor lifecycle event writes mandatory; no silent status updates. |
| Vendor pipeline | Move businesses through activation stages rather than collecting signups. | Vendor Activation | already built | `VendorLifecycleStage`, `VendorLifecycleEvent`, admin pipeline, and approval flows exist. | Do not collapse prospects and vendors into one table. |
| Local business recruitment | Discover and qualify businesses before they become vendors. | Local Business Prospecting | partially built | Admin-only prospecting layer exists locally with zones, prospects, scoring, outreach drafts, attempts, and consent-gated vendor application conversion. | Never expose `LocalBusinessProspect` in public/vendor/customer APIs. |
| Accounting | Summaries for revenue, fees, settlement, credits, and operational finance. | Finance | missing | Orders store totals and coupon discounts, but there is no ledger, reconciliation, payout, invoice, refund, or accounting module. | Do not copy ad hoc accounting calculations from admin screens. Build ledger-first. |
| Subscriptions | Plans or recurring charges for vendors, drivers, or services. | Finance | missing | Legacy smoke tests reference driver subscription plans. Rebuild has no subscription model. | Avoid tying subscriptions directly to legacy driver endpoints. |
| Customers | Admin/customer visibility and support context. | Customers & CRM | partially built | Phase 4 added vendor-scoped `VendorCustomerProfile`, retention suggestions, and basic customer updates. Admin-wide CRM and privacy tools are still missing. | Keep vendor customer data scoped per vendor; avoid global leakage. |
| Reports | Performance reports for vendors, orders, marketing, delivery, and finance. | Reports & Analytics | planned | Health score, campaign counters, QR scans, and events provide a base. Reporting dashboards and export jobs are not built. | Do not copy report SQL into controllers. Use read models or analytics services. |
| Admin service area | Geographic operating/service-area setup. | Delivery & Service Areas | planned | Prospecting zones and listing location eligibility exist. True delivery/service-area rules are not implemented. | Do not let recruitment zones become delivery eligibility rules. |
| Profile | Admin or staff account profile settings. | Platform Settings | missing | User model exists; no profile management UI/API beyond scaffold `users/me`. | Do not reuse PHP session profile handling. |
| Customize | Marketplace/vendor storefront customization. | Platform Settings | planned | Storefront headline/descriptions exist. Theme, layout, modules, and tenant-level customization are not implemented. | Avoid per-page hardcoded styling overrides. |
| Styling | Brand/theme controls. | Platform Settings | missing | Shared UI package exists, but no admin theme editor. | Do not copy legacy CSS/theme sprawl into the design system. |
| CMS | Manage public/marketing content and policy pages. | Platform Settings | missing | Legacy public smoke tests reference `cmscontent`; rebuild has no CMS model/API. | Do not copy WordPress/PHP CMS internals. Use a clean CMS/content model or external CMS integration. |
| Catalog | Categories, listings, services, variants, availability, and approval. | Catalog & Services | partially built | `Category` and `Listing` models support multiple listing types, approval, publication, availability, pickup/delivery/booking/rental flags, and AI draft metadata. Admin catalog tooling is still narrow. | Do not copy legacy category/product shape without mapping to listing types. |
| Configurations | Platform feature flags and operational settings. | Platform Settings | planned | `packages/config` validates environment. No admin-managed configuration store exists. | Avoid runtime config hidden in PHP files or mobile constants. |
| Tax | Tax configuration and calculations. | Finance | missing | No tax-rate or tax-line model exists. | Do not bake tax into order totals without auditable tax lines. |
| Payment options | Configure available payment methods. | Finance | planned | Mock payment provider abstraction exists. No real providers or admin payment method configuration. | Do not put Stripe/Razorpay/Flutterwave SDK details in core order logic. |
| Manage delivery | Delivery modes, fees, assignment, zones, provider rules, and tracking. | Delivery & Service Areas | planned | Order/listing enums include delivery states and flags. No dispatch assignment or delivery pricing engine. | Do not copy old driver API route names or typoed endpoints. |
| Manage roles | Staff roles and permissions. | Trust, Roles & Audit | partially built | `UserRole`, role guards, and mock headers exist. Production auth, fine-grained permissions, and admin role management are not built. | Do not reuse PHP session auth or client-trusted role checks. |
| Cache control | Operational cache flush/rebuild controls. | Platform Settings | deprecated | No cache-control surface exists. Most current data is DB-backed; Redis is scaffolded. | Avoid broad "flush all" admin tools unless scoped and audited. |
| Rental protection | Deposits, damage protection, guarantees, and rental policy support. | Finance | planned | `ListingType.RENTAL_ITEM`, `OrderType.RENTAL`, and listing rental flags exist. No rental protection policy, deposit, claim, or payout flow. | Do not mix rental protection into generic order notes. |
| Booking option | Appointment/service booking settings. | Bookings | planned | `ListingType.BOOKABLE_APPOINTMENT`, `OrderType.BOOKING`, and duration fields exist. No scheduler, calendar, availability engine, or booking lifecycle. | Do not use free-text opening hours as booking availability. |
| Destination | Delivery destinations, service destinations, or travel/location eligibility. | Delivery & Service Areas | planned | Listing `locationEligibility`, vendor address/city/country, and prospecting geo zones exist. No destination model. | Clarify domain meaning before implementation. |
| Banners | Public and vendor promotion banners. | Marketing & Campaigns | missing | Active campaign banners appear on storefronts, but no standalone banner CMS. | Do not copy static banner upload logic without approval and expiry rules. |
| Promocode | Discount codes and promotional redemption. | Marketing & Campaigns | partially built | Phase 4 added `Coupon`, campaign coupon fields, order discount validation, and coupon usage events. Advanced stacking, customer targeting, and admin generation are not built. | Keep coupon validation server-side and vendor-scoped. |
| Loyalty cards | Repeat-purchase loyalty programs. | Marketing & Campaigns | planned | CRM segments and campaigns can support future loyalty. No cards, stamps, points, or balances. | Avoid complex points accounting before finance foundations exist. |
| Campaigns | Vendor/admin marketing campaigns. | Marketing & Campaigns | already built | Phase 4 added AI campaign drafts, vendor approval, admin approval/activation, active public campaign pages, and storefront campaign banners. | Do not expose draft/inactive campaign content publicly. |
| Tools | Admin utilities, diagnostics, operational actions. | Platform Settings | planned | Health endpoints and smoke tests exist. No admin tools area. | Every destructive tool must be scoped, rate-limited, and audited. |
| DB audit logs | Audit trail for sensitive actions. | Trust, Roles & Audit | partially built | `AuditLog` model/service/controller exist and sensitive workflows write logs. Needs viewer, filters, retention policy, and immutable storage posture. | Do not allow arbitrary DB mutation through audit tooling. |

## Customer Order App Capability Map

| Legacy capability | Business intent | Recommended owner | Rebuild status | Rebuild mapping and notes | Do-not-copy / tech-debt flags |
| --- | --- | --- | --- | --- | --- |
| Customer signup/login | Let customers identify themselves and track orders. | Trust, Roles & Audit | partially built | User model and auth scaffold exist, but production sessions, OTP, social login, password recovery, and account lifecycle are missing. | Do not copy legacy mobile auth flows or trust client-side tokens. |
| OTP verification | Phone-first customer/vendor access. | Trust, Roles & Audit | planned | Legacy smoke tests reference `sendOtp`; rebuild has no OTP provider. | Implement through notifications/auth provider abstractions. |
| Social login | Apple/Google/Facebook login for customers. | Trust, Roles & Audit | planned | Not implemented. | Avoid embedding app-specific SDK assumptions in shared auth. |
| Catalog browsing | Browse vendor menus/products/services. | Catalog & Services | partially built | Public storefront routes show approved/published listings for published vendors. Marketplace discovery/search is not built. | Do not expose unapproved AI-generated listings. |
| Category filters and search | Help customers find relevant items quickly. | Catalog & Services | missing | Category model exists, but no public search/filter experience. | Avoid old mobile-specific filter state patterns. |
| Listing detail | Show price, description, images, options, variants, availability. | Catalog & Services | partially built | Listing fields support descriptions, image URLs, variants, availability, and type flags. Public UI is basic. | Normalize variants instead of parsing legacy option payloads blindly. |
| Cart/order builder | Build an order before submission. | Orders & Fulfilment | partially built | Phase 3 supports a simple single-vendor pickup order panel. Cart persistence, multi-item UX depth, delivery, and multi-vendor checkout are missing. | Keep Phase 3 single-vendor constraint until checkout is hardened. |
| Pickup order | Customer places a pickup order. | Orders & Fulfilment | already built | Public order creation supports published listings and pickup flow. | Payment remains mocked by design. |
| Delivery order | Customer requests delivery. | Delivery & Service Areas | planned | Schema has delivery order states/flags, but no delivery pricing, address validation, or dispatch assignment. | Do not copy legacy delivery provider coupling. |
| Live order tracking | Customer sees order status, driver movement, and updates. | Orders & Fulfilment | partially built | Public order tracking exists for order status. Realtime sockets and driver GPS are not built. | Rebuild realtime events through a deliberate event channel. |
| Push notifications | Notify customer about status, campaigns, and review requests. | Platform Settings | partially built | Mock notification provider and notification records exist. No real push/email/SMS provider. | Do not couple business workflows to Firebase/Notifee directly. |
| Coupons | Apply promotion codes at order time. | Marketing & Campaigns | partially built | Basic coupon validation and discount application exist. | Do not allow client-side discount calculations to be authoritative. |
| Payment cards and wallets | Collect payments through Stripe/Razorpay/Flutterwave. | Finance | planned | Payment abstraction exists, but real payment collection is intentionally not implemented. | Do not embed multiple payment SDKs in checkout core. |
| Customer order history | Let customers view previous orders. | Customers & CRM | missing | Vendor CRM stores customer profiles; customer-facing account/order history is not built. | Keep customer privacy and vendor scoping explicit. |
| Reviews and ratings | Capture post-order trust signals. | Trust, Roles & Audit | partially built | Phase 4 added completed-order review submission and storefront rating display. Moderation tooling is not mature. | Do not allow duplicate or pre-completion reviews. |
| Support chat | Customer support and vendor/customer messaging. | Admin Control Tower | planned | No support module; legacy dependencies include chat/support surfaces. | Avoid third-party chat SDK leakage into domain services. |
| Maps and address autocomplete | Improve delivery/pickup address accuracy. | Delivery & Service Areas | planned | Prospecting provider has server-side Places abstraction; public order address validation is not built. | Keep API keys server-side where possible. |
| Localization | Support multiple languages and locales. | Platform Settings | partially built | Vendor preferred language and AI language hints exist. No full i18n framework across apps. | Avoid string constants scattered through apps. |
| Sharing/deep links | Share storefronts, campaigns, and order links. | Marketing & Campaigns | partially built | QR short codes and public storefront/campaign URLs exist. Native deep links are not built. | Do not make private order URLs guessable. |
| Receipt or kitchen printing | Print order receipts on vendor hardware. | Orders & Fulfilment | planned | Legacy order app included printer dependencies; rebuild has no print job module. | Treat as vendor/POS feature, not customer app logic. |
| App updates/CodePush | Ship mobile JS updates. | Platform Settings | deprecated | Current rebuild is web-first. Native app update strategy is out of scope. | CodePush is explicitly marked deprecated in legacy env templates. |
| Crash monitoring | Observe production app failures. | Platform Settings | planned | No Sentry integration. | Add observability as platform infrastructure, not per-screen code. |

## Dispatch App Capability Map

| Legacy capability | Business intent | Recommended owner | Rebuild status | Rebuild mapping and notes | Do-not-copy / tech-debt flags |
| --- | --- | --- | --- | --- | --- |
| Driver login and identity | Authenticate couriers and control driver access. | Trust, Roles & Audit | planned | `UserRole.DRIVER` exists. No driver onboarding/session flow. | Do not copy legacy OTP/session implementation. |
| Driver task list | Show assigned/available delivery jobs. | Delivery & Service Areas | missing | Legacy smoke tests reference `taskList`. No dispatch task model exists. | Do not reuse `task` as an ambiguous catch-all; model delivery jobs explicitly. |
| Task history | Driver delivery history and earnings context. | Delivery & Service Areas | missing | Legacy smoke tests reference `task/history`. No delivery history module. | Separate delivery status history from payout history. |
| Accept/reject task | Courier accepts or rejects delivery assignment. | Delivery & Service Areas | missing | Legacy smoke tests reference `task/accecpt/reject`. No assignment workflow exists. | Do not preserve misspelled route names or ambiguous payloads. |
| Update delivery status | Driver updates pickup, en route, delivered, failed. | Delivery & Service Areas | planned | `OrderStatus` has driver/delivery states, but no driver endpoint or proof rules. | Do not let delivery updates bypass order workflow and audit/event logging. |
| Background GPS | Track courier location while delivering. | Delivery & Service Areas | planned | No location stream/storage model. | Build privacy, consent, retention, and battery-aware rules first. |
| Maps and route directions | Navigate to vendor/customer destinations. | Delivery & Service Areas | planned | No routing integration. | Keep maps provider replaceable. |
| QR scanning | Verify pickup/dropoff or assignment. | Orders & Fulfilment | partially built | QR short-code and scan tracking exist for storefront visits. Dispatch QR verification is missing. | Keep marketing scans separate from fulfilment verification scans. |
| Signature capture | Proof of delivery/completion. | Delivery & Service Areas | missing | No proof-of-delivery model. | Do not store raw signatures without retention and privacy policy. |
| Driver wallet | Show driver balance and transaction details. | Finance | missing | Legacy smoke tests reference `agent/transaction/details`; rebuild has no wallet/ledger. | Build after ledger/payout primitives exist. |
| Driver payouts | Track payout details and settlement. | Finance | missing | Legacy smoke tests reference `agent/payout/details`; rebuild has no payout system. | Do not calculate payouts from mutable order totals directly. |
| Driver subscriptions | Paid driver plans or access tiers. | Finance | missing | Legacy smoke tests reference `driver/subscription/plans`. Domain meaning needs confirmation. | Clarify whether this applies to drivers, vendors, or customers before building. |
| Push notifications | Dispatch assignment and status alerts. | Delivery & Service Areas | planned | Mock notifications exist globally. No driver push channel. | Keep provider-specific Firebase calls outside domain services. |
| Face verification | Driver identity/compliance check. | Trust, Roles & Audit | planned | Legacy dependency signals this capability. Rebuild has no KYC/identity module. | Requires explicit compliance/privacy design before implementation. |
| Driver support/chat | Help couriers resolve delivery exceptions. | Admin Control Tower | planned | No support workflows. | Avoid embedding Zendesk/chat SDK in core modules. |

## Partner Site Capability Map

| Legacy capability | Business intent | Recommended owner | Rebuild status | Rebuild mapping and notes | Do-not-copy / tech-debt flags |
| --- | --- | --- | --- | --- | --- |
| Public partner website | Explain BuzzyStores and recruit partners/vendors. | Local Business Prospecting | planned | Current `apps/web` is public storefront-first. Dedicated partner/marketing pages are not implemented. | Do not copy WordPress theme or PHP templates directly. |
| Admin login hardening | Secure admin entry point with CSRF, session timeout, rate limiting, and secure cookies. | Trust, Roles & Audit | partially built | Rebuild has role guards and mock auth only. Security standards should be carried forward into production auth. | Do not reuse PHP session code; keep the principles. |
| Security smoke tests | Verify site availability, security headers, and basic endpoint contracts. | Platform Settings | partially built | Rebuild has dependency-free smoke tests. Deployment/security checks need expansion. | Keep tests lightweight but do not accept legacy "500 means alive" behavior. |
| CMS content endpoint | Serve public content to apps and web. | Platform Settings | missing | No CMS/content module exists. | Do not couple CMS reads to dispatch API compatibility endpoints. |
| Payment options endpoint | Expose available payment methods. | Finance | planned | Payment abstraction exists, not payment options API. | Must be admin-configured and environment-aware. |
| Subscription plans endpoint | Expose plan catalog. | Finance | missing | No plan catalog. | Needs product/role ownership clarity. |
| Agent delete endpoint | Remove/deactivate driver or agent accounts. | Trust, Roles & Audit | planned | User deletion/deactivation is not built. | Avoid hard deletes for operational actors; prefer deactivation and audit. |
| Google Analytics | Track marketing-site traffic. | Reports & Analytics | planned | No analytics provider integration. QR scans and campaign counters exist. | Keep analytics consent/privacy explicit. |
| One.com/Bitbucket pipeline workflow | Deploy legacy PHP site and run Newman tests. | Platform Settings | deprecated | Rebuild targets pnpm/Turborepo/Vercel-compatible apps. | Do not preserve legacy hosting topology. |

## Current Rebuild Coverage By Target Domain

| New architecture area | Current coverage | Capability gaps to keep visible |
| --- | --- | --- |
| Admin Control Tower | Admin pages for AI review, vendor pipeline, orders, campaigns, and local recruitment exist. | Unified command center, alerts, support workflows, operational search, staff profile management. |
| Vendor Activation | Vendor registration, lifecycle events, AI intake/catalog drafts, vendor/admin review, approval, publishing, QR readiness. | Real auth, consent capture, document verification, vendor self-service completeness tracking. |
| Local Business Prospecting | Admin-only prospect zones, discovery, classification, scoring, outreach drafts, attempts, status history, consent-gated conversion exist locally. | Real Places integration hardening, import/export, duplicate resolution UI, compliance review. |
| Orders & Fulfilment | Single-vendor pickup order creation, vendor actions, tracking, order events, review request. | Delivery, payment, refunds, cancellations/disputes, proof of fulfilment, POS/printing. |
| Catalog & Services | Categories/listings, approval/publishing, listing types for product/service/booking/rental/circular/diaspora. | Rich variants, inventory, service options, booking availability, rental deposits, admin catalog bulk tools. |
| Bookings | Schema intent only. | Calendar, slots, booking order lifecycle, reminders, cancellation windows. |
| Delivery & Service Areas | Enums/flags and prospecting geo zones only. | Delivery service areas, fees, dispatch jobs, driver app/API, GPS, route tracking, proof of delivery. |
| Marketing & Campaigns | Campaign engine, AI campaign drafts, approval/activation, coupons, public active campaign pages, storefront banners. | Loyalty cards, standalone banners, scheduling engine, campaign analytics, outbound sends. |
| Customers & CRM | Vendor-scoped customer profiles, tags/notes, retention suggestions, review capture. | Customer-facing account history, consent center, admin-wide support CRM, privacy exports/deletion. |
| Finance | Order totals and coupon discounts; mock payments package exists. | Payments, payouts, accounting ledger, fees, tax, invoices, subscriptions, refunds, wallets. |
| Reports & Analytics | QR scan counts, campaign counters, vendor health score, platform events. | Dashboards, cohorts, exports, partner reporting, financial reports, operational SLA metrics. |
| Platform Settings | Environment validation, docs, Vercel deployment guidance, health checks. | Admin-managed settings, CMS, theme/styling, cache controls, localization admin, observability. |
| Trust, Roles & Audit | Role enum, guards, audit logs, lifecycle/event records, admin approval gates. | Real sessions, granular permissions, staff role UI, audit log viewer, retention, compliance policies. |

## Capabilities To Deprecate Or Rebuild Differently

- Legacy Royo endpoint contracts such as `task/accecpt/reject`, `updateStatus`, and broad `agent/*` routes should not define the new API. Preserve the workflow ideas, not the route names or payloads.
- Legacy React Native apps use large dependency surfaces and provider SDKs directly in the client. The rebuild should keep domain workflows on the API and keep providers behind abstractions.
- CodePush is marked deprecated in the legacy mobile environment templates. Do not plan new work around it.
- The WordPress/PHP admin CMS should not be copied. Preserve security standards such as CSRF protection, timeouts, secure cookies, and rate limiting.
- Legacy smoke tests allowed some unauthenticated endpoints to return server errors as "alive". New tests should require correct 401/403/validation behavior.
- Any direct database admin utility must be replaced with explicit service methods, role checks, audit logs, and scoped operations.
- Recruitment data must never become public marketplace content without explicit consent and conversion into the vendor onboarding flow.
- Marketing banners, CMS content, and campaign content must follow the same approval and publication rules as listings/storefronts.
- Payment, wallet, payout, subscription, tax, and refund logic should be ledger-backed instead of scattered across order/admin screens.

## Phase Recommendations

### Phase 5: Production Readiness And Trust Baseline

Implement the capabilities that reduce operational risk before expanding into payments or delivery:

- Real authentication/session model for admin, vendor, customer, recruitment, and future driver roles.
- Granular permissions and staff role management to replace mock role headers.
- Audit log viewer, filters, and sensitive-action coverage review.
- API integration hardening across admin/vendor/web apps, removing mock fallback paths where production data is expected.
- Environment/deployment hardening, observability, health checks, and Vercel project separation.
- Admin settings baseline for platform configuration, feature flags, CMS stub, payment-option placeholders, and notification provider configuration.
- Privacy and consent baseline for customer CRM, recruitment outreach, reviews, and future location tracking.

### Phase 6: Finance, Catalog, And Service-Area Foundations

Build the foundations needed before advanced commerce and dispatch:

- Finance ledger primitives: order totals, fees, taxes, discounts, refunds, settlements, payouts, and reporting-safe transaction records.
- Payment options management and one real payment provider integration behind the existing payment abstraction.
- Tax configuration and auditable order tax lines.
- Vendor subscription/plan catalog if the business model requires it.
- Admin catalog bulk tools, richer variants, inventory, service options, and listing moderation.
- Delivery/service-area model, delivery fee rules, destination eligibility, and vendor delivery settings.
- Reporting dashboards for orders, vendors, campaigns, QR scans, customer retention, and finance.

### Later Phases

Defer capabilities that need the above foundations or dedicated product design:

- Driver dispatch app/API, delivery task assignment, background GPS, route tracking, proof of delivery, driver wallet, and payouts.
- Booking scheduler, calendar integrations, appointment reminders, booking cancellation policies, and service deposits.
- Rental protection, deposits, claims, and rental dispute workflows.
- Loyalty cards, points/stamps, customer rewards wallet, and advanced promotion stacking.
- Full CMS, banners, theme/styling customization, localization management, and partner marketing site.
- Native customer and driver apps, deep links, push notifications, app store release workflows, and crash monitoring.
- Advanced analytics, partner reporting, exports, SLA dashboards, and anomaly detection.

## Final Recommendation

Use the legacy systems as a capability inventory, not a source-code source. Phase 5 should harden trust, auth, audit, deployment, and API integration because nearly every legacy capability depends on those foundations. Phase 6 should add finance, catalog depth, and delivery/service-area primitives. Dispatch, native apps, bookings, rentals, loyalty, and advanced reporting should come later once the rebuild has a stable operational core.
