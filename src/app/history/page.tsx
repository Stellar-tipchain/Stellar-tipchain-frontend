"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@/hooks/useWallet";
import { getPaymentHistory, Payment } from "@/services/horizon";
import Button from "@/components/Button";

function truncate(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function HistoryPage() {
  const { address, connected, connecting, connect } = useWallet();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async (addr: string) => {
    setLoading(true);
    setError(false);
    try {
      const res = await getPaymentHistory(addr);
      setPayments(res.records);
      setNextCursor(res.nextCursor);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (connected && address) load(address);
  }, [connected, address, load]);

  async function loadMore() {
    if (!address || !nextCursor) return;
    setLoadingMore(true);
    try {
      const res = await getPaymentHistory(address, nextCursor);
      setPayments((prev) => [...prev, ...res.records]);
      setNextCursor(res.nextCursor);
    } catch {
      setError(true);
    } finally {
      setLoadingMore(false);
    }
  }

  if (!connected) {
    return (
      <section className="max-w-md mx-auto px-4 py-16 flex flex-col gap-4 text-center">
        <p className="text-gray-400">Connect your wallet to view history.</p>
        <Button onClick={connect} disabled={connecting}>
          {connecting ? "Connecting…" : "Connect Wallet"}
        </Button>
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-12 flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Tip History</h1>

      {loading && <p className="text-gray-400">Loading…</p>}

      {error && <p className="text-red-400">Could not load history. Please try again.</p>}

      {!loading && !error && payments.length === 0 && (
        <p className="text-gray-400">No XLM payments found for this wallet.</p>
      )}

      {payments.length > 0 && (
        <div className="flex flex-col gap-2">
          {payments.map((p) => (
            <div
              key={p.pagingToken}
              className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3 text-sm gap-4"
            >
              <span className="text-gray-400 text-xs whitespace-nowrap">
                {new Date(p.timestamp).toLocaleString()}
              </span>
              <span className="font-medium whitespace-nowrap">{p.amount} XLM</span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  p.direction === "received"
                    ? "bg-green-900 text-green-300"
                    : "bg-blue-900 text-blue-300"
                }`}
              >
                {p.direction === "received" ? "Received" : "Sent"}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(p.counterpart)}
                className="text-gray-400 hover:text-white transition font-mono text-xs"
                title="Copy full address"
              >
                {truncate(p.counterpart)}
              </button>
            </div>
          ))}
        </div>
      )}

      {nextCursor && (
        <Button onClick={loadMore} disabled={loadingMore} variant="outline">
          {loadingMore ? "Loading…" : "Load more"}
        </Button>
      )}
    </section>
  );
}
