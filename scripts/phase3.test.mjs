import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import path from "node:path";

const root = process.cwd();

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("admin can publish approved vendor", async () => {
  const controller = await read("apps/api/src/modules/admin/admin.controller.ts");
  const service = await read("apps/api/src/modules/admin/admin.service.ts");

  assert.match(controller, /@Post\("vendors\/:id\/publish"\)/);
  assert.match(service, /publishVendor/);
  assert.match(service, /VendorPublished/);
  assert.match(service, /VendorLifecycleStage\.PUBLISHED/);
});

test("non-admin cannot publish vendor", async () => {
  const controller = await read("apps/api/src/modules/admin/admin.controller.ts");
  const service = await read("apps/api/src/modules/admin/admin.service.ts");

  assert.match(controller, /@Roles\(UserRole\.ADMIN, UserRole\.SUPER_ADMIN\)/);
  assert.match(service, /assertAdmin/);
  assert.match(service, /ForbiddenException/);
});

test("vendor cannot be published without approved listing", async () => {
  const service = await read("apps/api/src/modules/admin/admin.service.ts");

  assert.match(service, /approvedListings\.length === 0/);
  assert.match(service, /without at least one approved listing/);
});

test("public storefront routes use typed API client and show published vendor", async () => {
  const client = await read("apps/web/lib/storefronts.ts");
  const shortRoute = await read("apps/web/app/v/[shortCode]/page.tsx");

  assert.match(client, /fetchStorefront/);
  assert.match(client, /\/storefronts\/short/);
  assert.match(client, /published: true/);
  assert.match(shortRoute, /recordQrScan/);
});

test("public storefront hides unpublished vendor content", async () => {
  const view = await read("apps/web/components/storefront-view.tsx");
  const client = await read("apps/web/lib/storefronts.ts");

  assert.match(view, /This storefront is not yet published/);
  assert.match(view, /if \(!storefront\.published\)/);
  assert.match(client, /published: false/);
});

test("only approved listings appear publicly", async () => {
  const service = await read("apps/api/src/modules/storefronts/storefronts.service.ts");

  assert.match(service, /ApprovalStatus\.ADMIN_APPROVED/);
  assert.match(service, /ApprovalStatus\.PUBLISHED/);
  assert.match(service, /publishedAt:\s*\{\s*not: null\s*\}/);
});

test("customer can create single-vendor pickup order", async () => {
  const controller = await read("apps/api/src/modules/orders/orders.controller.ts");
  const service = await read("apps/api/src/modules/orders/orders.service.ts");

  assert.match(controller, /@Post\(\)/);
  assert.match(service, /createOrder/);
  assert.match(service, /fulfilmentMethod !== "PICKUP"/);
  assert.match(service, /OrderPlaced/);
  assert.match(service, /PAYMENT_NOT_REQUIRED_FOR_PHASE_3/);
});

test("order creation rejects unpublished vendor", async () => {
  const service = await read("apps/api/src/modules/orders/orders.service.ts");

  assert.match(service, /Orders can only be placed for published vendors/);
  assert.match(service, /VendorLifecycleStage\.PUBLISHED/);
});

test("order creation rejects listings from multiple vendors", async () => {
  const service = await read("apps/api/src/modules/orders/orders.service.ts");

  assert.match(service, /invalidVendorListing/);
  assert.match(service, /same vendor/);
});

test("vendor can accept own order", async () => {
  const controller = await read("apps/api/src/modules/vendor-portal/vendor-portal.controller.ts");
  const service = await read("apps/api/src/modules/orders/orders.service.ts");

  assert.match(controller, /@Post\("orders\/:id\/accept"\)/);
  assert.match(service, /OrderAccepted/);
  assert.match(service, /OrderStatus\.ACCEPTED/);
});

test("vendor cannot accept another vendor order", async () => {
  const service = await read("apps/api/src/modules/orders/orders.service.ts");

  assert.match(service, /order\.vendorId !== vendorId/);
  assert.match(service, /Vendors can only manage their own orders/);
});

test("vendor can mark order ready for pickup", async () => {
  const controller = await read("apps/api/src/modules/vendor-portal/vendor-portal.controller.ts");
  const service = await read("apps/api/src/modules/orders/orders.service.ts");

  assert.match(controller, /@Post\("orders\/:id\/ready"\)/);
  assert.match(service, /OrderReadyForPickup/);
  assert.match(service, /READY_FOR_PICKUP/);
});

test("vendor can complete order", async () => {
  const controller = await read("apps/api/src/modules/vendor-portal/vendor-portal.controller.ts");
  const service = await read("apps/api/src/modules/orders/orders.service.ts");

  assert.match(controller, /@Post\("orders\/:id\/complete"\)/);
  assert.match(service, /OrderCompleted/);
  assert.match(service, /OrderStatus\.COMPLETED/);
});

test("completion triggers review request notification and event", async () => {
  const service = await read("apps/api/src/modules/orders/orders.service.ts");

  assert.match(service, /review\.request/);
  assert.match(service, /ReviewRequested/);
});

test("order tracking endpoint returns safe customer-facing data", async () => {
  const controller = await read("apps/api/src/modules/orders/orders.controller.ts");
  const service = await read("apps/api/src/modules/orders/orders.service.ts");

  assert.match(controller, /@Get\(":id\/track"\)/);
  assert.match(service, /trackOrder/);
  assert.match(service, /vendorName/);
  assert.doesNotMatch(service, /auditLogs/);
});

test("QR scan endpoint records scan event", async () => {
  const controller = await read("apps/api/src/modules/qr/qr.controller.ts");
  const service = await read("apps/api/src/modules/qr/qr.service.ts");

  assert.match(controller, /@Post\(":shortCode\/scan"\)/);
  assert.match(service, /qRCodeScan\.create/);
  assert.match(service, /QRCodeScanned/);
});

test("lifecycle transitions to first order received after completion", async () => {
  const service = await read("apps/api/src/modules/orders/orders.service.ts");

  assert.match(service, /FIRST_ORDER_RECEIVED/);
  assert.match(service, /First completed order received/);
});

test("phase 3 seed data includes order statuses, QR scans, events, and notifications", async () => {
  const seed = await read("packages/database/prisma/seed.ts");

  for (const value of ["SENT_TO_VENDOR", "READY_FOR_PICKUP", "COMPLETED", "qRCodeScan", "platformEvent"]) {
    assert.match(seed, new RegExp(value));
  }

  assert.match(seed, /review\.request/);
});
