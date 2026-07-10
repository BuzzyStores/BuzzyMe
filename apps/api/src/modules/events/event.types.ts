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
  | "QRCodeScanned"
  | "CampaignDraftGenerated"
  | "CampaignVendorApproved"
  | "CampaignAdminApproved"
  | "CampaignActivated"
  | "CampaignPaused"
  | "CampaignEnded"
  | "CouponApplied"
  | "CustomerProfileCreated"
  | "CustomerProfileUpdated"
  | "RetentionSuggestionGenerated"
  | "ReviewSubmitted"
  | "VendorHealthScoreUpdated";

export type PublishEventInput = {
  type: PlatformEventType;
  vendorId?: string;
  orderId?: string;
  entityType?: string;
  entityId?: string;
  payload?: Record<string, unknown>;
};
