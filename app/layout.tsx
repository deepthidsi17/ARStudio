import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";

import { AppNavLink } from "@/components/ui";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AR Studio",
  description: "Customer, service, booking, and payment tracking for AR Studio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-stone-100 text-stone-900 antialiased`}
      >
        <div className="min-h-screen">
          <header className="border-b border-stone-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <Link href="/" className="text-2xl font-semibold tracking-tight text-stone-900">
                    AR Studio
                  </Link>
                </div>
                <nav className="flex flex-wrap gap-2">
                  <AppNavLink href="/">Home</AppNavLink>
                  <AppNavLink href="/checkin">Check-In</AppNavLink>
                  <AppNavLink href="/admin">Admin</AppNavLink>
                </nav>
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
