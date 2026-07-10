import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { AppShell, Metric, Panel } from "@buzzystores/ui";
import { getVendorHealth } from "../../../lib/health";

export default async function VendorHealthPage() {
  const health = await getVendorHealth();

  return (
    <AppShell>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <p className="text-xs font-semibold uppercase text-work">Vendor dashboard</p>
          <h1 className="text-xl font-semibold text-ink">Health</h1>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-6">
        <Panel className="border-l-4 border-l-work">
          <div className="flex items-start gap-3">
            <Activity className="mt-1 h-5 w-5 text-work" aria-hidden />
            <div>
              <p className="text-xs font-semibold uppercase text-work">{health.status}</p>
              <h2 className="text-2xl font-semibold text-ink">{health.score}</h2>
            </div>
          </div>
        </Panel>
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="QR scans" value={String(health.metrics.qrScans)} />
          <Metric label="Orders" value={String(health.metrics.ordersReceived)} />
          <Metric label="Campaigns" value={String(health.metrics.activeCampaignCount)} />
          <Metric label="Rating" value={health.metrics.averageRating.toFixed(1)} />
        </section>
        <section className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-alert" aria-hidden />
              <h2 className="text-base font-semibold text-ink">Reasons</h2>
            </div>
            <div className="grid gap-2">
              {health.reasons.map((reason) => (
                <p key={reason} className="rounded-md border border-slate-200 bg-field px-3 py-2 text-sm text-slate-700">
                  {reason}
                </p>
              ))}
            </div>
          </Panel>
          <Panel>
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-work" aria-hidden />
              <h2 className="text-base font-semibold text-ink">Next actions</h2>
            </div>
            <div className="grid gap-2">
              {health.recommendedActions.map((action) => (
                <p key={action} className="rounded-md border border-slate-200 bg-field px-3 py-2 text-sm text-slate-700">
                  {action}
                </p>
              ))}
            </div>
          </Panel>
        </section>
      </main>
    </AppShell>
  );
}
