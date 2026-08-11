import type { Metadata } from "next";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import ToastProvider from "@/components/ToastProvider";
import WalletProvider from "@/components/WalletProvider";

export const metadata: Metadata = {
  title: "Stellar Tipchain",
  description: "Tip your favorite creators with Stellar assets",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-white">
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
            <main id="main">{children}</main>
          </ToastProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
