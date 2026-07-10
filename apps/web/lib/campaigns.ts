export type PublicCampaign = {
  id: string;
  shortCode?: string | null;
  title: string;
  vendorName: string;
  vendorSlug: string;
  offerText?: string | null;
  description?: string | null;
  status: "ACTIVE";
  startDate?: string | null;
  endDate?: string | null;
  couponCode?: string | null;
  campaignUrl?: string | null;
  storefrontUrl: string;
  listings: Array<{
    id: string;
    title: string;
    price: number;
    currency: string;
    shortDescription?: string | null;
  }>;
};

export async function getPublicCampaign(id: string): Promise<PublicCampaign | null> {
  const baseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (baseUrl) {
    try {
      const response = await fetch(`${baseUrl}/api/campaigns/${id}/public`, { cache: "no-store" });

      if (response.ok) {
        return (await response.json()) as PublicCampaign | null;
      }
    } catch {
      // Use the local fallback while the API is not running.
    }
  }

  if (id === "inactive" || id === "draft") {
    return null;
  }

  return {
    id,
    shortCode: "camp-akwasa",
    title: "Weekend Family Jollof Bundle",
    vendorName: "Akwasaba Kitchen",
    vendorSlug: "akwasaba-kitchen",
    offerText: "15% off selected pickup favourites",
    description: "A QR storefront offer for family trays, lunch bowls, and repeat pickup customers.",
    status: "ACTIVE",
    startDate: "2026-07-10T08:00:00.000Z",
    endDate: "2026-07-17T20:00:00.000Z",
    couponCode: "JOLLOF15",
    campaignUrl: "/campaigns/camp-akwasa",
    storefrontUrl: "/vendor/akwasaba-kitchen",
    listings: [
      {
        id: "listing-jollof",
        title: "Jollof Rice Lunch Bowl",
        price: 129,
        currency: "SEK",
        shortDescription: "Smoky jollof rice with chicken, salad, and house shito."
      }
    ]
  };
}
