import { AppShell } from "@buzzystores/ui";
import { StorefrontView } from "../../../components/storefront-view";
import { getStorefrontByShortCode, recordQrScan } from "../../../lib/storefronts";

export default async function ShortCodeStorefrontPage({ params }: { params: Promise<{ shortCode: string }> }) {
  const { shortCode } = await params;
  const storefront = await getStorefrontByShortCode(shortCode);
  await recordQrScan(shortCode);

  return (
    <AppShell>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <StorefrontView storefront={storefront} />
      </main>
    </AppShell>
  );
}
