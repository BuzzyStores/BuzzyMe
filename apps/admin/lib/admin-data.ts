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

export type AdminCampaign = {
  id: string;
  vendorName: string;
  title: string;
  type: string;
  status: string;
  offerText?: string | null;
  couponCode?: string | null;
  updatedAt: string;
  preview: Record<string, unknown>;
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

const fallbackCampaigns: AdminCampaign[] = [
  {
    id: "campaign-weekend-jollof",
    vendorName: "Akwasaba Kitchen",
    title: "Weekend Family Jollof Bundle",
    type: "FAMILY_BUNDLE",
    status: "ACTIVE",
    offerText: "15% off selected pickup favourites",
    couponCode: "JOLLOF15",
    updatedAt: "2026-07-10T08:00:00.000Z",
    preview: {
      whatsappCopy: "Weekend family tray ready for pickup.",
      selectedListings: ["Jollof Rice Lunch Bowl"]
    }
  },
  {
    id: "campaign-ai-draft",
    vendorName: "Akwasaba Kitchen",
    title: "Student Lunch QR Offer",
    type: "STUDENT_DEAL",
    status: "VENDOR_APPROVED",
    offerText: "10% off weekday lunch bowls",
    couponCode: "STUDENT10",
    updatedAt: "2026-07-10T09:00:00.000Z",
    preview: {
      instagramCaption: "Student lunch offer is ready.",
      qrPosterHeadline: "Lunch offer"
    }
  }
];

export async function getAdminCampaigns(): Promise<AdminCampaign[]> {
  const campaigns = await fetchAdminData<unknown[]>("/admin/campaigns", fallbackCampaigns);
  return campaigns.map(toAdminCampaign);
}

export async function getAdminCampaign(id: string): Promise<AdminCampaign> {
  const campaign = await fetchAdminData<unknown>(`/admin/campaigns/${id}`, fallbackCampaigns.find((item) => item.id === id) ?? fallbackCampaigns[0]);
  return toAdminCampaign(campaign);
}

export async function updateAdminCampaign(campaignId: string, action: "approve" | "reject" | "activate" | "pause") {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    return {
      campaignId,
      action,
      updatedAt: new Date().toISOString()
    };
  }

  const response = await fetch(`${baseUrl}/api/admin/campaigns/${campaignId}/${action}`, {
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to update campaign.");
  }

  return response.json();
}

async function fetchAdminData<T>(path: string, fallback: T): Promise<T> {
  const baseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    return fallback;
  }

  try {
    const response = await fetch(`${baseUrl}/api${path}`, { cache: "no-store" });

    if (response.ok) {
      return (await response.json()) as T;
    }
  } catch {
    // Keep admin UI usable during local mock preview.
  }

  return fallback;
}

function toAdminCampaign(value: unknown): AdminCampaign {
  const record = isRecord(value) ? value : {};
  const vendor = isRecord(record.vendor) ? record.vendor : {};
  const title = String(record.title ?? record.name ?? "Campaign");

  return {
    id: String(record.id ?? title),
    vendorName: String(record.vendorName ?? vendor.name ?? "Vendor"),
    title,
    type: String(record.type ?? "WEEKEND_OFFER"),
    status: String(record.status ?? "DRAFT"),
    offerText: typeof record.offerText === "string" ? record.offerText : null,
    couponCode: typeof record.couponCode === "string" ? record.couponCode : null,
    updatedAt: String(record.updatedAt ?? new Date().toISOString()),
    preview: isRecord(record.preview)
      ? record.preview
      : {
          description: record.description ?? null,
          whatsappCopy: record.whatsappCopy ?? null,
          instagramCaption: record.instagramCaption ?? null,
          selectedListingIds: record.selectedListingIds ?? record.listingIds ?? []
        }
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
