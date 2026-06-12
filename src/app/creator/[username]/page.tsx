"use client";

import { useState, useEffect } from "react";
import * as StellarSdk from "stellar-sdk";
import { useWallet } from "@/hooks/useWallet";
import { api } from "@/services/api";
import { buildPaymentTx, signAndSubmitTx } from "@/services/stellar";
import { HORIZON_URL } from "@/utils";
import Button from "@/components/Button";
import Toast from "@/components/Toast";
import Skeleton from "@/components/Skeleton";
import ErrorBoundary from "@/components/ErrorBoundary";

const XLM_ASSET = { code: "XLM", issuer: "" };

interface Props {
  params: { username: string };
}

export default function CreatorPage({ params }: Props) {
  const { username } = params;
  const { connected, connect, address } = useWallet();
  const [creator, setCreator] = useState<{ username: string; bio: string; stellarAddress: string; acceptedAssets: { code: string; issuer: string }[] } | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [amount, setAmount] = useState("10");
  const [selectedAsset, setSelectedAsset] = useState(XLM_ASSET);
  const [assetOptions, setAssetOptions] = useState([XLM_ASSET]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    api.getCreator(username)
      .then((c) => {
        setCreator(c);
        const opts = [XLM_ASSET, ...(c.acceptedAssets ?? [])];
        setAssetOptions(opts);
        setSelectedAsset(opts[0]);
      })
      .catch((err: Error) => {
        if (err.message.includes("404")) setFetchError("Creator not found.");
        else setFetchError(`Could not load creator: ${err.message}`);
      })
      .finally(() => setIsLoading(false));
  }, [username]);

  async function handleTip() {
    if (!connected) { await connect(); return; }
    if (!creator?.stellarAddress) { setToast({ message: "Creator has no Stellar address registered.", type: "error" }); return; }

    // Balance check
    try {
      const server = new StellarSdk.Horizon.Server(HORIZON_URL);
      const account = await server.loadAccount(address!);
      const balanceEntry = account.balances.find((b) =>
        selectedAsset.code === "XLM"
          ? b.asset_type === "native"
          : "asset_code" in b && b.asset_code === selectedAsset.code && b.asset_issuer === selectedAsset.issuer
      );
      const bal = parseFloat((balanceEntry as { balance: string } | undefined)?.balance ?? "0");
      if (bal < parseFloat(amount)) {
        setToast({ message: `Insufficient ${selectedAsset.code} balance`, type: "error" });
        return;
      }
    } catch {
      setToast({ message: "Failed to check balance.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const asset =
        selectedAsset.code === "XLM"
          ? StellarSdk.Asset.native()
          : new StellarSdk.Asset(selectedAsset.code, selectedAsset.issuer);
      const xdr = await buildPaymentTx(address!, creator.stellarAddress, amount, asset);
      const hash = await signAndSubmitTx(xdr);
      setToast({ message: `Tip sent in ${selectedAsset.code}! Tx: ${hash.slice(0, 8)}…${hash.slice(-4)}`, type: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Transaction failed", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  if (fetchError) {
    return (
      <section className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 text-lg">{fetchError}</p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="max-w-lg mx-auto px-4 py-16 flex flex-col gap-8" aria-busy="true" aria-label="Loading">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="w-32 h-7" />
          <Skeleton className="w-48 h-4" />
        </div>
        <div className="bg-gray-800 rounded-xl p-6 flex flex-col gap-4">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-full h-10" />
          <Skeleton className="w-full h-10" />
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-lg mx-auto px-4 py-16 flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div
          aria-hidden="true"
          className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold"
        >
          {username[0]?.toUpperCase()}
        </div>
        <h1 className="text-3xl font-bold">@{username}</h1>
        <p className="text-gray-400">{creator?.bio ?? ""}</p>
        {creator?.stellarAddress && (
          <p className="text-xs text-gray-500 font-mono">{creator.stellarAddress.slice(0, 8)}…{creator.stellarAddress.slice(-4)}</p>
        )}
      </div>

      <ErrorBoundary>
        <div className="bg-gray-800 rounded-xl p-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Asset
            <select
              value={`${selectedAsset.code}:${selectedAsset.issuer}`}
              onChange={(e) => {
                const opt = assetOptions.find((a) => `${a.code}:${a.issuer}` === e.target.value) ?? XLM_ASSET;
                setSelectedAsset(opt);
              }}
              className="mt-1 px-3 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {assetOptions.map((a) => (
                <option key={`${a.code}:${a.issuer}`} value={`${a.code}:${a.issuer}`}>{a.code}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Amount ({selectedAsset.code})
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 px-3 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <Button onClick={handleTip} disabled={loading || !creator}>
            {loading ? "Sending…" : connected ? `Tip @${username}` : "Connect Wallet to Tip"}
          </Button>
          {connected && (
            <p className="text-xs text-gray-500 text-center">Sending from {address?.slice(0, 8)}…</p>
          )}
        </div>
      </ErrorBoundary>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </section>
  );
}
