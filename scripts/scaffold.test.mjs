import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import path from "node:path";

const root = process.cwd();

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("workspace contains the requested apps and packages", async () => {
  const workspace = await read("pnpm-workspace.yaml");
  const rootPackage = JSON.parse(await read("package.json"));

  assert.match(workspace, /apps\/\*/);
  assert.match(workspace, /packages\/\*/);
  assert.equal(rootPackage.private, true);
  assert.equal(rootPackage.scripts.test, "node --test scripts/*.test.mjs");
});

test("api health check and database connection hooks exist", async () => {
  const healthService = await read("apps/api/src/modules/health/health.service.ts");
  const databasePackage = await read("packages/database/src/index.ts");

  assert.match(healthService, /status: "ok"/);
  assert.match(healthService, /buzzystores-api/);
  assert.match(healthService, /getDatabaseHealth/);
  assert.match(databasePackage, /checkDatabaseConnection/);
  assert.match(databasePackage, /SELECT 1/);
});

test("prisma schema includes the Phase 1 foundation entities", async () => {
  const schema = await read("packages/database/prisma/schema.prisma");
  const requiredModels = [
    "User",
    "Vendor",
    "VendorLifecycleEvent",
    "Storefront",
    "Category",
    "Listing",
    "Order",
    "Campaign",
    "AIJob",
    "AIOutput",
    "QRCode",
    "Notification",
    "AuditLog"
  ];

  for (const model of requiredModels) {
    assert.match(schema, new RegExp(`model ${model} \\{`));
  }

  assert.match(schema, /enum VendorLifecycleStage/);
  assert.match(schema, /enum ListingType/);
  assert.match(schema, /enum OrderStatus/);
  assert.match(schema, /provider = "postgresql"/);
});

test("local infrastructure includes PostgreSQL/PostGIS and Redis", async () => {
  const compose = await read("docker-compose.yml");

  assert.match(compose, /postgis\/postgis:16-3\.4/);
  assert.match(compose, /redis:7-alpine/);
  assert.match(compose, /5432:5432/);
  assert.match(compose, /6379:6379/);
});

test("environment example exposes the required configuration contract", async () => {
  const envExample = await read(".env.example");
  const requiredKeys = [
    "DATABASE_URL",
    "REDIS_URL",
    "NEXT_PUBLIC_APP_URL",
    "API_BASE_URL",
    "JWT_SECRET",
    "OPENAI_API_KEY",
    "AI_PROVIDER",
    "EMAIL_PROVIDER",
    "SMS_PROVIDER",
    "WHATSAPP_PROVIDER",
    "STRIPE_SECRET_KEY",
    "OBJECT_STORAGE_BUCKET",
    "MAPS_API_KEY"
  ];

  for (const key of requiredKeys) {
    assert.match(envExample, new RegExp(`^${key}=`, "m"));
  }
});
