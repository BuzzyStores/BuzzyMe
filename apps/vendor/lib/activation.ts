export type VendorOnboardingReview = {
  vendorName: string;
  aiOutputId: string;
  profileDraft: {
    headline: string;
    shortDescription: string;
    longDescription: string;
    missingFields: string[];
    suggestedFirstCampaign: string;
  };
  catalogueItems: Array<{
    title: string;
    price: number;
    currency: string;
    approvalStatus: string;
  }>;
};

export async function getVendorOnboardingReview(): Promise<VendorOnboardingReview> {
  return {
    vendorName: "Akwasaba Kitchen",
    aiOutputId: "mock-ai-output-vendor-profile",
    profileDraft: {
      headline: "Akwasaba Kitchen is getting ready on BuzzyStores",
      shortDescription: "Ghanaian lunch bowls, pantry staples, and weekend family trays.",
      longDescription:
        "A neighbourhood kitchen preparing a QR-ready storefront for pickup, local delivery, campaigns, and repeat customers.",
      missingFields: ["QR poster delivery confirmation", "final opening hours"],
      suggestedFirstCampaign: "Weekend Family Jollof Bundle"
    },
    catalogueItems: [
      {
        title: "Jollof Rice",
        price: 120,
        currency: "SEK",
        approvalStatus: "AI_GENERATED"
      },
      {
        title: "Waakye",
        price: 110,
        currency: "SEK",
        approvalStatus: "AI_GENERATED"
      },
      {
        title: "Sobolo",
        price: 40,
        currency: "SEK",
        approvalStatus: "AI_GENERATED"
      }
    ]
  };
}

export async function reviewAiOutput(action: "approve" | "request-changes") {
  return {
    status: action === "approve" ? "VENDOR_APPROVED" : "CHANGES_REQUESTED",
    reviewedAt: new Date().toISOString()
  };
}
