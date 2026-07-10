import { ClipboardList } from "lucide-react";
import { AppShell, Panel } from "@buzzystores/ui";
import { VendorOrderActions } from "../../../components/vendor-order-actions";
import { getVendorOrders } from "../../../lib/orders";

export default async function VendorOrdersPage() {
  const orders = await getVendorOrders();

  return (
    <AppShell>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <p className="text-xs font-semibold uppercase text-work">Vendor dashboard</p>
          <h1 className="text-xl font-semibold text-ink">Orders</h1>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-3 px-4 py-6">
        {orders.map((order) => (
          <Panel key={order.id} className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-start">
            <div>
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-work" aria-hidden />
                <h2 className="text-base font-semibold text-ink">{order.orderNumber}</h2>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-700">{order.customerName}</p>
              <p className="text-sm text-slate-500">{order.customerPhone}</p>
              {order.requestedPickupTime ? (
                <p className="mt-2 text-sm text-slate-600">{order.requestedPickupTime}</p>
              ) : null}
            </div>

            <div className="grid gap-2 text-sm">
              <p className="font-semibold text-ink">{order.status}</p>
              {order.items.map((item) => (
                <p key={item.title} className="text-slate-700">
                  {item.quantity} x {item.title}
                </p>
              ))}
              {order.notes ? <p className="text-slate-500">{order.notes}</p> : null}
            </div>

            <VendorOrderActions orderId={order.id} />
          </Panel>
        ))}
      </main>
    </AppShell>
  );
}
