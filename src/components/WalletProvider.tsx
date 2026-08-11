"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getNetwork,
  getPublicKey,
  isAllowed,
  isConnected,
  setAllowed,
} from "@stellar/freighter-api";
import { NETWORK } from "@/config/env";
import { STORAGE_KEYS } from "@/constants";
import { toUserMessage } from "@/lib/errors";

export interface WalletContextValue {
  address: string | null;
  connected: boolean;
  /** True during an explicit connect, or while restoring a previous session. */
  connecting: boolean;
  error: string | null;
  /** The network Freighter is set to, once known. */
  walletNetwork: string | null;
  /** True when Freighter is on a different network than the app is built for. */
  networkMismatch: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

/** Freighter reports its network as `TESTNET` / `PUBLIC`. */
function matchesConfiguredNetwork(walletNetwork: string): boolean {
  const normalised = walletNetwork.toUpperCase();
  return NETWORK === "mainnet" ? normalised === "PUBLIC" : normalised === "TESTNET";
}

/**
 * Holds wallet state for the whole app.
 *
 * Each component used to call `useWallet` separately, which gave every one of
 * them its own independent copy of the state — connecting in the navbar left
 * the tip form still showing "Connect Wallet". A single provider keeps them in
 * step, and lets a session survive a page reload.
 */
export default function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletNetwork, setWalletNetwork] = useState<string | null>(null);

  const readNetwork = useCallback(async () => {
    try {
      setWalletNetwork(await getNetwork());
    } catch {
      // Older Freighter builds may not expose getNetwork; skip the check.
      setWalletNetwork(null);
    }
  }, []);

  /**
   * Restore a previous session without prompting. `isAllowed` is the only check
   * that does not open the extension popup, so a returning user is reconnected
   * silently — or left disconnected if they revoked access in the meantime.
   */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      let stored: string | null = null;
      try {
        stored = window.localStorage.getItem(STORAGE_KEYS.wallet);
      } catch {
        return;
      }
      if (!stored) return;

      setConnecting(true);
      try {
        if (!(await isConnected()) || !(await isAllowed())) {
          window.localStorage.removeItem(STORAGE_KEYS.wallet);
          return;
        }
        const key = await getPublicKey();
        if (cancelled) return;
        setAddress(key);
        await readNetwork();
      } catch {
        // A failed restore is not worth an error message; the user can just
        // press Connect again.
        try {
          window.localStorage.removeItem(STORAGE_KEYS.wallet);
        } catch {
          /* storage unavailable */
        }
      } finally {
        if (!cancelled) setConnecting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [readNetwork]);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      if (!(await isConnected())) {
        throw new Error("Freighter extension not found. Please install it.");
      }
      await setAllowed();
      const key = await getPublicKey();
      setAddress(key);
      try {
        window.localStorage.setItem(STORAGE_KEYS.wallet, key);
      } catch {
        // Session simply will not survive a reload.
      }
      await readNetwork();
    } catch (e) {
      setError(toUserMessage(e, "Failed to connect wallet"));
    } finally {
      setConnecting(false);
    }
  }, [readNetwork]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setError(null);
    setWalletNetwork(null);
    try {
      window.localStorage.removeItem(STORAGE_KEYS.wallet);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      address,
      connected: address !== null,
      connecting,
      error,
      walletNetwork,
      networkMismatch: walletNetwork !== null && !matchesConfiguredNetwork(walletNetwork),
      connect,
      disconnect,
    }),
    [address, connecting, error, walletNetwork, connect, disconnect]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

/** Read wallet state. Must be called below a `WalletProvider`. */
export function useWalletContext(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used inside a WalletProvider");
  return context;
}
