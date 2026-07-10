import { Clock, PackageCheck } from "lucide-react";
import { AppShell, Panel } from "@buzzystores/ui";
import { getOrderTracking } from "../../../lib/orders";

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderTracking(id);

  return (
    <AppShell>
      <main className="mx-auto grid max-w-3xl gap-4 px-4 py-6">
        <Panel>
          <div className="flex items-start gap-3">
            <PackageCheck className="mt-1 h-6 w-6 text-market" aria-hidden />
            <div>
              <p className="text-xs font-semibold uppercase text-market">Pickup order</p>
              <h1 className="mt-1 text-2xl font-semibold text-ink">{order.orderNumber}</h1>
              <p className="mt-2 text-sm text-slate-600">{order.vendorName}</p>
            </div>
          </div>
          <div className="mt-4 rounded-md border border-slate-200 bg-field px-3 py-2">
            <p className="text-sm font-semibold text-ink">{order.status}</p>
            <p className="mt-1 text-sm text-slate-600">The vendor will update this order as pickup progresses.</p>
          </div>
        </Panel>

        <Panel>
          <h2 className="text-base font-semibold text-ink">Items</h2>
          <div className="mt-3 grid gap-2">
            {order.items.map((item) => (
              <div key={item.title} className="grid grid-cols-[1fr_auto] gap-3 text-sm">
                <p className="text-slate-700">
                  {item.quantity} x {item.title}
                </p>
                <p className="font-semibold text-ink">{item.lineTotal} {order.currency}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-right text-base font-semibold text-ink">
            {order.totalAmount} {order.currency}
          </p>
        </Panel>

        <Panel>
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <Clock className="mt-0.5 h-4 w-4" aria-hidden />
            <div>
              <p className="font-semibold text-ink">Pickup instructions</p>
              <p className="mt-1">Bring your order number when collecting your order.</p>
              {order.requestedPickupTime ? <p className="mt-1">{order.requestedPickupTime}</p> : null}
            </div>
          </div>
        </Panel>
      </main>
    </AppShell>
  );
}
