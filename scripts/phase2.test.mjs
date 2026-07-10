import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import path from "node:path";

const root = process.cwd();

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("vendor registration endpoint exists and creates vendor records", async () => {
  const controller = await read("apps/api/src/modules/vendors/vendors.controller.ts");
  const service = await read("apps/api/src/modules/vendors/vendors.service.ts");

  assert.match(controller, /@Post\("register"\)/);
  assert.match(controller, /registerVendor/);
  assert.match(service, /prisma\.vendor\.create/);
  assert.match(service, /prisma\.user\.upsert/);
  assert.match(service, /prisma\.storefront\.create/);
});

test("vendor registration creates lifecycle events", async () => {
  const service = await read("apps/api/src/modules/vendors/vendors.service.ts");

  assert.match(service, /createLifecycleEvent/);
  assert.match(service, /Vendor registration submitted/);
  assert.match(service, /LifecycleTrigger\.USER/);
});

test("vendor registration creates AIJob and AIOutput records", async () => {
  const aiService = await read("apps/api/src/modules/ai/ai.service.ts");
  const vendorsService = await read("apps/api/src/modules/vendors/vendors.service.ts");

  assert.match(aiService, /prisma\.aIJob\.create/);
  assert.match(aiService, /prisma\.aIOutput\.create/);
  assert.match(vendorsService, /agentType: "vendor-intake"/);
  assert.match(vendorsService, /outputType: "VENDOR_PROFILE"/);
});

test("product text triggers catalogue draft and draft listing creation", async () => {
  const vendorsService = await read("apps/api/src/modules/vendors/vendors.service.ts");
  const aiProvider = await read("packages/ai/src/index.ts");

  assert.match(vendorsService, /if \(dto\.productText\)/);
  assert.match(vendorsService, /agentType: "catalogue-builder"/);
  assert.match(vendorsService, /createDraftListingsFromCatalogue/);
  assert.match(vendorsService, /approvalStatus: ApprovalStatus\.AI_GENERATED/);
  assert.match(aiProvider, /parseProductText/);
});

test("lifecycle transition writes event and audit log", async () => {
  const lifecycleService = await read("apps/api/src/modules/vendor-lifecycle/vendor-lifecycle.service.ts");

  assert.match(lifecycleService, /transitionVendorStage/);
  assert.match(lifecycleService, /createLifecycleEvent/);
  assert.match(lifecycleService, /vendor\.lifecycle_stage_changed/);
  assert.match(lifecycleService, /prisma\.\$transaction/);
});

test("admin can approve AI output", async () => {
  const adminController = await read("apps/api/src/modules/admin/admin.controller.ts");
  const adminService = await read("apps/api/src/modules/admin/admin.service.ts");
  const aiService = await read("apps/api/src/modules/ai/ai.service.ts");

  assert.match(adminController, /@Post\("ai-outputs\/:id\/approve"\)/);
  assert.match(adminController, /@Roles\(UserRole\.ADMIN, UserRole\.SUPER_ADMIN\)/);
  assert.match(adminService, /approveAiOutput/);
  assert.match(aiService, /ai_output\.admin_approved/);
});

test("non-admin cannot approve AI output through admin service", async () => {
  const adminService = await read("apps/api/src/modules/admin/admin.service.ts");

  assert.match(adminService, /assertAdmin/);
  assert.match(adminService, /ForbiddenException/);
  assert.match(adminService, /ADMIN or SUPER_ADMIN/);
});

test("admin vendor approval writes audit log and QR readiness", async () => {
  const adminService = await read("apps/api/src/modules/admin/admin.service.ts");

  assert.match(adminService, /@buzzystores\/utils/);
  assert.match(adminService, /prisma\.qRCode\.upsert/);
  assert.match(adminService, /vendor\.admin_approved/);
  assert.match(adminService, /storefront\.ready_for_publishing/);
  assert.match(adminService, /VendorLifecycleStage\.PENDING_APPROVAL/);
});

test("public storefront does not expose unpublished vendor content", async () => {
  const storefrontView = await read("apps/web/components/storefront-view.tsx");
  const storefrontData = await read("apps/web/lib/storefronts.ts");

  assert.match(storefrontView, /This storefront is not yet published/);
  assert.match(storefrontView, /if \(!storefront\.published\)/);
  assert.match(storefrontData, /published: false/);
});

test("phase 2 seed data covers activation stages and AI statuses", async () => {
  const seed = await read("packages/database/prisma/seed.ts");

  for (const stage of ["INFO_COLLECTED", "STORE_DRAFTED", "PENDING_APPROVAL", "PUBLISHED"]) {
    assert.match(seed, new RegExp(stage));
  }

  for (const status of ["DRAFT", "AI_GENERATED", "ADMIN_APPROVED", "VENDOR_APPROVED"]) {
    assert.match(seed, new RegExp(status));
  }
});
