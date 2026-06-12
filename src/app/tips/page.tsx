"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import Button from "@/components/Button";
import Toast from "@/components/Toast";
import { api } from "@/services/api";
import { buildPaymentTx, signAndSubmitTx } from "@/services/stellar";

function horizonErrorMessage(err: unknown): string {
  // Horizon wraps errors in response.data.extras.result_codes
  const codes: string[] = (err as any)?.response?.data?.extras?.result_codes?.operations ?? [];
  const txCode: string = (err as any)?.response?.data?.extras?.result_codes?.transaction ?? "";
  const all = [...codes, txCode];
  if (all.includes("tx_insufficient_balance") || all.includes("op_underfunded")) return "Insufficient XLM balance";
  if (all.includes("op_no_destination")) return "Destination account does not exist";
  return `Transaction failed: ${(err as Error).message}`;
}

export default function TipsPage() {
  const { connected, connecting, connect, address } = useWallet();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("10");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!connected) { await connect(); return; }
    if (!to || !amount) { setToast({ message: "Please fill in all fields.", type: "error" }); return; }

    setLoading(true);
    try {
      const creator = await api.getCreator(to);
      if (!creator?.stellarAddress) throw new Error("Creator has no Stellar address registered.");
      const xdr = await buildPaymentTx(address!, creator.stellarAddress, amount);
      const hash = await signAndSubmitTx(xdr);
      setToast({ message: `Tip sent! Tx: ${hash.slice(0, 8)}…${hash.slice(-4)}`, type: "success" });
      setTo("");
      setAmount("10");
    } catch (err) {
      const isHorizonErr = !!(err as any)?.response?.data?.extras;
      setToast({ message: isHorizonErr ? horizonErrorMessage(err) : `Transaction failed: ${(err as Error).message}`, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-md mx-auto px-4 py-16 flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Send a Tip</h1>

      {!connected && (
        <div className="bg-gray-800 rounded-xl p-5 flex flex-col gap-3 text-center">
          <p className="text-gray-400 text-sm">Connect your Stellar wallet to send tips.</p>
          <Button onClick={connect} disabled={connecting}>
            {connecting ? "Connecting…" : "Connect Wallet"}
          </Button>
        </div>
      )}

      {connected && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-gray-800 rounded-xl p-6">
          <p className="text-xs text-gray-500">Connected: {address?.slice(0, 8)}…</p>
          <label className="flex flex-col gap-1 text-sm">
            Creator username
            <input
              type="text"
              placeholder="alice"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
              className="mt-1 px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Amount (XLM)
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="mt-1 px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <Button type="submit" disabled={loading}>{loading ? "Sending…" : "Send Tip"}</Button>
        </form>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </section>
  );
}
