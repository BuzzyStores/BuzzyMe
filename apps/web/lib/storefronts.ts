export type PublicListing = {
  id: string;
  title: string;
  price: number;
  currency: string;
  shortDescription: string;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
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
  const baseUrl = process.env.API_BASE_URL;

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
  const baseUrl = process.env.API_BASE_URL;

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
