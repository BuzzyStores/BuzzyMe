import { ArrowRight, MapPin, QrCode, Search, ShoppingBag, Sparkles } from "lucide-react";
import { AppShell, Panel } from "@buzzystores/ui";

const vendors = [
  {
    name: "Akwasaba Kitchen",
    slug: "akwasaba-kitchen",
    category: "Food",
    badge: "Verified",
    details: "Jollof bowls, pantry staples, weekend family trays",
    fulfilment: "Pickup + delivery",
    score: "4.8"
  },
  {
    name: "Repair Hub Solna",
    slug: "repair-hub-solna",
    category: "Repair",
    badge: "Booking",
    details: "Phone repairs, small electronics, same-week slots",
    fulfilment: "Booking + service request",
    score: "4.7"
  },
  {
    name: "Circular Closet",
    slug: "circular-closet",
    category: "Circular",
    badge: "Second hand",
    details: "Curated local fashion drops and pickup listings",
    fulfilment: "Pickup",
    score: "4.9"
  }
];

const filters = ["Open now", "Pickup", "Delivery", "Booking", "Circular", "Diaspora"];

export default function MarketplacePage() {
  return (
    <AppShell>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-market">BuzzyStores</p>
            <h1 className="text-xl font-semibold text-ink">Local commerce near you</h1>
          </div>
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700">
            <QrCode className="h-5 w-5" aria-hidden />
            <span className="sr-only">Scan QR code</span>
          </button>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-field">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-5 md:grid-cols-[1fr_auto] md:items-center">
          <label className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 shadow-sm">
            <Search className="h-5 w-5 text-slate-500" aria-hidden />
            <input
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Search vendors, products, bookings"
              aria-label="Search vendors, products, bookings"
            />
          </label>
          <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white">
            <MapPin className="h-4 w-4" aria-hidden />
            Near me
          </button>
        </div>
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-5">
          {filters.map((filter) => (
            <button
              key={filter}
              className="min-h-10 shrink-0 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700"
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[1fr_320px]">
        <section className="grid gap-3">
          {vendors.map((vendor) => (
            <Panel key={vendor.slug} className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-800">
                  <ShoppingBag className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-ink">{vendor.name}</h2>
                    <span className="rounded-sm bg-sky-100 px-2 py-1 text-xs font-medium text-sky-800">
                      {vendor.badge}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{vendor.details}</p>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {vendor.category} · {vendor.fulfilment} · {vendor.score}
                  </p>
                </div>
              </div>
              <a
                href={`/vendors/${vendor.slug}`}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-ink"
              >
                Open
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </Panel>
          ))}
        </section>

        <aside className="grid gap-4 self-start">
          <Panel>
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Sparkles className="h-4 w-4 text-warm" aria-hidden />
              Weekly offers
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Family food bundles, repair bookings, and circular drops from active local vendors.
            </p>
          </Panel>
          <Panel>
            <div className="h-36 rounded-md border border-dashed border-slate-300 bg-white p-4">
              <div className="grid h-full grid-cols-5 gap-1">
                {Array.from({ length: 25 }).map((_, index) => (
                  <span
                    key={index}
                    className={index % 3 === 0 || index % 7 === 0 ? "bg-ink" : "bg-slate-100"}
                  />
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700">Scan a vendor code</p>
          </Panel>
        </aside>
      </main>
    </AppShell>
  );
}
