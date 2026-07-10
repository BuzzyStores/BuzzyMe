import { ChevronDown, Megaphone } from "lucide-react";
import { AppShell, Panel } from "@buzzystores/ui";
import { CampaignReviewActions } from "../../../../components/campaign-review-actions";
import { getAdminCampaign } from "../../../../lib/admin-data";

export default async function AdminCampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await getAdminCampaign(id);

  return (
    <AppShell>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <p className="text-xs font-semibold uppercase text-control">Admin</p>
          <h1 className="text-xl font-semibold text-ink">{campaign.title}</h1>
        </div>
      </header>
      <main className="mx-auto grid max-w-5xl gap-4 px-4 py-6">
        <Panel>
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Megaphone className="h-5 w-5 text-control" aria-hidden />
                <h2 className="text-base font-semibold text-ink">{campaign.vendorName}</h2>
                <span className="rounded-sm bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{campaign.status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{campaign.offerText}</p>
              {campaign.couponCode ? <p className="mt-2 text-sm font-semibold text-ink">{campaign.couponCode}</p> : null}
            </div>
            <CampaignReviewActions campaignId={campaign.id} />
          </div>
        </Panel>
        <Panel>
          <details open>
            <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-ink">
              Campaign JSON
              <ChevronDown className="h-4 w-4" aria-hidden />
            </summary>
            <pre className="mt-3 overflow-auto rounded-md bg-field p-3 text-xs text-slate-700">
              {JSON.stringify(campaign.preview, null, 2)}
            </pre>
          </details>
        </Panel>
      </main>
    </AppShell>
  );
}
