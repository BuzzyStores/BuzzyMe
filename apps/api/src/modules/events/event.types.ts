export type PlatformEventType =
  | "VendorPublished"
  | "ListingApproved"
  | "ListingRejected"
  | "OrderPlaced"
  | "OrderAccepted"
  | "OrderRejected"
  | "OrderReadyForPickup"
  | "OrderCompleted"
  | "ReviewRequested"
  | "QRCodeScanned";

export type PublishEventInput = {
  type: PlatformEventType;
  vendorId?: string;
  orderId?: string;
  entityType?: string;
  entityId?: string;
  payload?: Record<string, unknown>;
};
