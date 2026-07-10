-- Phase 4: Campaign engine, coupons, vendor CRM, retention, reviews, and health scoring.

CREATE TYPE "CampaignStatus" AS ENUM (
  'DRAFT',
  'AI_GENERATED',
  'VENDOR_APPROVED',
  'ADMIN_APPROVED',
  'SCHEDULED',
  'ACTIVE',
  'PAUSED',
  'ENDED',
  'REJECTED'
);

CREATE TYPE "DiscountType" AS ENUM (
  'PERCENTAGE',
  'FIXED_AMOUNT'
);

ALTER TABLE "Vendor"
  ADD COLUMN "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "reviewCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "repeatCustomerCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Order"
  ADD COLUMN "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "couponId" TEXT;

ALTER TABLE "Campaign"
  ADD COLUMN "aiOutputId" TEXT,
  ADD COLUMN "title" TEXT,
  ADD COLUMN "description" TEXT,
  ADD COLUMN "offerText" TEXT,
  ADD COLUMN "selectedListingIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "discountType" "DiscountType",
  ADD COLUMN "discountValue" DECIMAL(12,2),
  ADD COLUMN "minimumOrderAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "usageLimit" INTEGER,
  ADD COLUMN "startDate" TIMESTAMP(3),
  ADD COLUMN "endDate" TIMESTAMP(3),
  ADD COLUMN "qrShortCode" TEXT,
  ADD COLUMN "campaignUrl" TEXT,
  ADD COLUMN "instagramCaption" TEXT,
  ADD COLUMN "qrPosterHeadline" TEXT,
  ADD COLUMN "qrPosterSubtext" TEXT,
  ADD COLUMN "impressions" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "visits" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "orderCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "revenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "rejectionReason" TEXT;

ALTER TABLE "Campaign"
  ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Campaign"
  ALTER COLUMN "status" TYPE "CampaignStatus"
  USING (
    CASE
      WHEN "status"::TEXT = 'PUBLISHED' THEN 'ACTIVE'
      ELSE "status"::TEXT
    END::"CampaignStatus"
  );

ALTER TABLE "Campaign"
  ALTER COLUMN "status" SET DEFAULT 'DRAFT';

CREATE UNIQUE INDEX "Campaign_qrShortCode_key" ON "Campaign"("qrShortCode");

CREATE TABLE "Coupon" (
  "id" TEXT NOT NULL,
  "vendorId" TEXT NOT NULL,
  "campaignId" TEXT,
  "code" TEXT NOT NULL,
  "discountType" "DiscountType" NOT NULL,
  "discountValue" DECIMAL(12,2) NOT NULL,
  "minimumOrderAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "usageLimit" INTEGER,
  "usedCount" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");
CREATE INDEX "Coupon_vendorId_active_idx" ON "Coupon"("vendorId", "active");
CREATE INDEX "Coupon_campaignId_idx" ON "Coupon"("campaignId");

CREATE TABLE "VendorCustomerProfile" (
  "id" TEXT NOT NULL,
  "vendorId" TEXT NOT NULL,
  "customerId" TEXT,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "orderCount" INTEGER NOT NULL DEFAULT 0,
  "totalSpend" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "lastOrderDate" TIMESTAMP(3),
  "firstOrderDate" TIMESTAMP(3),
  "preferredFulfilment" TEXT,
  "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VendorCustomerProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VendorCustomerProfile_vendorId_phone_key" ON "VendorCustomerProfile"("vendorId", "phone");
CREATE INDEX "VendorCustomerProfile_vendorId_orderCount_idx" ON "VendorCustomerProfile"("vendorId", "orderCount");
CREATE INDEX "VendorCustomerProfile_vendorId_lastOrderDate_idx" ON "VendorCustomerProfile"("vendorId", "lastOrderDate");

CREATE TABLE "Review" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "vendorId" TEXT NOT NULL,
  "customerId" TEXT,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "approved" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Review_orderId_key" ON "Review"("orderId");
CREATE INDEX "Review_vendorId_approved_idx" ON "Review"("vendorId", "approved");

ALTER TABLE "Campaign"
  ADD CONSTRAINT "Campaign_aiOutputId_fkey"
  FOREIGN KEY ("aiOutputId") REFERENCES "AIOutput"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Coupon"
  ADD CONSTRAINT "Coupon_vendorId_fkey"
  FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Coupon"
  ADD CONSTRAINT "Coupon_campaignId_fkey"
  FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Order"
  ADD CONSTRAINT "Order_couponId_fkey"
  FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VendorCustomerProfile"
  ADD CONSTRAINT "VendorCustomerProfile_vendorId_fkey"
  FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VendorCustomerProfile"
  ADD CONSTRAINT "VendorCustomerProfile_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Review"
  ADD CONSTRAINT "Review_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review"
  ADD CONSTRAINT "Review_vendorId_fkey"
  FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review"
  ADD CONSTRAINT "Review_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
