import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kenny Pickle — Pickleball Games",
  description: "RSVP for pickleball games",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
