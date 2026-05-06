import type { Metadata } from "next";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Stellar Tipchain",
  description: "Tip your favorite creators with Stellar assets",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
