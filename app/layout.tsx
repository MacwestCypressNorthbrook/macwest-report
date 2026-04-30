import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Macwest Limited Management Dashboard",
  description: "Q1 2026 management reporting portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-['Inter']">{children}</body>
    </html>
  );
}
