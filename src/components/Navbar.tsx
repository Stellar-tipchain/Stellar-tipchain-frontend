"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { truncateAddress } from "@/utils";
import { IS_MAINNET, NETWORK } from "@/config/env";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/cn";
import Button from "./Button";
import Badge from "./Badge";

const LINKS = [
  { href: ROUTES.explore, label: "Explore" },
  { href: ROUTES.tips, label: "Tip" },
  { href: ROUTES.leaderboard, label: "Leaderboard" },
  { href: ROUTES.register, label: "Register" },
  { href: ROUTES.history, label: "History" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { address, connected, connecting, connect, disconnect, networkMismatch } = useWallet();

  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-gray-800">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.home} className="text-xl font-bold tracking-tight">
          ✦ Stellar Tipchain
        </Link>
        {/* Testnet is worth flagging permanently: those tips carry no value. */}
        {!IS_MAINNET && <Badge tone="warning">{NETWORK}</Badge>}
      </div>

      <ul className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "hover:text-white transition",
                  active && "text-white font-medium underline underline-offset-4"
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}

        <li>
          {connected ? (
            <div className="flex items-center gap-2">
              {networkMismatch && (
                <Badge tone="error" className="hidden sm:inline-flex">
                  Wrong network
                </Badge>
              )}
              <button
                onClick={disconnect}
                aria-label={`Disconnect wallet ${truncateAddress(address!)}`}
                className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg transition font-mono focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {truncateAddress(address!)}
              </button>
            </div>
          ) : (
            <Button onClick={connect} disabled={connecting} aria-label="Connect wallet">
              {connecting ? "Connecting…" : "Connect Wallet"}
            </Button>
          )}
        </li>
      </ul>
    </nav>
  );
}
