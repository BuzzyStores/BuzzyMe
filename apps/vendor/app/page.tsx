import { BarChart3, CheckCircle2, ClipboardList, QrCode, ShoppingBag, Wand2 } from "lucide-react";
import { AppShell, Metric, Panel } from "@buzzystores/ui";

const setupItems = [
  { label: "Profile completed", done: true },
  { label: "Minimum listings added", done: true },
  { label: "QR poster delivered", done: false },
  { label: "First campaign launched", done: false }
];

export default function VendorDashboardPage() {
  return (
    <AppShell>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-work">Vendor dashboard</p>
            <h1 className="text-xl font-semibold text-ink">Akwasaba Kitchen</h1>
          </div>
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-ink text-white">
            <QrCode className="h-5 w-5" aria-hidden />
            <span className="sr-only">Storefront QR</span>
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[1fr_360px]">
        <section className="grid gap-4">
          <Panel className="border-l-4 border-l-work">
            <div className="flex items-start gap-3">
              <Wand2 className="mt-1 h-5 w-5 text-work" aria-hidden />
              <div>
                <h2 className="text-base font-semibold text-ink">Next action</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Approve the weekend family bundle campaign and print the QR poster.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="inline-flex min-h-10 items-center gap-2 rounded-md bg-work px-3 text-sm font-semibold text-white">
                <ClipboardList className="h-4 w-4" aria-hidden />
                Review campaign
              </button>
              <button className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-ink">
                <QrCode className="h-4 w-4" aria-hidden />
                QR poster
              </button>
            </div>
          </Panel>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Activation" value="72%" />
            <Metric label="Health" value="78" />
            <Metric label="Orders" value="18" />
            <Metric label="QR scans" value="42" />
          </div>

          <Panel>
            <div className="mb-3 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-alert" aria-hidden />
              <h2 className="text-base font-semibold text-ink">Order alerts</h2>
            </div>
            <div className="grid gap-2">
              {["BZ-1001 accepted, pickup in 25 minutes", "Two lunch bowls low in stock"].map((item) => (
                <div key={item} className="rounded-md border border-slate-200 bg-field px-3 py-2 text-sm text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <aside className="grid gap-4 self-start">
          <Panel>
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-work" aria-hidden />
              <h2 className="text-base font-semibold text-ink">Setup progress</h2>
            </div>
            <div className="grid gap-2">
              {setupItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-700">{item.label}</span>
                  <span className={item.done ? "font-semibold text-work" : "font-semibold text-alert"}>
                    {item.done ? "Done" : "Open"}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel>
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-ink" aria-hidden />
              <h2 className="text-base font-semibold text-ink">Weekly summary</h2>
            </div>
            <p className="text-sm text-slate-600">
              Lunch bowls drove most scans. Weekend bundles are likely to lift repeat pickup orders.
            </p>
          </Panel>
        </aside>
      </main>
    </AppShell>
  );
}
