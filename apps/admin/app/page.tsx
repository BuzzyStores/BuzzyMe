import { AlertTriangle, Bot, Building2, FileCheck2, LineChart, ShieldCheck } from "lucide-react";
import { AppShell, Metric, Panel } from "@buzzystores/ui";

const pipeline = [
  ["Lead identified", "14"],
  ["Info collected", "8"],
  ["Pending approval", "5"],
  ["Published", "21"]
];

const reviewQueue = [
  "Akwasaba Kitchen campaign copy",
  "Repair Hub Solna service listing",
  "Circular Closet product import"
];

export default function AdminControlTowerPage() {
  return (
    <AppShell>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-control">Admin control tower</p>
            <h1 className="text-xl font-semibold text-ink">Vendor activation</h1>
          </div>
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-ink text-white">
            <ShieldCheck className="h-5 w-5" aria-hidden />
            <span className="sr-only">Approvals</span>
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-6">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Leads" value="35" />
          <Metric label="Activated" value="21" />
          <Metric label="AI review" value="9" />
          <Metric label="Support" value="4" />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Panel>
            <div className="mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-control" aria-hidden />
              <h2 className="text-base font-semibold text-ink">Pipeline</h2>
            </div>
            <div className="grid gap-2">
              {pipeline.map(([stage, count]) => (
                <div key={stage} className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-md border border-slate-200 bg-field px-3 py-2">
                  <span className="text-sm font-medium text-slate-700">{stage}</span>
                  <span className="text-sm font-semibold text-ink">{count}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <div className="mb-4 flex items-center gap-2">
              <Bot className="h-5 w-5 text-control" aria-hidden />
              <h2 className="text-base font-semibold text-ink">AI review</h2>
            </div>
            <div className="grid gap-2">
              {reviewQueue.map((item) => (
                <button
                  key={item}
                  className="grid min-h-11 grid-cols-[1fr_auto] items-center gap-3 rounded-md border border-slate-200 bg-white px-3 text-left text-sm text-slate-700"
                >
                  {item}
                  <FileCheck2 className="h-4 w-4 text-slate-500" aria-hidden />
                </button>
              ))}
            </div>
          </Panel>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-risk" aria-hidden />
              <h2 className="text-base font-semibold text-ink">Escalations</h2>
            </div>
            <p className="text-sm text-slate-600">
              Refund disputes, GDPR requests, and account suspensions stay in human approval queues.
            </p>
          </Panel>

          <Panel>
            <div className="mb-3 flex items-center gap-2">
              <LineChart className="h-5 w-5 text-control" aria-hidden />
              <h2 className="text-base font-semibold text-ink">Partner reporting</h2>
            </div>
            <p className="text-sm text-slate-600">
              Aggregated vendor activation, campaign reach, circular transactions, and local commerce activity.
            </p>
          </Panel>
        </section>
      </main>
    </AppShell>
  );
}
