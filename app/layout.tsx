import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MacWest Board Report",
  description: "Board financial report — quarter ended 30 September 2026",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
