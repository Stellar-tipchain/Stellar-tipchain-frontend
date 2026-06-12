"use client";

import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";
import { truncateAddress } from "@/utils";
import Button from "./Button";

export default function Navbar() {
  const { address, connected, connecting, connect, disconnect } = useWallet();

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
      <Link href="/" className="text-xl font-bold tracking-tight">
        ✦ Stellar Tipchain
      </Link>
      <ul className="flex items-center gap-6 text-sm text-gray-300">
        <li>
          <Link href="/explore" className="hover:text-white transition">
            Explore
          </Link>
        </li>
        <li>
          <Link href="/tips" className="hover:text-white transition">
            Tip
          </Link>
        </li>
        <li>
          <Link href="/register" className="hover:text-white transition">
            Register
          </Link>
        </li>
        <li>
          <Link href="/history" className="hover:text-white transition">
            History
          </Link>
        </li>
        <li>
          {connected ? (
            <button
              onClick={disconnect}
              className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg transition"
              title="Click to disconnect"
            >
              {truncateAddress(address!)}
            </button>
          ) : (
            <Button onClick={connect} disabled={connecting}>
              {connecting ? "Connecting…" : "Connect Wallet"}
            </Button>
          )}
        </li>
      </ul>
    </nav>
  );
}
