import { LockKeyhole, QrCode, ShoppingBag } from "lucide-react";
import { Panel } from "@buzzystores/ui";
import { PickupOrderPanel } from "./pickup-order-panel";
import type { PublicStorefront } from "../lib/storefronts";

export function StorefrontView({ storefront }: { storefront: PublicStorefront | null }) {
  if (!storefront) {
    return (
      <Panel>
        <h1 className="text-xl font-semibold text-ink">Storefront not found</h1>
      </Panel>
    );
  }

  if (!storefront.published) {
    return (
      <Panel>
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-1 h-5 w-5 text-slate-500" aria-hidden />
          <div>
            <h1 className="text-xl font-semibold text-ink">{storefront.vendorName}</h1>
            <p className="mt-2 text-sm text-slate-600">This storefront is not yet published.</p>
            <p className="mt-2 text-xs font-semibold uppercase text-slate-500">{storefront.status}</p>
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <div className="grid gap-4">
      <Panel>
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
          <div>
            <p className="text-xs font-semibold uppercase text-market">QR storefront</p>
            <h1 className="mt-1 text-2xl font-semibold text-ink">{storefront.vendorName}</h1>
            <p className="mt-3 text-lg font-medium text-ink">{storefront.headline}</p>
            <p className="mt-2 text-sm text-slate-600">{storefront.description}</p>
            <p className="mt-3 text-sm font-medium text-slate-500">
              {[storefront.city, storefront.country].filter(Boolean).join(", ")}
            </p>
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-md border border-slate-300 bg-white">
            <QrCode className="h-9 w-9 text-ink" aria-hidden />
          </div>
        </div>
        <p className="mt-4 text-xs font-semibold uppercase text-slate-500">{storefront.shortCode}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-sm bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
            Published
          </span>
          {storefront.pickupEnabled ? (
            <span className="rounded-sm bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-800">Pickup</span>
          ) : null}
          {storefront.deliveryEnabled ? (
            <span className="rounded-sm bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
              Delivery visible, checkout disabled
            </span>
          ) : null}
        </div>
      </Panel>

      <Panel>
        <div className="mb-3 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-market" aria-hidden />
          <h2 className="text-base font-semibold text-ink">Listings</h2>
        </div>
        <div className="grid gap-2">
          {storefront.listings.map((listing) => (
            <div
              key={listing.title}
              className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border border-slate-200 bg-field px-3 py-2"
            >
              <p className="text-sm font-medium text-ink">{listing.title}</p>
              <p className="mt-1 text-sm text-slate-600">{listing.shortDescription}</p>
              <p className="text-sm font-semibold text-ink">
                {listing.price} {listing.currency}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      <PickupOrderPanel vendorId={storefront.vendorId} listings={storefront.listings} />

      <Panel>
        <h2 className="text-base font-semibold text-ink">Support and reviews</h2>
        <p className="mt-2 text-sm text-slate-600">Contact and review tools are prepared for the next phase.</p>
      </Panel>
    </div>
  );
}
