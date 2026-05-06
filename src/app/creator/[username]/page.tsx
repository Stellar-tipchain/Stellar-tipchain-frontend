"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import Button from "@/components/Button";
import Toast from "@/components/Toast";

interface Props {
  params: { username: string };
}

export default function CreatorPage({ params }: Props) {
  const { username } = params;
  const { connected, connect, address } = useWallet();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [amount, setAmount] = useState("10");

  async function handleTip() {
    if (!connected) {
      await connect();
      return;
    }
    // Tip submission placeholder — wire to Stellar SDK in next milestone
    setToast({ message: `Tip of ${amount} XLM sent to @${username}!`, type: "success" });
  }

  return (
    <section className="max-w-lg mx-auto px-4 py-16 flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold">
          {username[0]?.toUpperCase()}
        </div>
        <h1 className="text-3xl font-bold">@{username}</h1>
        <p className="text-gray-400">Creator on Stellar Tipchain</p>
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
        <Button onClick={handleTip}>
          {connected ? `Tip @${username}` : "Connect Wallet to Tip"}
        </Button>
        {connected && (
          <p className="text-xs text-gray-500 text-center">Sending from {address?.slice(0, 8)}…</p>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </section>
  );
}
