import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BuzzyStores Admin",
  description: "Admin control tower for vendor activation, approval, campaigns, support, and reporting."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
