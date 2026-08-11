import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToastProvider from "@/components/ToastProvider";
import WalletProvider from "@/components/WalletProvider";

export const metadata: Metadata = {
  title: {
    default: "Stellar Tipchain",
    template: "%s · Stellar Tipchain",
  },
  description:
    "Tip creators directly with Stellar assets. Non-custodial, open source, and settled on-chain in seconds.",
  applicationName: "Stellar Tipchain",
  keywords: ["Stellar", "XLM", "tipping", "creators", "Freighter", "crypto"],
  openGraph: {
    title: "Stellar Tipchain",
    description: "Tip creators directly with Stellar assets.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Stellar Tipchain",
    description: "Tip creators directly with Stellar assets.",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#030712",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-950 text-white">
        {/*
          Both providers mount once here so wallet state and the toast queue are
          shared by every page, rather than each component holding its own copy.
        */}
        <WalletProvider>
          <ToastProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:rounded-lg"
            >
              Skip to content
            </a>
            <Navbar />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
