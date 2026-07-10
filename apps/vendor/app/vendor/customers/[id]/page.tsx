import { Mail, Phone, Tag } from "lucide-react";
import { AppShell, Metric, Panel } from "@buzzystores/ui";
import { getVendorCustomer } from "../../../../lib/customers";

export default async function VendorCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getVendorCustomer(id);

  return (
    <AppShell>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <p className="text-xs font-semibold uppercase text-work">Customer profile</p>
          <h1 className="text-xl font-semibold text-ink">{customer.name}</h1>
        </div>
      </header>
      <main className="mx-auto grid max-w-5xl gap-4 px-4 py-6">
        <section className="grid gap-3 sm:grid-cols-3">
          <Metric label="Orders" value={String(customer.orderCount)} />
          <Metric label="Total spend" value={`${customer.totalSpend} SEK`} />
          <Metric label="Last order" value={customer.lastOrderDate ? customer.lastOrderDate.slice(0, 10) : "None"} />
        </section>
        <Panel>
          <div className="grid gap-2 text-sm text-slate-700">
            <p className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4 text-work" aria-hidden />
              {customer.phone}
            </p>
            {customer.email ? (
              <p className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-work" aria-hidden />
                {customer.email}
              </p>
            ) : null}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {customer.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-sm bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                <Tag className="h-3 w-3" aria-hidden />
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-4 rounded-md border border-slate-200 bg-field px-3 py-2 text-sm text-slate-700">
            {customer.notes ?? "No notes yet."}
          </div>
        </Panel>
      </main>
    </AppShell>
  );
}
