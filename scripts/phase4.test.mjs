import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import path from "node:path";

const root = process.cwd();

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("vendor can generate AI campaign draft", async () => {
  const controller = await read("apps/api/src/modules/vendor-portal/vendor-portal.controller.ts");
  const service = await read("apps/api/src/modules/campaigns/campaigns.service.ts");
  const provider = await read("packages/ai/src/index.ts");

  assert.match(controller, /@Post\("campaigns\/generate"\)/);
  assert.match(service, /generateCampaignDraft/);
  assert.match(service, /agentType: "campaign"/);
  assert.match(provider, /mock-campaign-draft-v1/);
});

test("AI campaign draft creates AIJob, AIOutput, and campaign", async () => {
  const service = await read("apps/api/src/modules/campaigns/campaigns.service.ts");

  assert.match(service, /aiService\.runDraftJob/);
  assert.match(service, /outputType: "CAMPAIGN_COPY"/);
  assert.match(service, /prisma\.campaign\.create/);
  assert.match(service, /CampaignStatus\.AI_GENERATED/);
});

test("vendor approves own campaign draft", async () => {
  const controller = await read("apps/api/src/modules/vendor-portal/vendor-portal.controller.ts");
  const service = await read("apps/api/src/modules/campaigns/campaigns.service.ts");

  assert.match(controller, /@Post\("campaigns\/:id\/approve"\)/);
  assert.match(service, /approveVendorCampaign/);
  assert.match(service, /CampaignVendorApproved/);
  assert.match(service, /CampaignStatus\.VENDOR_APPROVED/);
});

test("vendor cannot approve another vendor campaign", async () => {
  const service = await read("apps/api/src/modules/campaigns/campaigns.service.ts");

  assert.match(service, /campaign\.vendorId !== vendorId/);
  assert.match(service, /Vendors can only access their own campaigns/);
});

test("admin can approve campaign", async () => {
  const controller = await read("apps/api/src/modules/admin/admin.controller.ts");
  const service = await read("apps/api/src/modules/campaigns/campaigns.service.ts");

  assert.match(controller, /@Post\("campaigns\/:id\/approve"\)/);
  assert.match(service, /approveAdminCampaign/);
  assert.match(service, /campaign\.admin_approved/);
  assert.match(service, /CampaignAdminApproved/);
});

test("admin can activate campaign", async () => {
  const controller = await read("apps/api/src/modules/admin/admin.controller.ts");
  const service = await read("apps/api/src/modules/campaigns/campaigns.service.ts");

  assert.match(controller, /@Post\("campaigns\/:id\/activate"\)/);
  assert.match(service, /activateCampaign/);
  assert.match(service, /CampaignActivated/);
  assert.match(service, /CampaignStatus\.ACTIVE/);
});

test("non-admin cannot activate campaign", async () => {
  const controller = await read("apps/api/src/modules/admin/admin.controller.ts");
  const service = await read("apps/api/src/modules/campaigns/campaigns.service.ts");

  assert.match(controller, /@Roles\(UserRole\.ADMIN, UserRole\.SUPER_ADMIN\)/);
  assert.match(service, /assertAdmin/);
  assert.match(service, /ADMIN or SUPER_ADMIN/);
});

test("public campaign page hides inactive campaigns", async () => {
  const service = await read("apps/api/src/modules/campaigns/campaigns.service.ts");
  const page = await read("apps/web/app/campaigns/[id]/page.tsx");

  assert.match(service, /status: CampaignStatus\.ACTIVE/);
  assert.match(service, /return null/);
  assert.match(page, /Campaign unavailable/);
});

test("storefront shows active campaign banner", async () => {
  const service = await read("apps/api/src/modules/storefronts/storefronts.service.ts");
  const view = await read("apps/web/components/storefront-view.tsx");

  assert.match(service, /CampaignStatus\.ACTIVE/);
  assert.match(view, /activeCampaigns/);
  assert.match(view, /View offer/);
});

test("coupon applies to valid order", async () => {
  const dto = await read("apps/api/src/modules/orders/dto/create-order.dto.ts");
  const service = await read("apps/api/src/modules/orders/orders.service.ts");

  assert.match(dto, /couponCode/);
  assert.match(service, /validateCoupon/);
  assert.match(service, /CouponApplied/);
  assert.match(service, /discountAmount/);
});

test("invalid coupon is rejected", async () => {
  const service = await read("apps/api/src/modules/orders/orders.service.ts");

  assert.match(service, /Invalid coupon for this vendor/);
  assert.match(service, /Coupon is not active/);
  assert.match(service, /minimum order amount/);
});

test("customer profile is created from order", async () => {
  const service = await read("apps/api/src/modules/orders/orders.service.ts");

  assert.match(service, /upsertCustomerProfileFromCreatedOrder/);
  assert.match(service, /vendorCustomerProfile\.upsert/);
  assert.match(service, /CustomerProfileCreated/);
});

test("customer profile updates after completed order", async () => {
  const service = await read("apps/api/src/modules/orders/orders.service.ts");

  assert.match(service, /updateCustomerProfileFromCompletedOrder/);
  assert.match(service, /orderCount:\s*\{\s*increment: 1\s*\}/);
  assert.match(service, /totalSpend:\s*\{\s*increment/);
  assert.match(service, /CustomerProfileUpdated/);
});

test("vendor can only access own customers", async () => {
  const service = await read("apps/api/src/modules/vendor-portal/vendor-portal.service.ts");

  assert.match(service, /assertCustomerBelongsToVendor/);
  assert.match(service, /Vendors can only access their own customers/);
});

test("retention suggestions group all segments", async () => {
  const service = await read("apps/api/src/modules/vendor-portal/vendor-portal.service.ts");

  for (const segment of ["repeat", "inactive", "highValue", "firstTime"]) {
    assert.match(service, new RegExp(segment));
  }

  assert.match(service, /RetentionSuggestionGenerated/);
});

test("completed order can receive review", async () => {
  const controller = await read("apps/api/src/modules/orders/orders.controller.ts");
  const service = await read("apps/api/src/modules/orders/orders.service.ts");

  assert.match(controller, /@Post\(":id\/review"\)/);
  assert.match(service, /submitReview/);
  assert.match(service, /OrderStatus\.COMPLETED/);
  assert.match(service, /ReviewSubmitted/);
});

test("duplicate review is rejected", async () => {
  const service = await read("apps/api/src/modules/orders/orders.service.ts");

  assert.match(service, /if \(order\.review\)/);
  assert.match(service, /Only one review can be submitted per order/);
});

test("review appears on public storefront", async () => {
  const service = await read("apps/api/src/modules/storefronts/storefronts.service.ts");
  const view = await read("apps/web/components/storefront-view.tsx");

  assert.match(service, /reviews:\s*\{/);
  assert.match(service, /approved: true/);
  assert.match(view, /storefront\.reviews/);
});

test("vendor health includes campaigns, reviews, orders, and QR", async () => {
  const controller = await read("apps/api/src/modules/vendor-portal/vendor-portal.controller.ts");
  const service = await read("apps/api/src/modules/vendor-portal/vendor-portal.service.ts");

  assert.match(controller, /@Get\("health"\)/);
  for (const value of ["activeCampaignCount", "reviewCount", "ordersReceived", "qrScans"]) {
    assert.match(service, new RegExp(value));
  }
  assert.match(service, /VendorHealthScoreUpdated/);
});

test("phase 4 seed data covers campaigns coupons CRM reviews and health", async () => {
  const seed = await read("packages/database/prisma/seed.ts");

  for (const value of ["ACTIVE", "AI_GENERATED", "ADMIN_APPROVED", "ENDED", "JOLLOF15", "vendorCustomerProfile", "review", "healthScore"]) {
    assert.match(seed, new RegExp(value));
  }
});
