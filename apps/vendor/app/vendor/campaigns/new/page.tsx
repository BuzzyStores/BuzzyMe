import { AppShell, Panel } from "@buzzystores/ui";
import { CampaignGenerator } from "../../../../components/campaign-generator";

export default function NewVendorCampaignPage() {
  return (
    <AppShell>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <p className="text-xs font-semibold uppercase text-work">Vendor dashboard</p>
          <h1 className="text-xl font-semibold text-ink">Generate campaign draft</h1>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <Panel>
          <CampaignGenerator />
        </Panel>
      </main>
    </AppShell>
  );
}
