import { Building2 } from "lucide-react";
import { AppShell, Panel } from "@buzzystores/ui";
import { getVendorPipeline } from "../../../lib/admin-data";

export default async function AdminVendorPipelinePage() {
  const vendors = await getVendorPipeline();

  return (
    <AppShell>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <p className="text-xs font-semibold uppercase text-control">Admin</p>
          <h1 className="text-xl font-semibold text-ink">Vendor pipeline</h1>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-3 px-4 py-6">
        {vendors.map((vendor) => (
          <Panel key={vendor.id} className="grid gap-4 lg:grid-cols-[1.1fr_1fr_1fr] lg:items-center">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-sky-100 text-control">
                <Building2 className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h2 className="text-base font-semibold text-ink">{vendor.name}</h2>
                <p className="text-sm text-slate-500">
                  {vendor.city}, {vendor.country}
                </p>
              </div>
            </div>
            <div className="grid gap-1 text-sm">
              <p className="font-semibold text-ink">{vendor.lifecycleStage}</p>
              <p className="text-slate-600">{vendor.latestEvent}</p>
            </div>
            <div className="grid gap-1 text-sm">
              <p className="font-semibold text-ink">{vendor.approvalStatus}</p>
              <p className="text-slate-600">{vendor.nextAction}</p>
            </div>
          </Panel>
        ))}
      </main>
    </AppShell>
  );
}
