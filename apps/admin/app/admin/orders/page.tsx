import { ClipboardList } from "lucide-react";
import { AppShell, Panel } from "@buzzystores/ui";
import { getAdminOrders } from "../../../lib/admin-data";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <AppShell>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <p className="text-xs font-semibold uppercase text-control">Admin</p>
          <h1 className="text-xl font-semibold text-ink">Orders</h1>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-3 px-4 py-6">
        {orders.map((order) => (
          <Panel key={order.orderNumber} className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr] lg:items-center">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-sky-100 text-control">
                <ClipboardList className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h2 className="text-base font-semibold text-ink">{order.orderNumber}</h2>
                <p className="text-sm text-slate-500">{order.vendor}</p>
              </div>
            </div>
            <div className="text-sm">
              <p className="font-semibold text-ink">{order.customer}</p>
              <p className="text-slate-600">{order.createdAt}</p>
            </div>
            <div className="text-sm">
              <p className="font-semibold text-ink">{order.status}</p>
              <p className="text-slate-600">{order.total}</p>
              <p className="text-slate-500">{order.latestStatusUpdate}</p>
            </div>
          </Panel>
        ))}
      </main>
    </AppShell>
  );
}
