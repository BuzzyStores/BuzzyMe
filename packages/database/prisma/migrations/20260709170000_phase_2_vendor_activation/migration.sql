-- Phase 2 vendor activation flow fields.

CREATE TYPE "LifecycleTrigger" AS ENUM ('USER', 'ADMIN', 'AI_AGENT', 'SYSTEM');

ALTER TABLE "Vendor"
  ADD COLUMN "address" TEXT,
  ADD COLUMN "city" TEXT,
  ADD COLUMN "country" TEXT,
  ADD COLUMN "instagramUrl" TEXT,
  ADD COLUMN "facebookUrl" TEXT,
  ADD COLUMN "preferredLanguage" TEXT DEFAULT 'en',
  ADD COLUMN "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'DRAFT';

ALTER TABLE "VendorLifecycleEvent"
  ADD COLUMN "trigger" "LifecycleTrigger" NOT NULL DEFAULT 'SYSTEM',
  ADD COLUMN "metadata" JSONB;

ALTER TABLE "AIOutput"
  ADD COLUMN "vendorId" TEXT,
  ADD COLUMN "reviewedById" TEXT,
  ADD COLUMN "reviewedAt" TIMESTAMP(3),
  ADD COLUMN "reviewNote" TEXT;

UPDATE "AIOutput"
SET "vendorId" = "AIJob"."vendorId"
FROM "AIJob"
WHERE "AIOutput"."aiJobId" = "AIJob"."id";

ALTER TABLE "AIOutput"
  ADD CONSTRAINT "AIOutput_vendorId_fkey"
  FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "AIOutput_vendorId_idx" ON "AIOutput"("vendorId");

ALTER TABLE "AuditLog"
  ADD COLUMN "actorRole" "UserRole",
  ADD COLUMN "metadata" JSONB;
