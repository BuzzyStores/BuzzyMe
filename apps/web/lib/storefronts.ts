export type PublicListing = {
  id: string;
  title: string;
  price: number;
  currency: string;
  shortDescription: string;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
};

export type PublicCampaignSummary = {
  id: string;
  title: string;
  offerText?: string | null;
  description?: string | null;
  couponCode?: string | null;
  campaignUrl?: string | null;
  selectedListingIds?: string[];
};

export type PublicReview = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
};

export type PublicStorefront = {
  vendorId: string;
  vendorName: string;
  slug: string;
  shortCode: string | null;
  published: boolean;
  status: string;
  verificationBadge?: boolean;
  headline?: string;
  description?: string;
  city?: string | null;
  country?: string | null;
  openingHours?: unknown;
  pickupEnabled?: boolean;
  deliveryEnabled?: boolean;
  averageRating?: number;
  reviewCount?: number;
  activeCampaigns?: PublicCampaignSummary[];
  reviews?: PublicReview[];
  message?: string;
  listings: PublicListing[];
};

const fallbackStorefronts: PublicStorefront[] = [
  {
    vendorId: "vendor-akwasaba",
    vendorName: "Akwasaba Kitchen",
    slug: "akwasaba-kitchen",
    shortCode: "akwasa",
    published: true,
    status: "PUBLISHED",
    verificationBadge: true,
    headline: "Ghanaian comfort food, ready for pickup.",
    description: "Lunch bowls, weekend trays, and pantry favourites from a verified local kitchen.",
    city: "Stockholm",
    country: "Sweden",
    pickupEnabled: true,
    deliveryEnabled: true,
    averageRating: 4.8,
    reviewCount: 12,
    activeCampaigns: [
      {
        id: "campaign-weekend-jollof",
        title: "Weekend Family Jollof Bundle",
        offerText: "15% off selected pickup favourites",
        description: "A weekend QR storefront offer for family trays and lunch bowls.",
        couponCode: "JOLLOF15",
        campaignUrl: "/campaigns/camp-akwasa",
        selectedListingIds: ["listing-jollof"]
      }
    ],
    reviews: [
      {
        id: "review-bz-1999",
        rating: 5,
        comment: "Pickup was quick and the jollof was excellent.",
        createdAt: "2026-07-09T18:00:00.000Z"
      }
    ],
    listings: [
      {
        id: "listing-jollof",
        title: "Jollof Rice Lunch Bowl",
        price: 129,
        currency: "SEK",
        shortDescription: "Smoky jollof rice with chicken, salad, and house shito.",
        pickupEnabled: true,
        deliveryEnabled: true
      },
      {
        id: "listing-sobolo",
        title: "Sobolo",
        price: 40,
        currency: "SEK",
        shortDescription: "Chilled hibiscus drink for pickup.",
        pickupEnabled: true,
        deliveryEnabled: false
      }
    ]
  },
  {
    vendorId: "vendor-nordic-flowers",
    vendorName: "Nordic Flowers",
    slug: "nordic-flowers",
    shortCode: "draft-flowers",
    published: false,
    status: "INFO_COLLECTED",
    message: "This storefront is not yet published.",
    listings: []
  }
];

export async function getStorefrontBySlug(slug: string) {
  return fetchStorefront(`/storefronts/vendor/${slug}`, () =>
    fallbackStorefronts.find((storefront) => storefront.slug === slug) ?? null,
  );
}

export async function getStorefrontByShortCode(shortCode: string) {
  return fetchStorefront(`/storefronts/short/${shortCode}`, () =>
    fallbackStorefronts.find((storefront) => storefront.shortCode === shortCode) ?? null,
  );
}

export async function recordQrScan(shortCode: string) {
  const baseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    return { recorded: false, mocked: true };
  }

  try {
    const response = await fetch(`${baseUrl}/api/qr/${shortCode}/scan`, {
      method: "POST",
      cache: "no-store"
    });

    if (!response.ok) {
      return { recorded: false };
    }

    return response.json() as Promise<{ recorded: boolean }>;
  } catch {
    return { recorded: false };
  }
}

async function fetchStorefront(path: string, fallback: () => PublicStorefront | null) {
  const baseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    return fallback();
  }

  try {
    const response = await fetch(`${baseUrl}/api${path}`, { cache: "no-store" });

    if (!response.ok) {
      return fallback();
    }

    return (await response.json()) as PublicStorefront | null;
  } catch {
    return fallback();
  }
}
