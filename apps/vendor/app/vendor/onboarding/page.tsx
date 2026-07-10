import { AlertCircle, ClipboardList, Sparkles, Store } from "lucide-react";
import { AppShell, Panel } from "@buzzystores/ui";
import { OnboardingReviewActions } from "../../../components/onboarding-review-actions";
import { getVendorOnboardingReview } from "../../../lib/activation";

export default async function VendorOnboardingPage() {
  const review = await getVendorOnboardingReview();

  return (
    <AppShell>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <p className="text-xs font-semibold uppercase text-work">Onboarding review</p>
          <h1 className="text-xl font-semibold text-ink">{review.vendorName}</h1>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-4 px-4 py-6 lg:grid-cols-[1fr_320px]">
        <section className="grid gap-4">
          <Panel>
            <div className="mb-4 flex items-center gap-2">
              <Store className="h-5 w-5 text-work" aria-hidden />
              <h2 className="text-base font-semibold text-ink">Profile draft</h2>
            </div>
            <div className="grid gap-3 text-sm text-slate-700">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Headline</p>
                <p className="mt-1 font-medium text-ink">{review.profileDraft.headline}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Short description</p>
                <p className="mt-1">{review.profileDraft.shortDescription}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Long description</p>
                <p className="mt-1">{review.profileDraft.longDescription}</p>
              </div>
            </div>
          </Panel>

          <Panel>
            <div className="mb-4 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-work" aria-hidden />
              <h2 className="text-base font-semibold text-ink">Catalogue draft</h2>
            </div>
            <div className="grid gap-2">
              {review.catalogueItems.map((item) => (
                <div
                  key={item.title}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border border-slate-200 bg-field px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.approvalStatus}</p>
                  </div>
                  <p className="text-sm font-semibold text-ink">
                    {item.price} {item.currency}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <aside className="grid gap-4 self-start">
          <Panel>
            <div className="mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-alert" aria-hidden />
              <h2 className="text-base font-semibold text-ink">Missing fields</h2>
            </div>
            <div className="grid gap-2">
              {review.profileDraft.missingFields.map((field) => (
                <p key={field} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                  {field}
                </p>
              ))}
            </div>
          </Panel>

          <Panel>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-alert" aria-hidden />
              <h2 className="text-base font-semibold text-ink">First campaign</h2>
            </div>
            <p className="text-sm text-slate-700">{review.profileDraft.suggestedFirstCampaign}</p>
          </Panel>

          <Panel>
            <OnboardingReviewActions />
          </Panel>
        </aside>
      </main>
    </AppShell>
  );
}
