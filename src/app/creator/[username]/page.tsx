"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import Button from "@/components/Button";
import Toast from "@/components/Toast";
import { api } from "@/services/api";
import { buildPaymentTx, signAndSubmitTx } from "@/services/stellar";

interface Props {
  params: { username: string };
}

function horizonErrorMessage(err: unknown): string {
  const codes: string[] = (err as any)?.response?.data?.extras?.result_codes?.operations ?? [];
  const txCode: string = (err as any)?.response?.data?.extras?.result_codes?.transaction ?? "";
  const all = [...codes, txCode];
  if (all.includes("tx_insufficient_balance") || all.includes("op_underfunded")) return "Insufficient XLM balance";
  if (all.includes("op_no_destination")) return "Destination account does not exist";
  return `Transaction failed: ${(err as Error).message}`;
}

export default function CreatorPage({ params }: Props) {
  const { username } = params;
  const { connected, connect, address } = useWallet();
  const [creator, setCreator] = useState<{ username: string; bio: string; stellarAddress: string } | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [amount, setAmount] = useState("10");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    api.getCreator(username)
      .then(setCreator)
      .catch((err: Error) => {
        if (err.message.includes("404")) setFetchError("Creator not found.");
        else setFetchError(`Could not load creator: ${err.message}`);
      });
  }, [username]);

  async function handleTip() {
    if (!connected) { await connect(); return; }
    if (!creator?.stellarAddress) { setToast({ message: "Creator has no Stellar address registered.", type: "error" }); return; }

    setLoading(true);
    try {
      const xdr = await buildPaymentTx(address!, creator.stellarAddress, amount);
      const hash = await signAndSubmitTx(xdr);
      setToast({ message: `Tip sent! Tx: ${hash.slice(0, 8)}…${hash.slice(-4)}`, type: "success" });
    } catch (err) {
      const isHorizonErr = !!(err as any)?.response?.data?.extras;
      setToast({ message: isHorizonErr ? horizonErrorMessage(err) : `Transaction failed: ${(err as Error).message}`, type: "error" });
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

  return (
    <section className="max-w-lg mx-auto px-4 py-16 flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold">
          {username[0]?.toUpperCase()}
        </div>
        <h1 className="text-3xl font-bold">@{username}</h1>
        <p className="text-gray-400">{creator?.bio ?? "Loading…"}</p>
        {creator?.stellarAddress && (
          <p className="text-xs text-gray-500 font-mono">{creator.stellarAddress.slice(0, 8)}…{creator.stellarAddress.slice(-4)}</p>
        )}
      </div>

      <div className="bg-gray-800 rounded-xl p-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Amount (XLM)
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

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </section>
  );
}
