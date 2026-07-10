-- Phase 3 QR storefront publishing, pickup orders, and internal event records.

CREATE TABLE "QRCodeScan" (
  "id" TEXT NOT NULL,
  "qrCodeId" TEXT NOT NULL,
  "shortCode" TEXT NOT NULL,
  "referrer" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "QRCodeScan_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "QRCodeScan"
  ADD CONSTRAINT "QRCodeScan_qrCodeId_fkey"
  FOREIGN KEY ("qrCodeId") REFERENCES "QRCode"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "QRCodeScan_shortCode_createdAt_idx" ON "QRCodeScan"("shortCode", "createdAt");

CREATE TABLE "PlatformEvent" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "vendorId" TEXT,
  "orderId" TEXT,
  "entityType" TEXT,
  "entityId" TEXT,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PlatformEvent_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "PlatformEvent"
  ADD CONSTRAINT "PlatformEvent_vendorId_fkey"
  FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PlatformEvent"
  ADD CONSTRAINT "PlatformEvent_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "PlatformEvent_type_createdAt_idx" ON "PlatformEvent"("type", "createdAt");
CREATE INDEX "PlatformEvent_vendorId_idx" ON "PlatformEvent"("vendorId");
CREATE INDEX "PlatformEvent_orderId_idx" ON "PlatformEvent"("orderId");
