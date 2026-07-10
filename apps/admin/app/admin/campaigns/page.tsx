import Link from "next/link";
import { Megaphone } from "lucide-react";
import { AppShell, Panel } from "@buzzystores/ui";
import { CampaignReviewActions } from "../../../components/campaign-review-actions";
import { getAdminCampaigns } from "../../../lib/admin-data";

export default async function AdminCampaignsPage() {
  const campaigns = await getAdminCampaigns();

  return (
    <AppShell>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <p className="text-xs font-semibold uppercase text-control">Admin</p>
          <h1 className="text-xl font-semibold text-ink">Campaigns</h1>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-3 px-4 py-6">
        {campaigns.map((campaign) => (
          <Panel key={campaign.id}>
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
              <Link href={`/admin/campaigns/${campaign.id}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <Megaphone className="h-5 w-5 text-control" aria-hidden />
                  <h2 className="text-base font-semibold text-ink">{campaign.title}</h2>
                  <span className="rounded-sm bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{campaign.status}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-700">{campaign.vendorName}</p>
                {campaign.offerText ? <p className="mt-1 text-sm text-slate-600">{campaign.offerText}</p> : null}
              </Link>
              <CampaignReviewActions campaignId={campaign.id} />
            </div>
          </Panel>
        ))}
      </main>
    </AppShell>
  );
}
