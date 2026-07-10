"use client";

import { useMemo, useState } from "react";
import { Clock, Plus, Send, ShoppingBag } from "lucide-react";
import { placePickupOrder } from "../lib/orders";
import type { PublicListing } from "../lib/storefronts";

export function PickupOrderPanel({ vendorId, listings }: { vendorId: string; listings: PublicListing[] }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const selectedItems = useMemo(
    () =>
      listings
        .map((listing) => ({
          ...listing,
          quantity: quantities[listing.id] ?? 0
        }))
        .filter((listing) => listing.quantity > 0),
    [listings, quantities],
  );
  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currency = selectedItems[0]?.currency ?? "SEK";

  async function submitOrder() {
    if (!customerName || !phone || selectedItems.length === 0) {
      setStatus("Add at least one item and customer contact details.");
      return;
    }

    const result = await placePickupOrder({
      vendorId,
      customer: {
        name: customerName,
        phone
      },
      items: selectedItems.map((item) => ({
        listingId: item.id,
        quantity: item.quantity
      })),
      ...(note ? { customerNote: note } : {})
    });

    setStatus(`Order ${result.orderNumber} sent to vendor.`);
  }

  return (
    <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <ShoppingBag className="h-5 w-5 text-market" aria-hidden />
        <h2 className="text-base font-semibold text-ink">Pickup order</h2>
      </div>

      <div className="grid gap-2">
        {listings.map((listing) => (
          <div key={listing.id} className="grid grid-cols-[1fr_auto] gap-3 rounded-md border border-slate-200 p-3">
            <div>
              <p className="text-sm font-semibold text-ink">{listing.title}</p>
              <p className="mt-1 text-sm text-slate-600">{listing.shortDescription}</p>
              <p className="mt-2 text-sm font-semibold text-ink">
                {listing.price} {listing.currency}
              </p>
            </div>
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-ink text-white"
              onClick={() =>
                setQuantities((current) => ({
                  ...current,
                  [listing.id]: (current[listing.id] ?? 0) + 1
                }))
              }
              type="button"
            >
              <Plus className="h-4 w-4" aria-hidden />
              <span className="sr-only">Add {listing.title}</span>
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-slate-200 bg-field p-3">
        <p className="text-sm font-semibold text-ink">Order summary</p>
        {selectedItems.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">No items selected.</p>
        ) : (
          <div className="mt-2 grid gap-1 text-sm text-slate-700">
            {selectedItems.map((item) => (
              <p key={item.id}>
                {item.quantity} x {item.title}
              </p>
            ))}
            <p className="pt-2 font-semibold text-ink">
              Total {total} {currency}
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-2">
        <input
          className="min-h-11 rounded-md border border-slate-300 px-3 text-sm"
          onChange={(event) => setCustomerName(event.target.value)}
          placeholder="Name"
          value={customerName}
        />
        <input
          className="min-h-11 rounded-md border border-slate-300 px-3 text-sm"
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Phone"
          value={phone}
        />
        <textarea
          className="min-h-20 rounded-md border border-slate-300 px-3 py-2 text-sm"
          onChange={(event) => setNote(event.target.value)}
          placeholder="Pickup note"
          value={note}
        />
      </div>

      <button
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-market px-4 text-sm font-semibold text-white"
        onClick={() => void submitOrder()}
        type="button"
      >
        <Send className="h-4 w-4" aria-hidden />
        Send pickup order
      </button>

      <div className="flex items-start gap-2 text-sm text-slate-600">
        <Clock className="mt-0.5 h-4 w-4" aria-hidden />
        Payment is not collected in Phase 3. The vendor confirms pickup details.
      </div>

      {status ? <p className="rounded-md border border-slate-200 bg-field px-3 py-2 text-sm">{status}</p> : null}
    </section>
  );
}
