"use client";

import { useCallback, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useAsync } from "@/hooks/useAsync";
import { getPaymentHistory } from "@/services/horizon";
import { formatAssetAmount, formatRelativeTime } from "@/utils/format";
import { truncateAddress } from "@/utils";
import { toUserMessage } from "@/lib/errors";
import type { PaymentRecord } from "@/types";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import CopyButton from "@/components/CopyButton";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import Alert from "@/components/Alert";
import Skeleton from "@/components/Skeleton";
import TxLink from "@/components/TxLink";

type Filter = "all" | "sent" | "received";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "received", label: "Received" },
  { value: "sent", label: "Sent" },
];

export default function HistoryPage() {
  const { address, connected, connecting, connect } = useWallet();

  const [extraPages, setExtraPages] = useState<PaymentRecord[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagingError, setPagingError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const load = useCallback(async () => {
    const page = await getPaymentHistory(address!);
    // Reset accumulated pages whenever the first page is refetched, otherwise a
    // wallet switch would show the previous account's payments underneath.
    setExtraPages([]);
    setCursor(page.nextCursor);
    return page.records;
  }, [address]);

  const { data, loading, error, reload } = useAsync(load, [address], { enabled: connected });

  const payments = [...(data ?? []), ...extraPages];
  const visible = filter === "all" ? payments : payments.filter((p) => p.direction === filter);

  async function loadMore() {
    if (!address || !cursor) return;
    setLoadingMore(true);
    setPagingError(null);
    try {
      const page = await getPaymentHistory(address, cursor);
      setExtraPages((prev) => [...prev, ...page.records]);
      setCursor(page.nextCursor);
    } catch (err) {
      setPagingError(toUserMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }

  if (!connected) {
    return (
      <section className="max-w-md mx-auto px-4 py-16 flex flex-col gap-4 text-center">
        <p className="text-gray-400">Connect your wallet to view your tip history.</p>
        <Button onClick={connect} disabled={connecting}>
          {connecting ? "Connecting…" : "Connect Wallet"}
        </Button>
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-12 flex flex-col gap-6">
      <PageHeader title="Tip History" description="Payments to and from your connected wallet." />

      <div className="flex gap-2" role="group" aria-label="Filter payments">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={filter === option.value}
            onClick={() => setFilter(option.value)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              filter === option.value
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading history">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-12 rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <Alert severity="error" title="Could not load history">
          <p className="mb-3">{error}</p>
          <Button variant="outline" onClick={reload}>
            Try again
          </Button>
        </Alert>
      )}

      {!loading && !error && visible.length === 0 && (
        <EmptyState
          title={payments.length === 0 ? "No payments yet" : `No ${filter} payments`}
          description={
            payments.length === 0
              ? "Once you send or receive a tip it will show up here."
              : "Try a different filter."
          }
        />
      )}

      {visible.length > 0 && (
        <ul className="flex flex-col gap-2">
          {visible.map((payment) => (
            <li
              key={payment.pagingToken}
              className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3 text-sm gap-4"
            >
              <span
                className="text-gray-400 text-xs whitespace-nowrap"
                title={new Date(payment.timestamp).toLocaleString()}
              >
                {formatRelativeTime(payment.timestamp)}
              </span>
              <span className="font-medium whitespace-nowrap">
                {formatAssetAmount(payment.amount, payment.asset)}
              </span>
              <Badge tone={payment.direction === "received" ? "success" : "info"}>
                {payment.direction === "received" ? "Received" : "Sent"}
              </Badge>
              <CopyButton
                value={payment.counterpart}
                label="counterparty address"
                className="font-mono text-xs"
              >
                {truncateAddress(payment.counterpart, 6)}
              </CopyButton>
              {payment.transactionHash && (
                <TxLink hash={payment.transactionHash} className="text-xs text-gray-400" />
              )}
            </li>
          ))}
        </ul>
      )}

      {pagingError && <Alert severity="error">{pagingError}</Alert>}

      {cursor && (
        <Button onClick={loadMore} disabled={loadingMore} variant="outline">
          {loadingMore ? "Loading…" : "Load more"}
        </Button>
      )}
    </section>
  );
}
