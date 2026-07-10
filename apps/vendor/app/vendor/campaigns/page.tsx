import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";
import { AppShell, Panel } from "@buzzystores/ui";
import { CampaignActions } from "../../../components/campaign-actions";
import { getVendorCampaigns } from "../../../lib/campaigns";

export default async function VendorCampaignsPage() {
  const campaigns = await getVendorCampaigns();

  return (
    <AppShell>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-work">Vendor dashboard</p>
            <h1 className="text-xl font-semibold text-ink">Campaigns</h1>
          </div>
          <Link className="inline-flex min-h-10 items-center gap-2 rounded-md bg-work px-3 text-sm font-semibold text-white" href="/vendor/campaigns/new">
            <Plus className="h-4 w-4" aria-hidden />
            New
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-3 px-4 py-6">
        {campaigns.map((campaign) => (
          <Panel key={campaign.id} className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Megaphone className="h-5 w-5 text-work" aria-hidden />
                <h2 className="text-base font-semibold text-ink">{campaign.title}</h2>
                <span className="rounded-sm bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{campaign.status}</span>
              </div>
              {campaign.offerText ? <p className="mt-2 text-sm text-slate-600">{campaign.offerText}</p> : null}
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                <span>{campaign.type}</span>
                {campaign.couponCode ? <span>{campaign.couponCode}</span> : null}
                {campaign.campaignUrl ? <span>{campaign.campaignUrl}</span> : null}
              </div>
            </div>
            <CampaignActions campaignId={campaign.id} />
          </Panel>
        ))}
      </main>
    </AppShell>
  );
}
