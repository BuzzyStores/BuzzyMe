import Link from "next/link";
import { LockKeyhole, QrCode, ShoppingBag, Star, Tag } from "lucide-react";
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
          {storefront.reviewCount ? (
            <span className="inline-flex items-center gap-1 rounded-sm bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
              <Star className="h-3 w-3" aria-hidden />
              {storefront.averageRating?.toFixed(1)} ({storefront.reviewCount})
            </span>
          ) : null}
        </div>
      </Panel>

      {storefront.activeCampaigns?.length ? (
        <Panel className="border-l-4 border-l-market">
          <div className="grid gap-3">
            {storefront.activeCampaigns.map((campaign) => (
              <div key={campaign.id} className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-market" aria-hidden />
                    <h2 className="text-base font-semibold text-ink">{campaign.title}</h2>
                  </div>
                  {campaign.offerText ? <p className="mt-1 text-sm font-medium text-emerald-700">{campaign.offerText}</p> : null}
                  {campaign.description ? <p className="mt-1 text-sm text-slate-600">{campaign.description}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {campaign.couponCode ? (
                    <span className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                      {campaign.couponCode}
                    </span>
                  ) : null}
                  {campaign.campaignUrl ? (
                    <Link
                      className="inline-flex min-h-10 items-center rounded-md bg-market px-3 text-sm font-semibold text-white"
                      href={campaign.campaignUrl}
                    >
                      View offer
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

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
        {storefront.reviews?.length ? (
          <div className="mt-3 grid gap-2">
            {storefront.reviews.map((review) => (
              <div key={review.id} className="rounded-md border border-slate-200 bg-field px-3 py-2">
                <p className="text-sm font-semibold text-ink">{review.rating}/5</p>
                {review.comment ? <p className="mt-1 text-sm text-slate-600">{review.comment}</p> : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">Reviews will appear after completed pickup orders.</p>
        )}
      </Panel>
    </div>
  );
}
