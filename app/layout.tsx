import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "North-Brook Shareholder Dashboard",
  description: "Q1 2026 management dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
