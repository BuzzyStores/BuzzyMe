import { CampaignType } from "@buzzystores/types";

export type VendorCampaign = {
  id: string;
  title: string;
  type: string;
  status: string;
  offerText?: string | null;
  couponCode?: string | null;
  campaignUrl?: string | null;
  updatedAt: string;
};

export async function getVendorCampaigns(): Promise<VendorCampaign[]> {
  const baseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (baseUrl) {
    try {
      const response = await fetch(`${baseUrl}/api/vendor/campaigns`, { cache: "no-store" });
      if (response.ok) {
        return (await response.json()) as VendorCampaign[];
      }
    } catch {
      // Fall back to local demo data.
    }
  }

  return [
    {
      id: "campaign-weekend-jollof",
      title: "Weekend Family Jollof Bundle",
      type: "FAMILY_BUNDLE",
      status: "ACTIVE",
      offerText: "15% off selected pickup favourites",
      couponCode: "JOLLOF15",
      campaignUrl: "/campaigns/camp-akwasa",
      updatedAt: "2026-07-10T08:00:00.000Z"
    },
    {
      id: "campaign-ai-draft",
      title: "Student Lunch QR Offer",
      type: "STUDENT_DEAL",
      status: "AI_GENERATED",
      offerText: "10% off weekday lunch bowls",
      couponCode: "STUDENT10",
      campaignUrl: null,
      updatedAt: "2026-07-10T09:00:00.000Z"
    }
  ];
}

export async function generateVendorCampaign(input: { campaignType: CampaignType; instruction?: string; language?: "en" | "sv" }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    return {
      campaign: {
        id: "campaign-generated",
        title: "AI Weekend Pickup Offer",
        status: "AI_GENERATED"
      }
    };
  }

  const response = await fetch(`${baseUrl}/api/vendor/campaigns/generate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error("Unable to generate campaign.");
  }

  return response.json();
}

export async function updateVendorCampaign(campaignId: string, action: "approve" | "pause" | "end") {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    return {
      campaignId,
      action,
      updatedAt: new Date().toISOString()
    };
  }

  const response = await fetch(`${baseUrl}/api/vendor/campaigns/${campaignId}/${action}`, {
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Unable to update campaign.");
  }

  return response.json();
}
