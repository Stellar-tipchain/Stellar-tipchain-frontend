"use client";

import { useState, useCallback } from "react";
import {
  isConnected,
  getPublicKey,
  setAllowed,
} from "@stellar/freighter-api";

interface WalletState {
  address: string | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export function useWallet(): WalletState {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const connected = await isConnected();
      if (!connected) throw new Error("Freighter extension not found. Please install it.");
      await setAllowed();
      const key = await getPublicKey();
      setAddress(key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setError(null);
  }, []);

  return { address, connected: address !== null, connecting, error, connect, disconnect };
}
