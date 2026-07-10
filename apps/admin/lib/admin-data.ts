export type AdminAiOutput = {
  id: string;
  vendorName: string;
  outputType: string;
  status: string;
  createdAt: string;
  preview: Record<string, unknown>;
};

export type PipelineVendor = {
  id: string;
  name: string;
  lifecycleStage: string;
  city: string;
  country: string;
  latestEvent: string;
  nextAction: string;
  approvalStatus: string;
};

export type AdminOrder = {
  orderNumber: string;
  vendor: string;
  customer: string;
  status: string;
  total: string;
  createdAt: string;
  latestStatusUpdate: string;
};

export async function getAdminAiOutputs(): Promise<AdminAiOutput[]> {
  return [
    {
      id: "aiout-info-collected",
      vendorName: "Akwasaba Kitchen",
      outputType: "VENDOR_PROFILE",
      status: "DRAFT",
      createdAt: "2026-07-09T10:00:00.000Z",
      preview: {
        headline: "Akwasaba Kitchen is getting ready on BuzzyStores",
        missingFields: ["final opening hours"],
        suggestedFirstCampaign: "Weekend Family Jollof Bundle"
      }
    },
    {
      id: "aiout-catalogue-draft",
      vendorName: "Repair Hub Solna",
      outputType: "LISTING_DRAFT",
      status: "AI_GENERATED",
      createdAt: "2026-07-09T11:30:00.000Z",
      preview: {
        listings: [
          {
            title: "Screen repair",
            price: 499,
            currency: "SEK"
          }
        ]
      }
    }
  ];
}

export async function getVendorPipeline(): Promise<PipelineVendor[]> {
  return [
    {
      id: "vendor-info",
      name: "Nordic Flowers",
      lifecycleStage: "INFO_COLLECTED",
      city: "Stockholm",
      country: "Sweden",
      latestEvent: "Vendor registration submitted",
      nextAction: "Review AI storefront draft",
      approvalStatus: "DRAFT"
    },
    {
      id: "vendor-drafted",
      name: "Repair Hub Solna",
      lifecycleStage: "STORE_DRAFTED",
      city: "Solna",
      country: "Sweden",
      latestEvent: "Catalogue draft generated",
      nextAction: "Vendor review of AI listing draft",
      approvalStatus: "AI_GENERATED"
    },
    {
      id: "vendor-pending",
      name: "Circular Closet",
      lifecycleStage: "PENDING_APPROVAL",
      city: "Gothenburg",
      country: "Sweden",
      latestEvent: "Admin approved activation draft",
      nextAction: "Publish QR storefront",
      approvalStatus: "ADMIN_APPROVED"
    },
    {
      id: "vendor-published",
      name: "Akwasaba Kitchen",
      lifecycleStage: "PUBLISHED",
      city: "Stockholm",
      country: "Sweden",
      latestEvent: "Storefront published",
      nextAction: "Deliver QR poster",
      approvalStatus: "PUBLISHED"
    }
  ];
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  return [
    {
      orderNumber: "BZ-2001",
      vendor: "Akwasaba Kitchen",
      customer: "Sara Lind",
      status: "SENT_TO_VENDOR",
      total: "258 SEK",
      createdAt: "2026-07-09T15:20:00.000Z",
      latestStatusUpdate: "Order placed"
    },
    {
      orderNumber: "BZ-2002",
      vendor: "Akwasaba Kitchen",
      customer: "Daniel Owusu",
      status: "READY_FOR_PICKUP",
      total: "120 SEK",
      createdAt: "2026-07-09T15:45:00.000Z",
      latestStatusUpdate: "Vendor marked ready"
    },
    {
      orderNumber: "BZ-1999",
      vendor: "Akwasaba Kitchen",
      customer: "Maya Chen",
      status: "COMPLETED",
      total: "129 SEK",
      createdAt: "2026-07-09T12:10:00.000Z",
      latestStatusUpdate: "Review request sent"
    }
  ];
}
