"use client";

import { useWalletContext, type WalletContextValue } from "@/components/WalletProvider";

/**
 * Wallet state for the connected Freighter account.
 *
 * This is a thin alias over the app-wide wallet context so that components keep
 * importing wallet state from `@/hooks`. The state itself lives in
 * `WalletProvider`, which mounts once in the root layout.
 */
export function useWallet(): WalletContextValue {
  return useWalletContext();
}

export type { WalletContextValue };
