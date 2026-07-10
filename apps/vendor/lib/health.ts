export type VendorHealth = {
  score: number;
  status: "GOOD" | "NEEDS_ATTENTION" | "AT_RISK";
  reasons: string[];
  recommendedActions: string[];
  metrics: {
    publishedStorefront: boolean;
    approvedListings: number;
    qrScans: number;
    ordersReceived: number;
    completedOrders: number;
    cancellationRejectionRate: number;
    activeCampaignCount: number;
    reviewCount: number;
    averageRating: number;
    repeatCustomers: number;
    daysSinceLastOrder: number | null;
  };
};

export async function getVendorHealth(): Promise<VendorHealth> {
  const baseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (baseUrl) {
    try {
      const response = await fetch(`${baseUrl}/api/vendor/health`, { cache: "no-store" });
      if (response.ok) {
        return (await response.json()) as VendorHealth;
      }
    } catch {
      // Fall through to local health sample.
    }
  }

  return {
    score: 78,
    status: "GOOD",
    reasons: ["One active campaign is running.", "Recent reviews are positive."],
    recommendedActions: ["Ask completed pickup customers for more reviews.", "Create a reactivation offer for inactive customers."],
    metrics: {
      publishedStorefront: true,
      approvedListings: 4,
      qrScans: 42,
      ordersReceived: 18,
      completedOrders: 14,
      cancellationRejectionRate: 5,
      activeCampaignCount: 1,
      reviewCount: 12,
      averageRating: 4.8,
      repeatCustomers: 6,
      daysSinceLastOrder: 1
    }
  };
}
