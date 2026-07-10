import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BuzzyStores",
  description: "Local commerce storefronts, QR ordering, campaigns, bookings, and delivery."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
