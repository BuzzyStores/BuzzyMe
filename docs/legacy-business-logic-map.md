# Legacy Business Logic Map

Updated: 2026-07-23

Preserve the business logic. Reject the old implementation. Rebuild automation-first.

The legacy BuzzyStores platform should be treated as a requirements archive. It contains useful product knowledge about ordering, vendors, delivery, bookings, pricing, promotions, reporting, payments, geofencing, driver tasks, and super-admin operations. It should not be treated as reusable architecture or source code.

This analysis is documentation-only. It does not introduce product features, schema changes, API routes, frontend routes, dependencies, or copied legacy code.

## Source Notes

- Old admin module list supplied in the task.
- `BuzzyStores/order_app`: reviewed README, `package.json`, and `.env.example` for customer commerce, ordering, payments, mapping, support, push, reviews, and native app signals.
- `BuzzyStores/dispatch_app`: reviewed README, `package.json`, and `.env.example` for driver/courier tasks, background GPS, maps, QR scanning, proof of delivery, push, wallet/payout-adjacent flows, and native app signals.
- `BuzzyStores/buzzy-store_partner-site`: reviewed README, `.env.example`, and Postman smoke collection for PHP/WordPress partner site, hardened admin CMS, auth, CMS content, payment options, subscriptions, dispatch task endpoints, wallet/payout endpoints, and security tests.
- Current `BuzzyStores/BuzzyMe` rebuild: reviewed README, module docs, Prisma model/enums, API controllers, and app route inventory in the local workspace.
- `Project Scope BuzzyStores - CodeBrew.pdf`: not found in the local attachments/workspace scan during this run, so no unverified PDF-specific details are asserted here.

Status is judged against the pushed Phase 4 rebuild branch unless otherwise noted. Any unmerged local draft work is treated as not shipped.

## Status Legend

- `BUILT`: A working first-pass rebuild implementation exists.
- `PARTIALLY_BUILT`: A foundation exists, but important legacy business scope is still missing.
- `PLANNED`: The architecture clearly reserves a place for it, but implementation should come in a later phase.
- `MISSING`: No meaningful rebuild implementation exists yet.
- `DELAY`: Valid business capability, but not a near-term priority.
- `DISCARD`: The legacy pattern should not be rebuilt as a product or engineering direction.

## Customer Commerce

| Capability | Legacy Source | Business Value | Current Status | Priority | Automation Opportunity | Rebuild Direction | Do Not Copy |
|---|---|---|---|---|---|---|---|
| Public storefront discovery | `order_app`, old QR/shortCode endpoint signals | Customers need to find a vendor and understand what can be bought. | PARTIALLY_BUILT | Phase 5 hardening, Phase 10 expansion | Auto-rank vendors by availability, health, location, campaigns, and customer intent. | Continue with `apps/web`, published-only storefront APIs, QR routes, and future search/read models. | Do not expose unpublished vendors, prospects, or AI drafts. |
| QR storefront access | `order_app`, partner smoke `shortCode` | QR codes turn offline vendor recruitment into measurable customer traffic. | BUILT | Phase 5 hardening | Auto-track scans, source, campaign attribution, and vendor activation impact. | Keep QR scan tracking in `qr` and public storefront modules. | Do not reuse legacy shortCode route contracts without approval and safety rules. |
| Customer signup and login | `order_app`, partner smoke auth endpoints | Customers need identity for order tracking, history, reviews, and support. | PARTIALLY_BUILT | Phase 5 | OTP/social login can be automated with provider-backed auth and risk checks. | Build real sessions, OTP, social identity, consent, and account lifecycle in Trust/Auth modules. | Do not trust client-provided role or token state. |
| OTP phone verification | `order_app`, partner smoke `sendOtp` | Phone-first access fits local commerce and delivery communication. | PLANNED | Phase 5 | Auto-verify phone ownership, rate-limit attempts, and link repeat orders. | Use notification/auth provider abstractions with audit and abuse controls. | Do not copy old OTP endpoint behavior or provider coupling. |
| Social login | `order_app` dependencies for Apple, Google, Facebook | Reduces checkout friction and account duplication. | PLANNED | Phase 5 or later | Auto-link identities by verified email/phone with conflict review. | Add provider adapters after real auth model is in place. | Do not embed native SDK assumptions into shared API auth. |
| Customer cart/order builder | `order_app` | Customers need a clear way to choose items and quantities. | PARTIALLY_BUILT | Phase 5 hardening, Phase 8/9 expansion | Auto-validate stock, availability, coupon eligibility, and fulfilment constraints. | Keep Phase 3 single-vendor pickup now; expand after payments/delivery foundations. | Do not build multi-vendor checkout before order and finance foundations are stable. |
| Pickup checkout | `order_app` | First transaction loop for local vendors without delivery complexity. | BUILT | Phase 5 hardening | Auto-notify vendor, track SLA, and prompt review after completion. | Keep single-vendor pickup as core transaction path. | Do not add real payment assumptions before finance hardening. |
| Delivery checkout | `order_app`, `dispatch_app` | Customers expect delivery for food, groceries, services, and diaspora flows. | MISSING | Phase 8 | Auto-price delivery, validate zones, assign drivers, and escalate late tasks. | Build in Delivery & Service Areas with explicit dispatch workflow. | Do not reuse manual task allocation or old driver endpoints. |
| Live order tracking | `order_app`, `dispatch_app` sockets/maps | Customers need confidence and fewer support messages. | PARTIALLY_BUILT | Phase 8 | Auto-publish order, vendor, and driver status events to customers. | Extend event model and tracking pages with realtime-safe updates later. | Do not depend on legacy socket contracts as the domain model. |
| Reviews and ratings | `order_app` review/rating dependencies | Trust signals help customers choose vendors and help vendors improve. | PARTIALLY_BUILT | Phase 5 hardening | Auto-request reviews, detect duplicates/abuse, summarize sentiment. | Keep completed-order-only review submission with moderation path. | Do not allow unauthenticated arbitrary reviews or duplicates. |
| Customer support chat | `order_app`, `dispatch_app` support dependencies | Reduces churn when orders, deliveries, or payments fail. | PLANNED | Later | Auto-triage support by order state, vendor SLA, and customer history. | Add support module after auth/order hardening. | Do not embed third-party chat SDKs into domain workflows. |
| Native mobile app experience | `order_app` React Native app | Useful future channel for repeat customers and push notifications. | DELAY | Later | Auto-sync web/storefront capabilities into mobile APIs. | Treat native apps as future clients over the same API. | Do not recreate dependency-heavy React Native app as the primary rebuild path. |

## Vendor Operations

| Capability | Legacy Source | Business Value | Current Status | Priority | Automation Opportunity | Rebuild Direction | Do Not Copy |
|---|---|---|---|---|---|---|---|
| Vendor registration | Old admin Vendors, current rebuild | Converts interested businesses into onboardable vendors. | BUILT | Phase 5 hardening | Auto-create lifecycle events, storefront drafts, AI intake output, and missing-field checklist. | Continue through `vendors`, `vendor-lifecycle`, `ai`, `audit`, and `storefronts`. | Do not let registration silently skip lifecycle events. |
| Vendor lifecycle pipeline | Old admin Vendors/Dashboard | BuzzyStores wins by moving vendors through activation, not collecting signups. | BUILT | Phase 5 hardening | Auto-recommend next action from lifecycle, AI output, orders, campaigns, and health. | Keep lifecycle transitions explicit and audited. | Do not collapse lifecycle into a single free-text status. |
| Vendor profile management | Old admin Profile/Vendors | Keeps business data accurate for storefront, orders, and compliance. | PARTIALLY_BUILT | Phase 5 | Auto-detect missing fields, stale hours, invalid links, and low-quality descriptions. | Build vendor/admin profile editing on top of current vendor/storefront models. | Do not make manual profile entry the only path. |
| AI vendor intake | Current rebuild direction, old manual onboarding | Turns messy vendor input into reviewable storefront content. | BUILT | Phase 5 hardening | Auto-draft headline, descriptions, category hints, trust flags, and next action. | Keep AI outputs draft-only with vendor/admin review. | Do not publish AI content without approval. |
| AI-assisted catalogue intake | Old manual catalog entry, current rebuild | Speeds vendor activation and reduces BuzzyStores ops work. | PARTIALLY_BUILT | Phase 5/6 | Extract items from text now, later images/PDF/menu links; flag missing price/category. | Extend catalogue builder with human review and duplicate detection. | Do not require every vendor to manually type every item as the primary flow. |
| Vendor dashboard | Current rebuild, old vendor operations needs | Gives vendors ownership of drafts, campaigns, customers, and orders. | PARTIALLY_BUILT | Phase 5 | Auto-surface next best action and unresolved blockers. | Harden API integration and remove production mock fallbacks. | Do not mirror the old admin menu inside the vendor app. |
| Vendor health score | Current rebuild, old reporting/dashboard needs | Helps BuzzyStores intervene before vendors churn. | PARTIALLY_BUILT | Phase 5/10 | Auto-score based on publishing, listings, QR scans, orders, campaigns, reviews, and retention. | Keep as operational guidance, not a finance ledger. | Do not make health a static manual field. |
| Vendor publishing controls | Current rebuild, old admin Vendors | Prevents unsafe or unapproved public content. | BUILT | Phase 5 hardening | Auto-check readiness and block publish until requirements are met. | Keep admin approval and public published-only reads. | Do not expose draft storefront or listing content publicly. |

## Admin Operations

| Capability | Legacy Source | Business Value | Current Status | Priority | Automation Opportunity | Rebuild Direction | Do Not Copy |
|---|---|---|---|---|---|---|---|
| Admin dashboard | Old Dashboard | Gives operators a command center for activation, orders, campaigns, and risk. | PARTIALLY_BUILT | Phase 5/10 | Auto-prioritize exceptions: stuck vendors, late orders, failed campaigns, missing approvals. | Build an Admin Control Tower around events, health, and queues. | Do not copy the flat super-admin menu as the information architecture. |
| Vendor approvals | Old Vendors, current rebuild | Protects quality and trust before public launch. | BUILT | Phase 5 hardening | Auto-run readiness checks and prepare an approval checklist. | Keep admin approval separated from vendor acceptance and publishing. | Do not let admin approval imply automatic public publish unless explicitly designed. |
| AI output review | Current rebuild | Keeps AI useful but human-governed. | BUILT | Phase 5 hardening | Auto-cluster low-risk drafts and flag high-risk copy/pricing/category issues. | Continue approval/rejection workflows with audit logs. | Do not let AI bypass human gates. |
| Super-admin tools | Old Tools | Operators need controlled maintenance utilities. | PLANNED | Phase 5/10 | Automate diagnostics and guided safe actions. | Add scoped admin tools with permissions and audit. | Do not provide broad raw DB mutation tools. |
| Admin service area | Old Admin Service Area | Defines where BuzzyStores operates and where delivery/recruitment applies. | PLANNED | Phase 6/8 | Auto-suggest zones by demand, vendor density, delivery distance, and city/category gaps. | Separate recruitment zones from delivery service areas. | Do not reuse one geo concept for every domain. |
| Admin CMS | Old CMS, partner site | Manages policy, content, landing pages, and app content without deploys. | MISSING | Phase 10 | Auto-expire content, detect broken links, and require approval for public modules. | Build a simple content module or integrate a modern CMS. | Do not copy WordPress/PHP internals into the monorepo. |
| Cache control | Old Cache Control | Operators sometimes need to refresh stale operational data. | DELAY | Later | Auto-invalidate cache on writes instead of manual global flushes. | Use scoped operational tools only if caching becomes a real issue. | Do not expose "flush everything" as routine admin workflow. |

## Dispatcher / Driver Operations

| Capability | Legacy Source | Business Value | Current Status | Priority | Automation Opportunity | Rebuild Direction | Do Not Copy |
|---|---|---|---|---|---|---|---|
| Driver/courier app | `dispatch_app` README | Enables delivery execution by drivers and couriers. | MISSING | Phase 8 | Auto-assign tasks, track status, and escalate exceptions. | Build future driver app as a clean client over dispatch APIs. | Do not reuse dependency-heavy React Native patterns as-is. |
| Driver login and role | `dispatch_app`, current `UserRole.DRIVER` | Secures driver-specific tasks and location data. | PLANNED | Phase 8 | Auto-expire sessions, verify device/location consent, and detect risk. | Implement after production auth baseline. | Do not copy OTP/session behavior from legacy endpoints. |
| Delivery task list | Partner smoke `taskList`, `dispatch_app` | Gives drivers actionable work. | MISSING | Phase 8 | Auto-rank tasks by location, SLA, capacity, and driver availability. | Model explicit delivery jobs/tasks linked to orders. | Do not use ambiguous `task` as a catch-all domain object. |
| Accept/reject task | Partner smoke `task/accecpt/reject` | Lets couriers commit to or decline assignments. | MISSING | Phase 8 | Auto-reassign rejected/expired tasks and alert dispatchers. | Build assignment state machine with audit and events. | Do not preserve typoed route names or vague payloads. |
| Driver status updates | Partner smoke `updateStatus` | Keeps vendors/customers/admins informed. | PLANNED | Phase 8 | Auto-derive next allowed status and notify affected parties. | Extend order/delivery workflows with strict transitions. | Do not let drivers set arbitrary order status. |
| Background GPS tracking | `dispatch_app` dependencies | Enables delivery visibility and route exception detection. | MISSING | Phase 8 | Auto-detect off-route, late pickup/dropoff, and geofence arrival. | Add consent, retention, geofencing, and location stream rules first. | Do not collect always-on location without policy controls. |
| Proof of delivery | `dispatch_app` signature/QR dependencies | Reduces disputes and improves trust. | MISSING | Phase 8 | Auto-require QR/signature/photo depending on order risk. | Add proof records linked to delivery jobs. | Do not store raw signatures/images without retention and privacy design. |
| Driver wallet and payout view | Partner smoke `agent/transaction/details`, `agent/payout/details` | Drivers need earnings transparency. | MISSING | Phase 9 | Auto-calculate earnings from ledgered delivery events. | Build only after finance ledger and payout primitives. | Do not compute payouts from mutable order rows. |

## Catalog & Inventory

| Capability | Legacy Source | Business Value | Current Status | Priority | Automation Opportunity | Rebuild Direction | Do Not Copy |
|---|---|---|---|---|---|---|---|
| Categories and subcategories | Old Catalog, `order_app` catalog browsing | Helps customers navigate and helps admins report by vertical. | PARTIALLY_BUILT | Phase 6 | Auto-map vendor items to category taxonomy and flag uncertain matches. | Expand `Category` and `Listing` moderation with admin tools. | Do not import legacy category tree without cleanup. |
| Product/menu listing management | Old Catalog, `order_app` | Core commerce unit for food, products, and services. | PARTIALLY_BUILT | Phase 5/6 | AI extraction, duplicate detection, price checks, image quality checks. | Continue with typed `Listing` model and approval status. | Do not make manual CRUD the primary activation workflow. |
| Inventory and stock thresholds | Old manual stock threshold signals | Prevents selling unavailable items and supports alerts. | PARTIALLY_BUILT | Phase 6 | Auto-alert low stock and pause unavailable listings. | Extend listing inventory fields with events and vendor UX. | Do not bury stock in free-text metadata. |
| Listing images and media | `order_app` image dependencies | Better listings convert more orders. | PLANNED | Phase 6 | Auto-resize, quality-check, classify, and flag missing imagery. | Add media pipeline after core catalog hardening. | Do not let unreviewed uploaded media publish directly. |
| Translation/localization | `order_app`, current AI language hints | Supports multilingual vendors/customers. | PARTIALLY_BUILT | Phase 10 | Auto-translate approved content and flag low-confidence translations. | Add i18n/content workflow with approval. | Do not scatter translations across client constants. |
| Variant/options management | Old product options implied by commerce app | Supports sizes, add-ons, service options, and bundles. | PLANNED | Phase 6 | Auto-normalize add-ons and detect impossible combinations. | Model variants/options cleanly before complex checkout. | Do not parse arbitrary legacy option payloads directly. |

## Orders & Fulfilment

| Capability | Legacy Source | Business Value | Current Status | Priority | Automation Opportunity | Rebuild Direction | Do Not Copy |
|---|---|---|---|---|---|---|---|
| Order creation | `order_app`, current rebuild | Core revenue transaction. | BUILT | Phase 5 hardening | Auto-validate published listings, vendor availability, coupon eligibility, and totals. | Keep single-vendor pickup stable before delivery/payment expansion. | Do not add unscoped multi-vendor checkout prematurely. |
| Vendor accept/reject | `order_app`, current rebuild | Gives vendor control over fulfilment. | BUILT | Phase 5 hardening | Auto-remind vendors and escalate stale orders. | Keep strict order transition service methods. | Do not allow status mutations from scattered controllers. |
| Ready/complete workflow | `order_app`, current rebuild | Supports pickup completion and review request. | BUILT | Phase 5 hardening | Auto-send customer notifications and trigger review request. | Keep events and notifications tied to order transitions. | Do not complete orders without audit/event trail. |
| Cancellation/refund/dispute | Old Orders/Accounting | Needed for real commerce trust. | MISSING | Phase 9 | Auto-calculate refund eligibility and route disputes to admin. | Build with payments/ledger/refund module. | Do not implement refunds as manual notes. |
| Fulfilment SLA monitoring | Old Dashboard/Orders manual ops | Helps operators prevent late orders and poor customer experience. | PLANNED | Phase 5/10 | Auto-detect late accept/ready/complete and notify vendor/admin. | Build on event timestamps and health score. | Do not require staff to manually scan all orders. |
| Multi-vendor checkout | Old marketplace direction | May support marketplace baskets later. | DELAY | Later | Auto-split carts, fulfilment, fees, payouts, and support contexts. | Defer until single-vendor, finance, and delivery are mature. | Do not copy marketplace complexity before core loops work. |

## Bookings & Services

| Capability | Legacy Source | Business Value | Current Status | Priority | Automation Opportunity | Rebuild Direction | Do Not Copy |
|---|---|---|---|---|---|---|---|
| Bookable service listings | Old Booking Option, current listing/order enums | Lets beauty, repair, and local services sell time. | PLANNED | Phase 7 | Auto-generate service draft, duration, price, and availability checklist. | Extend `ListingType.BOOKABLE_APPOINTMENT` with booking module. | Do not treat bookings as ordinary pickup orders. |
| Booking slots and calendars | Old Booking Option | Prevents double booking and manual scheduling. | MISSING | Phase 7 | Auto-calculate available slots from staff, hours, buffers, and deposits. | Build scheduling service and staff calendars. | Do not use free-text opening hours as availability truth. |
| Deposits and no-show rules | Old booking/service needs | Protects vendors from no-shows. | MISSING | Phase 7/9 | Auto-enforce cancellation windows and deposit rules. | Pair booking rules with finance/payment primitives. | Do not add deposit fields without ledger/payment support. |
| Booking reminders | Old notification needs | Reduces missed appointments. | PLANNED | Phase 7 | Auto-send SMS/email/push reminders and reschedule prompts. | Use notifications provider abstraction. | Do not hardcode SMS/WhatsApp providers. |
| Booking campaigns | Old Campaigns/Booking Option | Helps service vendors fill empty slots. | PLANNED | Phase 7/10 | Auto-create campaigns for low-utilization slots. | Extend campaign engine after booking module. | Do not manually create all offers. |

## Rental / Circular Commerce

| Capability | Legacy Source | Business Value | Current Status | Priority | Automation Opportunity | Rebuild Direction | Do Not Copy |
|---|---|---|---|---|---|---|---|
| Rental listings | Old Rental Protection, current listing/order enums | Supports rentals and reusable/circular inventory. | PLANNED | Later | Auto-check availability windows, deposits, and return deadlines. | Extend listing/order models with rental lifecycle. | Do not bolt rentals onto generic order notes. |
| Rental protection | Old Rental Protection | Reduces risk for damaged/lost items. | MISSING | Later | Auto-calculate deposits, claims, and evidence requirements. | Build with finance ledger, proof records, and policy settings. | Do not copy undefined legacy protection rules. |
| Circular commerce listings | Current campaign/listing enums, old marketplace intent | Supports resale, repair, reuse, and sustainability use cases. | PLANNED | Later | Auto-classify condition, category, and trust requirements. | Build clean circular item attributes and moderation. | Do not mix condition, stock, and trust flags in free text. |
| Return/check-in flow | Rental/circular commerce needs | Completes rental lifecycle and releases deposits. | MISSING | Later | Auto-remind return dates and flag overdue items. | Add return events and proof-of-return workflows. | Do not close rentals without proof/audit. |

## Marketing & Promotions

| Capability | Legacy Source | Business Value | Current Status | Priority | Automation Opportunity | Rebuild Direction | Do Not Copy |
|---|---|---|---|---|---|---|---|
| Campaigns | Old Campaigns, current rebuild | Helps vendors create repeat demand. | BUILT | Phase 5 hardening | AI drafts, recommended listings, copy variants, QR posters, and activation rules. | Keep campaign approval and active-only public visibility. | Do not expose inactive or draft campaign content. |
| Promo codes/coupons | Old Promocode, current rebuild | Drives conversion and retention. | PARTIALLY_BUILT | Phase 6/10 | Auto-generate rules based on inventory, CRM segment, and margin constraints. | Extend current `Coupon` model after finance rules. | Do not trust client-side discount calculations. |
| Banners | Old Banners | Promotes offers and platform messages. | MISSING | Phase 10 | Auto-schedule banners by campaign, city, category, and expiry. | Build banner/content module with approval and expiry. | Do not copy static banner upload sprawl. |
| Loyalty cards | Old Loyalty Cards | Encourages repeat orders. | PLANNED | Phase 10 | Auto-segment customers and issue rewards after real purchase milestones. | Build after finance/CRM foundations; avoid complex points too early. | Do not introduce unledgered loyalty balances. |
| AI campaign drafts | Current rebuild direction | Reduces marketing burden on vendors and admins. | BUILT | Phase 5 hardening | Auto-produce channel copy, campaign pages, coupon suggestions, and poster text. | Keep AI output linked to campaigns and approval. | Do not let AI send messages without human/provider controls. |
| QR campaign pages | Current rebuild direction | Makes offline-to-online campaigns measurable. | PARTIALLY_BUILT | Phase 10 | Auto-attribute visits/orders to campaign QR. | Extend campaign URLs and analytics. | Do not mix storefront scan metrics and campaign conversion metrics. |

## Customers & CRM

| Capability | Legacy Source | Business Value | Current Status | Priority | Automation Opportunity | Rebuild Direction | Do Not Copy |
|---|---|---|---|---|---|---|---|
| Vendor customer profiles | Old Customers, current rebuild | Vendors need repeat-customer context. | BUILT | Phase 5 hardening | Auto-create/update profiles from orders and completions. | Keep vendor-scoped CRM records. | Do not expose one vendor's customers to another vendor. |
| Retention suggestions | Current rebuild direction, old manual customer follow-up | Helps vendors recover revenue without manual BuzzyStores work. | BUILT | Phase 5/10 | Auto-group first-time, repeat, inactive, high-value customers. | Expand deterministic suggestions into approved automation later. | Do not send outreach automatically without consent. |
| Customer tags and notes | Old Customers | Helps vendors remember preferences and service issues. | BUILT | Phase 5 hardening | Auto-suggest tags from order/review patterns. | Keep vendor-owned notes with privacy controls. | Do not make private notes public or global. |
| Customer order history | `order_app` | Customers need self-service tracking/history. | MISSING | Phase 5/10 | Auto-link orders by verified phone/email account. | Add customer account pages after auth baseline. | Do not expose orders through guessable links. |
| Consent management | CRM, marketing, notifications | Required for responsible retention and outreach. | MISSING | Phase 5 | Auto-check consent before campaign/contact actions. | Add consent fields and audit across CRM/notifications. | Do not assume order placement equals marketing consent. |

## Finance / Accounting / Payments

| Capability | Legacy Source | Business Value | Current Status | Priority | Automation Opportunity | Rebuild Direction | Do Not Copy |
|---|---|---|---|---|---|---|---|
| Payment options | Old Payment Options, partner smoke endpoint, mobile payment deps | Lets platform configure payment methods by market/vendor. | PLANNED | Phase 9 | Auto-enable methods by currency, country, risk, and vendor status. | Keep providers behind `packages/payments` and admin settings. | Do not embed Stripe/Razorpay/Flutterwave SDK logic in order services. |
| Mock/no-payment pickup | Current rebuild | Lets transaction loop ship before payment complexity. | BUILT | Phase 5 hardening | Auto-reconcile no-payment orders separately from paid orders. | Keep explicit phase metadata until real payments. | Do not pretend mock payments are production-ready. |
| Accounting dashboard | Old Accounting | Operators need revenue, fees, credits, payouts, and refunds. | MISSING | Phase 9 | Auto-generate ledger summaries and anomaly alerts. | Build ledger-first finance module. | Do not calculate accounting from UI reports. |
| Vendor payouts | Old payout/agent endpoints | Vendors and drivers need reliable settlement. | MISSING | Phase 9 | Auto-calculate payout batches from immutable ledger entries. | Add payout module after payments and ledger. | Do not derive payouts from mutable order totals. |
| Tax configuration | Old Tax | Required for compliant orders and reports. | MISSING | Phase 9 | Auto-apply tax by location, category, and vendor settings. | Add tax rules and order tax lines. | Do not hide tax inside subtotal/total. |
| Refunds/disputes | Old Orders/Accounting | Needed for real payments and customer trust. | MISSING | Phase 9 | Auto-route disputes by evidence, status, and policy. | Implement after real payments and audit. | Do not manage refunds through notes/manual edits. |
| Wallets | Partner smoke agent wallet endpoint | Supports driver/vendor balance visibility. | MISSING | Phase 9 | Auto-update balances from ledger events. | Build only after ledger primitives. | Do not build standalone wallet balances detached from transactions. |

## Subscriptions / Vendor Plans

| Capability | Legacy Source | Business Value | Current Status | Priority | Automation Opportunity | Rebuild Direction | Do Not Copy |
|---|---|---|---|---|---|---|---|
| Subscription plans | Old Subscriptions, partner smoke driver plans | Supports recurring revenue or role access plans. | MISSING | Phase 9 | Auto-match vendors to plans by usage and lifecycle stage. | Clarify whether plans apply to vendors, drivers, or customers, then build plan catalog. | Do not copy ambiguous driver subscription endpoints. |
| Vendor plan entitlements | Old Subscriptions | Controls features, commissions, campaign limits, or service areas. | MISSING | Phase 9 | Auto-enforce entitlements at API boundaries. | Add entitlement checks after real roles/auth. | Do not hardcode feature availability in frontend menus. |
| Billing lifecycle | Old Accounting/Subscriptions | Manages renewals, payment failures, and downgrades. | MISSING | Phase 9 | Auto-remind renewal, dunning, and plan changes. | Build with payments, ledger, and notifications. | Do not add subscriptions without billing/audit state. |

## Reports & Analytics

| Capability | Legacy Source | Business Value | Current Status | Priority | Automation Opportunity | Rebuild Direction | Do Not Copy |
|---|---|---|---|---|---|---|---|
| Admin reports | Old Reports | Helps operators manage growth, quality, and finance. | PLANNED | Phase 10 | Auto-generate city/category/vendor/campaign/order dashboards. | Build reporting read models over events and aggregates. | Do not run heavy ad hoc SQL from controllers. |
| Vendor analytics | Old Dashboard/Reports, current health/campaign metrics | Shows vendors what actions drive results. | PARTIALLY_BUILT | Phase 10 | Auto-explain why sales changed and recommend next action. | Extend vendor health, campaign metrics, QR scans, and CRM. | Do not overwhelm vendors with raw tables. |
| Recruitment funnel analytics | Old manual recruitment needs, new direction | Shows which zones/outreach methods convert vendors. | PLANNED | Phase 6/10 | Auto-score zones, outreach copy, source quality, and conversion rates. | Build with `LocalBusinessProspect` and status history. | Do not mix prospects with public vendor analytics. |
| Campaign ROI | Old Campaigns/Promocode, current campaigns | Proves promotions produce orders and repeat customers. | PARTIALLY_BUILT | Phase 10 | Auto-attribute coupon orders, QR visits, and revenue to campaigns. | Extend campaign counters and reporting. | Do not count impressions/visits without source clarity. |
| Scheduled exports | Old manual reports/CSV | Supports accounting, partners, and ops review. | MISSING | Phase 10 | Auto-send approved report exports on schedule. | Build export jobs after analytics model. | Do not rely on manual CSV generation as primary reporting. |

## Roles, Permissions & Audit

| Capability | Legacy Source | Business Value | Current Status | Priority | Automation Opportunity | Rebuild Direction | Do Not Copy |
|---|---|---|---|---|---|---|---|
| Admin roles | Old Manage Roles, partner admin CMS | Protects sensitive platform actions. | PARTIALLY_BUILT | Phase 5 | Auto-enforce permissions per action and surface least-privilege gaps. | Replace mock headers with real sessions and granular permissions. | Do not reuse PHP sessions or client-trusted roles. |
| Vendor roles/staff | Old vendor operations | Lets vendors delegate without losing control. | PLANNED | Phase 5/9 | Auto-recommend role based on invited staff task. | Add vendor-scoped roles after auth baseline. | Do not share global admin permissions with vendor staff. |
| Driver roles | `dispatch_app`, current `UserRole.DRIVER` | Separates courier actions from vendor/admin/customer actions. | PLANNED | Phase 8 | Auto-limit data to assigned delivery tasks. | Implement with dispatch module and driver app. | Do not expose all order data to drivers. |
| Audit logs | Old DB Audit Logs, current rebuild | Required for sensitive changes and trust. | PARTIALLY_BUILT | Phase 5 | Auto-log every sensitive action with actor/entity/metadata. | Add audit viewer, retention, filters, and immutable posture. | Do not allow audit logs to be edited like normal records. |
| Security hardening | Partner site README | Reduces breach and abuse risk. | PARTIALLY_BUILT | Phase 5 | Auto-detect missing headers, weak sessions, rate-limit issues. | Carry forward principles: CSRF, rate limits, secure cookies, timeouts, no secrets. | Do not copy PHP implementation details. |

## Platform Configuration

| Capability | Legacy Source | Business Value | Current Status | Priority | Automation Opportunity | Rebuild Direction | Do Not Copy |
|---|---|---|---|---|---|---|---|
| Environment validation | Current rebuild, partner env files | Prevents deploy/runtime surprises. | PARTIALLY_BUILT | Phase 5 | Auto-fail deploys when required env vars are missing. | Continue `packages/config` and deployment docs. | Do not scatter config across mobile constants/PHP files. |
| Vercel/pnpm build baseline | Current rebuild deployment task | Required before adding more product scope. | PARTIALLY_BUILT | Phase 5 | Auto-run CI build/test matrix per app/package. | Standardize package manager and app-specific Vercel projects. | Do not continue feature work while builds are red. |
| CMS/content configuration | Old CMS | Lets admins update public content safely. | MISSING | Phase 10 | Auto-expire outdated content and require approvals. | Build modern content model or external CMS integration. | Do not copy WordPress as internal platform architecture. |
| Styling/customization | Old Customize/Styling | Allows brand and storefront adaptation. | PLANNED | Phase 10 | Auto-validate theme contrast, image quality, and layout safety. | Add controlled design tokens/settings. | Do not allow arbitrary CSS/HTML injection. |
| Operational diagnostics | Old Tools/Cache Control | Helps support and engineering resolve issues quickly. | PLANNED | Phase 5/10 | Auto-suggest fixes from health checks and logs. | Add scoped admin tools and observability. | Do not expose unsafe low-level controls. |

## B2B / Bulk Pricing

| Capability | Legacy Source | Business Value | Current Status | Priority | Automation Opportunity | Rebuild Direction | Do Not Copy |
|---|---|---|---|---|---|---|---|
| Bulk pricing | CodeBrew scope reference requested; marketplace need | Supports business buyers, events, and larger orders. | DELAY | Phase 9 | Auto-price by volume, customer type, MOQ, and delivery window. | Add after catalog variants, finance, and customer account foundations. | Do not overload retail coupon logic for B2B pricing. |
| B2B customer accounts | Marketplace/partner direction | Enables repeat institutional buyers and negotiated terms. | DELAY | Phase 9 | Auto-approve/review B2B customers and apply terms. | Add customer account type and billing terms later. | Do not mix B2B terms with ordinary consumer checkout. |
| Minimum order quantity | Bulk commerce need | Protects vendor economics for wholesale/large orders. | DELAY | Phase 9 | Auto-enforce MOQ by listing, customer segment, and campaign. | Add to listing/pricing model later. | Do not hide MOQ in listing descriptions. |
| Multi-currency and diaspora commerce | Current order/campaign enums | Supports cross-border and send-home use cases. | DELAY | Phase 9 | Auto-convert display prices and validate payout currency rules. | Build after finance/provider strategy. | Do not treat currency as display-only text. |

## Geo, Delivery Zones & Service Areas

| Capability | Legacy Source | Business Value | Current Status | Priority | Automation Opportunity | Rebuild Direction | Do Not Copy |
|---|---|---|---|---|---|---|---|
| Recruitment zones | Old manual recruitment, new direction | Helps BuzzyStores focus acquisition by geography/category. | PLANNED | Phase 6 | Auto-discover prospects, score zones, dedupe, and draft outreach. | Build `GeoRecruitmentZone` and `LocalBusinessProspect` as admin-only. | Do not expose prospects publicly or merge them with vendors. |
| Delivery service areas | Old Admin Service Area/Manage Delivery | Determines where orders can be delivered and at what cost. | MISSING | Phase 8 | Auto-price delivery by distance, zone, driver availability, and SLA. | Build separate service-area model from recruitment zones. | Do not reuse recruitment zones for delivery eligibility. |
| Geofencing | `dispatch_app` GPS/maps | Reduces manual driver follow-up and confirms arrival/departure. | MISSING | Phase 8 | Auto-trigger pickup/dropoff events and exceptions. | Add geofence events with privacy and retention controls. | Do not collect unbounded location histories. |
| Address validation | `order_app` Google Places/maps | Prevents failed delivery and bad service-area matches. | PLANNED | Phase 8 | Auto-normalize addresses and detect unsupported destinations. | Use provider abstraction and server-side validation where possible. | Do not put provider keys or logic only in the client. |
| Destination management | Old Destination | Supports city/area/locality rules. | PLANNED | Phase 8 | Auto-map destinations to zones, vendors, and delivery fees. | Clarify domain meaning, then implement as geo/settings module. | Do not build a vague destination table without workflow ownership. |

## Notifications & Communication

| Capability | Legacy Source | Business Value | Current Status | Priority | Automation Opportunity | Rebuild Direction | Do Not Copy |
|---|---|---|---|---|---|---|---|
| Customer order notifications | `order_app`, current notifications | Reduces support load and improves trust. | PARTIALLY_BUILT | Phase 5/8 | Auto-send status, delay, ready, completed, and review messages. | Keep notification records and provider abstraction. | Do not hardcode Firebase/Notifee or SMS providers in workflow services. |
| Vendor order alerts | Current rebuild, old vendor ops | Ensures vendors respond quickly to orders. | PARTIALLY_BUILT | Phase 5 | Auto-remind and escalate stale orders. | Add SLA-aware notification rules. | Do not rely on admin manual chasing. |
| Campaign communication | Old Campaigns/Banners/Promocode, current campaigns | Helps vendors market without BuzzyStores writing every message. | PARTIALLY_BUILT | Phase 10 | AI drafts for SMS, WhatsApp, Instagram, email, QR poster copy. | Keep drafts/approvals before sending. | Do not let AI or vendors spam customers without consent. |
| Recruitment outreach | Old manual vendor discovery, new direction | Scales vendor acquisition with reviewable outreach. | PLANNED | Phase 6 | AI outreach drafts, contact scheduling, response tracking. | Keep admin-only prospects, drafts, consent-gated conversion. | Do not auto-contact discovered businesses without controls. |
| Driver notifications | `dispatch_app` push dependencies | Keeps delivery tasks moving. | PLANNED | Phase 8 | Auto-alert assignment, reassignment, late pickup, and route changes. | Build after driver task model. | Do not bind delivery notifications to one mobile provider. |
| Support/escalation messaging | Legacy chat/support dependencies | Helps resolve exceptions. | PLANNED | Later | Auto-create support cases from failed orders, reviews, disputes, late delivery. | Add support module over events and actor roles. | Do not scatter support state in comments/notes. |

## Technical Debt Patterns to Reject

| Debt Pattern | Why It Was A Problem | How The Rebuild Avoids It | What Codex Must Not Reproduce |
|---|---|---|---|
| LAMP backend architecture | The old PHP/WordPress/Royo-style surfaces made commerce, admin, dispatch, and CMS concerns hard to separate and evolve. | The rebuild uses a TypeScript modular monolith, Prisma, PostgreSQL, and explicit domain modules. | Do not recreate PHP controllers, WordPress admin internals, or MySQL-era assumptions inside the rebuild. |
| Manual testing as primary QA | Manual checklists are useful, but they cannot protect a fast-changing commerce platform on their own. | The rebuild keeps dependency-free smoke tests, typed services, and should add CI build/test gates. | Do not accept "page loads" or "500 is alive" as sufficient test quality. |
| Feature-rich but automation-poor flows | The old platform had many features but still required BuzzyStores staff to manually discover vendors, create content, chase orders, and coordinate drivers. | The rebuild uses lifecycle events, AI drafts, scoring, health, campaigns, and event-driven workflows. | Do not add menu items that simply move manual work into a new screen. |
| Legacy dependency-heavy React Native approach | The old apps carried large native dependency surfaces for maps, payments, push, chat, CodePush, media, printers, and geolocation. | The rebuild starts web/API-first and can add native clients later over stable APIs. | Do not import old mobile dependency patterns or make provider SDKs the domain model. |
| Flat super-admin menu overload | The old menu grouped many unrelated tools into long admin sections, increasing operator load. | The rebuild should organize by operating workflows: activation, orders, campaigns, recruitment, finance, reports, settings. | Do not copy the old admin menu structure directly. |
| Direct vendor self-service without AI assistance | Requiring vendors to manually type every detail and item slows activation and increases support. | AI intake, catalogue extraction, missing-field checklists, and human approvals make onboarding faster and safer. | Do not make manual product/profile entry the only primary workflow. |
| Manual dispatch coordination without routing/allocation logic | Human dispatchers must chase drivers, tasks, and statuses without automation. | Future dispatch should use delivery zones, auto-allocation, GPS/geofences, proof rules, and escalation alerts. | Do not build a task list without assignment rules and lifecycle events. |
| Unclear separation between prospect, vendor, customer, driver, and admin domains | Blended actors create privacy, permissions, and public exposure risks. | The rebuild uses explicit roles, modules, lifecycle events, and should keep `LocalBusinessProspect` separate from `Vendor`. | Do not expose prospects publicly or let drivers/vendors/admins share broad data access. |
| Weak deployment and test discipline | Build failures and inconsistent package managers block momentum and make production unsafe. | Phase 5 must make pnpm/Vercel builds, environment validation, staging, logging, monitoring, and CI green. | Do not add Phase 5+ features until the build/deploy baseline is dependable. |

## Architecture Module Mapping

| Module | Legacy Capabilities Absorbed | Current Rebuild Status | Gaps | Recommended Next Implementation Phase |
|---|---|---|---|---|
| Admin Control Tower | Dashboard, Orders, Vendors, Tools, support/escalations | PARTIALLY_BUILT | Unified metrics, alerts, support workflows, operational search | Phase 5 baseline, Phase 10 analytics |
| Vendor Activation | Vendor registration, lifecycle, profile, AI intake, approval, publishing | BUILT | Real auth, consent capture, completeness UI, production API integration | Phase 5 |
| Admin-only Local Business Prospecting | Manual vendor discovery/outreach, admin service-area prospecting | PLANNED | `GeoRecruitmentZone`, `LocalBusinessProspect`, scoring, outreach, consent conversion | Phase 6 |
| Orders & Fulfilment | Customer orders, vendor accept/reject, ready/complete, tracking | PARTIALLY_BUILT | Delivery, refunds, disputes, SLA automation, multi-vendor later | Phase 5 hardening, Phase 8/9 expansion |
| Catalog & Services | Catalog, categories, item details, stock, service items | PARTIALLY_BUILT | Variants, inventory alerts, media pipeline, admin bulk tools | Phase 6 |
| Bookings | Booking Option, service duration, calendars, reminders | PLANNED | Slots, staff calendars, deposits, no-show rules | Phase 7 |
| Delivery & Service Areas | Manage Delivery, Admin Service Area, Destination, driver tasks, GPS | MISSING | Zones, fees, dispatch tasks, geofences, proof of delivery | Phase 8 |
| Marketing & Campaigns | Banners, Promocode, Loyalty Cards, Campaigns | PARTIALLY_BUILT | Banners, loyalty, advanced segmentation, ROI dashboards | Phase 10 |
| Customers & CRM | Customers, retention, notes, order history | PARTIALLY_BUILT | Customer accounts, consent center, admin-wide CRM, privacy exports | Phase 5/10 |
| Finance | Accounting, Payment Options, payouts, refunds, wallet, tax | MISSING | Ledger, tax lines, payment providers, payouts, refunds, wallets | Phase 9 |
| Subscriptions & Plans | Subscriptions, driver/vendor plans, entitlements | MISSING | Plan catalog, billing lifecycle, feature entitlements | Phase 9 |
| Reports & Analytics | Reports, dashboard metrics, campaign reports | PLANNED | Dashboards, scheduled exports, partner reports, city/category metrics | Phase 10 |
| Trust, Roles & Audit | Manage Roles, DB Audit Logs, admin security hardening | PARTIALLY_BUILT | Real auth, granular permissions, audit viewer, immutable retention | Phase 5 |
| Platform Settings | Profile, Customize, Styling, CMS, Configurations, Cache Control | PLANNED | Admin settings store, CMS, theme controls, diagnostics | Phase 5 baseline, Phase 10 expansion |
| Consumer Web | QR storefront, order placement, campaign pages, order tracking | PARTIALLY_BUILT | Account history, search, delivery checkout, support, native later | Phase 5/8/10 |
| Vendor Dashboard | Onboarding, order actions, campaigns, customers, health | PARTIALLY_BUILT | Auth integration, settings/profile, analytics, booking/delivery controls | Phase 5/7/8 |
| Admin Dashboard | AI review, vendor pipeline, orders, campaigns | PARTIALLY_BUILT | Recruitment, finance, settings, reports, audit viewer | Phase 5/6/9/10 |
| Future Driver App | Driver tasks, GPS, proof of delivery, wallet, push | MISSING | Entire dispatch mobile/API surface | Phase 8/9 |

## Automation Opportunities By Legacy Manual Process

| Manual Legacy Process | Automation-First Rebuild Direction |
|---|---|
| Manual vendor discovery, outreach, and onboarding | Admin-only `LocalBusinessProspect` discovery, Google/public-source enrichment, AI scoring, AI outreach drafts, recruitment pipeline, and consent-based vendor application conversion. |
| Vendor manually enters all business and product details | AI vendor intake, catalogue extraction from text/images/PDF/menu, missing-field checklist, vendor/admin review, and approved publishing. |
| Manual category, subcategory, item, image, description, price, and stock threshold entry | AI-assisted catalogue builder, category mapping, duplicate detection, translation, stock alerts, and product quality checks. |
| Vendor manually acknowledges/rejects and updates order status | Status workflow automation, vendor reminders, SLA alerts, customer notifications, and order health monitoring. |
| Manual task creation/allocation and driver follow-up | Geofenced delivery zones, auto-allocation rules, proof-of-delivery requirements, driver status, route visibility, and escalation alerts. |
| Admin/vendor manually creates banners, offers, promo codes, loyalty cards, and campaigns | AI campaign drafts, campaign templates, coupon rules, QR campaign pages, CRM segmentation, and retention suggestions. |
| Manual reports and CSV exports | Live analytics dashboards, vendor health scores, recruitment funnel, campaign ROI, city/category reports, and scheduled exports. |

## Recommended Implementation Roadmap

### Phase 5 - Production Readiness Baseline

Focus:

- pnpm-lock and Vercel green builds
- real authentication
- API integration hardening
- hosted staging API
- hosted PostgreSQL/Redis
- environment validation
- logging and monitoring
- removal of frontend mock fallbacks
- security and permissions hardening

Do not add legacy features here unless required for hardening. Phase 5 should make the platform safe to operate, deploy, observe, and secure before expanding scope.

### Phase 6 - Admin-only Vendor Recruitment Intelligence

Focus:

- `GeoRecruitmentZone`
- `LocalBusinessProspect`
- Google Places/mock provider
- prospect classification
- recruitment scoring
- AI outreach drafts
- outreach tracking
- prospect-to-vendor application conversion with consent

Important:

- `LocalBusinessProspect` remains completely separate from `Vendor`.
- Prospects are never public.
- Outreach remains draft/review/manual-provider controlled until explicit sending rules exist.

### Phase 7 - Booking and Service Commerce

Focus:

- service profiles
- booking slots
- staff calendars
- service duration
- deposits
- cancellation/no-show rules
- reminders
- booking campaigns

### Phase 8 - Delivery, Dispatch and Service Areas

Focus:

- delivery zones
- driver teams
- agents
- availability
- task assignment
- geofences
- auto-allocation
- proof of delivery
- tracking URL
- pricing rules

### Phase 9 - Finance, B2B and Advanced Commerce

Focus:

- vendor payouts
- accounting exports
- subscriptions/vendor plans
- tax rules
- bulk pricing
- B2B customer flow
- MOQ
- multi-currency
- additional payment gateways

### Phase 10 - Advanced Growth and Analytics

Focus:

- loyalty cards
- advanced campaigns
- banner placements
- CRM automation
- city/category performance reports
- campaign ROI
- scheduled reports
- partner dashboards

## Final Recommendation

1. The old platform should be treated as a product requirements archive, not as reusable architecture.
2. No legacy code should be copied into the rebuild.
3. The new rebuild should preserve validated business capabilities but implement them through modern, modular, automation-first architecture.
4. The biggest old-platform failure was not lack of features; it was lack of automation and maintainability.
5. Phase 5 should focus on production readiness before adding more features.
6. Phase 6 should add admin-only vendor recruitment intelligence.
7. Booking, dispatch, B2B, finance, and advanced analytics should be rebuilt in later phases as clean modules.

Preserve the business logic. Reject the old implementation. Rebuild automation-first.
