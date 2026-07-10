import Link from "next/link";
import { CalendarDays, ShoppingBag, Tag } from "lucide-react";
import { AppShell, Panel } from "@buzzystores/ui";
import { getPublicCampaign } from "../../../lib/campaigns";

export default async function PublicCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await getPublicCampaign(id);

  if (!campaign) {
    return (
      <AppShell>
        <main className="mx-auto max-w-3xl px-4 py-8">
          <Panel>
            <h1 className="text-xl font-semibold text-ink">Campaign unavailable</h1>
            <p className="mt-2 text-sm text-slate-600">This campaign is not active or is no longer public.</p>
          </Panel>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="mx-auto grid max-w-4xl gap-4 px-4 py-6">
        <Panel className="border-l-4 border-l-market">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
            <div>
              <p className="text-xs font-semibold uppercase text-market">Active campaign</p>
              <h1 className="mt-1 text-2xl font-semibold text-ink">{campaign.title}</h1>
              <p className="mt-2 text-sm font-medium text-slate-700">{campaign.vendorName}</p>
              {campaign.description ? <p className="mt-3 text-sm text-slate-600">{campaign.description}</p> : null}
            </div>
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
              {campaign.offerText}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {campaign.couponCode ? (
              <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 font-semibold text-ink">
                <Tag className="h-4 w-4 text-market" aria-hidden />
                {campaign.couponCode}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-slate-700">
              <CalendarDays className="h-4 w-4 text-slate-500" aria-hidden />
              {[campaign.startDate, campaign.endDate].filter(Boolean).join(" to ")}
            </span>
          </div>
        </Panel>

        <Panel>
          <div className="mb-3 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-market" aria-hidden />
            <h2 className="text-base font-semibold text-ink">Selected listings</h2>
          </div>
          <div className="grid gap-2">
            {campaign.listings.map((listing) => (
              <div key={listing.id} className="grid grid-cols-[1fr_auto] gap-3 rounded-md border border-slate-200 bg-field px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-ink">{listing.title}</p>
                  {listing.shortDescription ? <p className="mt-1 text-sm text-slate-600">{listing.shortDescription}</p> : null}
                </div>
                <p className="text-sm font-semibold text-ink">
                  {listing.price} {listing.currency}
                </p>
              </div>
            ))}
          </div>
        </Panel>

        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-market px-4 text-sm font-semibold text-white"
          href={campaign.storefrontUrl}
        >
          Order from storefront
        </Link>
      </main>
    </AppShell>
  );
}
