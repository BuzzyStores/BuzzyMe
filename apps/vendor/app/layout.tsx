import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BuzzyStores Vendor",
  description: "Vendor dashboard for storefront, QR, orders, campaigns, and activation."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
