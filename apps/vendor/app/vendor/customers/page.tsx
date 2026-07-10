import Link from "next/link";
import { Users } from "lucide-react";
import { AppShell, Panel } from "@buzzystores/ui";
import { getRetentionSuggestions, getVendorCustomers } from "../../../lib/customers";

export default async function VendorCustomersPage() {
  const [customers, retention] = await Promise.all([getVendorCustomers(), getRetentionSuggestions()]);

  return (
    <AppShell>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <p className="text-xs font-semibold uppercase text-work">Vendor dashboard</p>
          <h1 className="text-xl font-semibold text-ink">Customers</h1>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[1fr_320px]">
        <section className="grid gap-3">
          {customers.map((customer) => (
            <Link key={customer.id} href={`/vendor/customers/${customer.id}`}>
              <Panel className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-100 text-work">
                    <Users className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-ink">{customer.name}</h2>
                    <p className="text-sm text-slate-500">{customer.phone}</p>
                  </div>
                </div>
                <div className="text-sm text-slate-700">
                  <p className="font-semibold text-ink">{customer.orderCount} orders</p>
                  <p>{customer.totalSpend} SEK total spend</p>
                </div>
              </Panel>
            </Link>
          ))}
        </section>
        <aside className="grid gap-3 self-start">
          {retention.suggestedActions.map((suggestion) => (
            <Panel key={suggestion.segment}>
              <p className="text-xs font-semibold uppercase text-work">{suggestion.segment}</p>
              <p className="mt-2 text-sm text-slate-700">{suggestion.suggestedActions[0]}</p>
              {suggestion.messageDrafts[0] ? <p className="mt-2 text-sm font-medium text-ink">{suggestion.messageDrafts[0]}</p> : null}
            </Panel>
          ))}
        </aside>
      </main>
    </AppShell>
  );
}
