import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
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
  title: "AR Glam Studio",
  description: "Customer, service, booking, and payment tracking for AR Glam Studio.",
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
        <div className="min-h-screen flex flex-col">
          <header className="w-full bg-white border-b border-stone-200">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between py-4">
              <a href="/" className="flex items-center">
                <Image
                  src="/ar-glam-studio-logo.svg"
                  alt="AR Glam Studio logo"
                  width={460}
                  height={90}
                  className="h-14 w-auto sm:h-20 lg:h-24"
                  priority
                />
              </a>
              <nav className="flex items-center gap-6">
                <a href="/my-bookings" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
                  Manage Bookings
                </a>
              </nav>
            </div>
          </header>
          <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
