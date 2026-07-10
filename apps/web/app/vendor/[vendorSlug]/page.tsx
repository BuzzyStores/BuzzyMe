import { AppShell } from "@buzzystores/ui";
import { StorefrontView } from "../../../components/storefront-view";
import { getStorefrontBySlug } from "../../../lib/storefronts";

export default async function VendorStorefrontPage({ params }: { params: Promise<{ vendorSlug: string }> }) {
  const { vendorSlug } = await params;
  const storefront = await getStorefrontBySlug(vendorSlug);

  return (
    <AppShell>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <StorefrontView storefront={storefront} />
      </main>
    </AppShell>
  );
}
