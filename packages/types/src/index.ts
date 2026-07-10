export enum UserRole {
  CONSUMER = "CONSUMER",
  VENDOR_OWNER = "VENDOR_OWNER",
  VENDOR_STAFF = "VENDOR_STAFF",
  DRIVER = "DRIVER",
  AMBASSADOR = "AMBASSADOR",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
  PARTNER_VIEWER = "PARTNER_VIEWER",
  AI_AGENT = "AI_AGENT"
}

export enum VendorLifecycleStage {
  LEAD_IDENTIFIED = "LEAD_IDENTIFIED",
  CONTACTED = "CONTACTED",
  INTERESTED = "INTERESTED",
  INFO_COLLECTED = "INFO_COLLECTED",
  STORE_DRAFTED = "STORE_DRAFTED",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  PUBLISHED = "PUBLISHED",
  QR_DELIVERED = "QR_DELIVERED",
  FIRST_CAMPAIGN_LAUNCHED = "FIRST_CAMPAIGN_LAUNCHED",
  FIRST_ORDER_RECEIVED = "FIRST_ORDER_RECEIVED",
  ACTIVE = "ACTIVE",
  AT_RISK = "AT_RISK",
  DORMANT = "DORMANT",
  CHURNED = "CHURNED",
  REACTIVATION = "REACTIVATION"
}

export enum ListingType {
  PHYSICAL_PRODUCT = "PHYSICAL_PRODUCT",
  FOOD_MENU_ITEM = "FOOD_MENU_ITEM",
  SERVICE = "SERVICE",
  BOOKABLE_APPOINTMENT = "BOOKABLE_APPOINTMENT",
  RENTAL_ITEM = "RENTAL_ITEM",
  CIRCULAR_ITEM = "CIRCULAR_ITEM",
  DIASPORA_ORDER_ITEM = "DIASPORA_ORDER_ITEM"
}

export enum ApprovalStatus {
  DRAFT = "DRAFT",
  AI_GENERATED = "AI_GENERATED",
  VENDOR_APPROVED = "VENDOR_APPROVED",
  ADMIN_APPROVED = "ADMIN_APPROVED",
  REJECTED = "REJECTED",
  PUBLISHED = "PUBLISHED"
}

export enum CampaignStatus {
  DRAFT = "DRAFT",
  AI_GENERATED = "AI_GENERATED",
  VENDOR_APPROVED = "VENDOR_APPROVED",
  ADMIN_APPROVED = "ADMIN_APPROVED",
  SCHEDULED = "SCHEDULED",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  ENDED = "ENDED",
  REJECTED = "REJECTED"
}

export enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT"
}

export enum OrderType {
  PICKUP = "PICKUP",
  DELIVERY = "DELIVERY",
  DINE_IN = "DINE_IN",
  TAKEAWAY = "TAKEAWAY",
  BOOKING = "BOOKING",
  RENTAL = "RENTAL",
  SERVICE_REQUEST = "SERVICE_REQUEST",
  QUOTE_REQUEST = "QUOTE_REQUEST",
  DIASPORA_ORDER = "DIASPORA_ORDER"
}

export enum OrderStatus {
  CREATED = "CREATED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PAID = "PAID",
  SENT_TO_VENDOR = "SENT_TO_VENDOR",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  PREPARING = "PREPARING",
  READY_FOR_PICKUP = "READY_FOR_PICKUP",
  DRIVER_ASSIGNED = "DRIVER_ASSIGNED",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  REFUND_REQUESTED = "REFUND_REQUESTED",
  REFUNDED = "REFUNDED",
  DISPUTED = "DISPUTED"
}

export enum CampaignType {
  LUNCH_DEAL = "LUNCH_DEAL",
  WEEKEND_OFFER = "WEEKEND_OFFER",
  STUDENT_DEAL = "STUDENT_DEAL",
  FAMILY_BUNDLE = "FAMILY_BUNDLE",
  BEAUTY_BOOKING = "BEAUTY_BOOKING",
  REPAIR_CAMPAIGN = "REPAIR_CAMPAIGN",
  CIRCULAR_COMMERCE = "CIRCULAR_COMMERCE",
  DIASPORA_SEND_HOME = "DIASPORA_SEND_HOME",
  LOCAL_EVENT = "LOCAL_EVENT",
  CLEARANCE = "CLEARANCE",
  LOYALTY = "LOYALTY"
}

export type AiCampaignDraft = {
  title: string;
  description: string;
  offerText: string;
  suggestedListings: string[];
  suggestedDiscount: {
    type: DiscountType;
    value: number;
  };
  whatsappCopy: string;
  instagramCaption: string;
  smsCopy: string;
  qrPosterHeadline: string;
  qrPosterSubtext: string;
  recommendedStartDate: string;
  recommendedEndDate: string;
};

export type CampaignSummary = {
  id: string;
  vendorId: string;
  title: string;
  campaignType: CampaignType;
  status: CampaignStatus;
  offerText?: string | null;
  couponCode?: string | null;
  campaignUrl?: string | null;
};

export type VendorCustomerSegment = "repeat" | "inactive" | "highValue" | "firstTime";

export type RetentionSuggestion = {
  segment: VendorCustomerSegment;
  customerIds: string[];
  suggestedActions: string[];
  messageDrafts: string[];
};

export type VendorHealthStatus = "GOOD" | "NEEDS_ATTENTION" | "AT_RISK";

export type VendorHealthSummary = {
  score: number;
  status: VendorHealthStatus;
  reasons: string[];
  recommendedActions: string[];
};

export enum NotificationChannel {
  EMAIL = "EMAIL",
  SMS = "SMS",
  WHATSAPP = "WHATSAPP",
  IN_APP = "IN_APP",
  PUSH = "PUSH"
}

export enum LifecycleTrigger {
  USER = "USER",
  ADMIN = "ADMIN",
  AI_AGENT = "AI_AGENT",
  SYSTEM = "SYSTEM"
}

export type VendorRegistrationRequest = {
  businessName: string;
  ownerName: string;
  email?: string;
  phone: string;
  categoryHint?: string;
  address?: string;
  city?: string;
  country?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  websiteUrl?: string;
  description?: string;
  openingHoursText?: string;
  productText?: string;
  preferredLanguage?: "en" | "sv";
};

export type VendorIntakeDraft = {
  suggestedStorefrontHeadline: string;
  suggestedShortDescription: string;
  suggestedLongDescription: string;
  suggestedCategories: string[];
  missingFields: string[];
  trustFlags: string[];
  recommendedNextAction: string;
  suggestedFirstCampaign: string;
};

export type CatalogueDraftListing = {
  title: string;
  listingType: ListingType;
  price: number;
  currency: string;
  shortDescription: string;
  suggestedCategory: string;
  tags: string[];
  approvalStatus: ApprovalStatus;
};

export type CatalogueDraft = {
  listings: CatalogueDraftListing[];
};

export type ApiHealth = {
  status: "ok";
  service: "buzzystores-api";
  timestamp: string;
};

export type VendorActivationSummary = {
  vendorId: string;
  lifecycleStage: VendorLifecycleStage;
  activationScore: number;
  healthScore: number;
  nextAction: string | null;
};
