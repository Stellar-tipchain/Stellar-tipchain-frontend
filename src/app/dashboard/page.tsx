"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";
import { useAsync } from "@/hooks/useAsync";
import { getBalances, getPaymentHistory } from "@/services/horizon";
import { formatAmount, formatAssetAmount, formatRelativeTime, pluralize } from "@/utils/format";
import { availableBalance } from "@/services/horizon";
import { accountUrl } from "@/utils/explorer";
import { truncateAddress } from "@/utils";
import { ROUTES, XLM } from "@/constants";
import Button from "@/components/Button";
import StatCard from "@/components/StatCard";
import PageHeader from "@/components/PageHeader";
import CopyButton from "@/components/CopyButton";
import EmptyState from "@/components/EmptyState";
import Alert from "@/components/Alert";
import Badge from "@/components/Badge";

/**
 * A creator's own view of their wallet: what they hold, what has come in, and
 * the most recent tips.
 */
export default function DashboardPage() {
  const { address, connected, connecting, connect } = useWallet();

  const load = useCallback(async () => {
    // Balances and history are independent, so fetch them together rather than
    // making the page wait for one before starting the other.
    const [balances, history] = await Promise.all([
      getBalances(address!),
      getPaymentHistory(address!),
    ]);
    return { balances, payments: history.records };
  }, [address]);

  const { data, loading, error, reload } = useAsync(load, [address], { enabled: connected });

  if (!connected) {
    return (
      <section className="max-w-md mx-auto px-4 py-16 flex flex-col gap-4 text-center">
        <p className="text-gray-400">Connect your wallet to see your creator dashboard.</p>
        <Button onClick={connect} disabled={connecting}>
          {connecting ? "Connecting…" : "Connect Wallet"}
        </Button>
      </section>
    );
  }

  const balances = data?.balances ?? [];
  const payments = data?.payments ?? [];
  const received = payments.filter((p) => p.direction === "received");

  // Totals are per-asset: summing XLM and USDC into one figure would be meaningless.
  const receivedXlm = received
    .filter((p) => p.asset.issuer === "")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <section className="max-w-2xl mx-auto px-4 py-12 flex flex-col gap-8">
      <PageHeader
        title="Dashboard"
        description="Your wallet at a glance."
        action={
          <Button variant="outline" onClick={reload} disabled={loading}>
            Refresh
          </Button>
        }
      />

      <div className="flex items-center gap-3 text-xs text-gray-500">
        <CopyButton value={address!} label="your Stellar address" className="font-mono">
          {truncateAddress(address!, 6)}
        </CopyButton>
        <a
          href={accountUrl(address!)}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition underline underline-offset-2"
        >
          View on explorer
        </a>
      </div>

      {error && (
        <Alert severity="error" title="Could not load your dashboard">
          <p className="mb-3">{error}</p>
          <Button variant="outline" onClick={reload}>
            Try again
          </Button>
        </Alert>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard
          label="XLM balance"
          value={`${formatAmount(availableBalance(balances, XLM))} XLM`}
          loading={loading}
        />
        <StatCard label="Tips received" value={received.length} loading={loading} />
        <StatCard
          label="XLM received"
          value={formatAmount(receivedXlm)}
          sublabel={`across ${pluralize(received.length, "tip")}`}
          loading={loading}
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Assets</h2>
        {!loading && balances.length === 0 ? (
          <EmptyState
            title="This account is not funded yet"
            description="A Stellar account needs a minimum XLM balance before it can receive tips."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {balances.map((balance) => (
              <li
                key={`${balance.asset.code}:${balance.asset.issuer}`}
                className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3 text-sm"
              >
                <span className="font-medium">{balance.asset.code}</span>
                <span className="text-gray-300">{formatAmount(balance.balance)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent tips</h2>
          <Link href={ROUTES.history} className="text-sm text-blue-400 hover:text-blue-300">
            Full history
          </Link>
        </div>

        {!loading && received.length === 0 ? (
          <EmptyState
            title="No tips received yet"
            description="Share your profile link so supporters can find you."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {received.slice(0, 5).map((payment) => (
              <li
                key={payment.pagingToken}
                className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3 text-sm gap-3"
              >
                <span className="text-gray-400 text-xs">
                  {formatRelativeTime(payment.timestamp)}
                </span>
                <span className="font-medium">
                  {formatAssetAmount(payment.amount, payment.asset)}
                </span>
                <Badge tone="success">Received</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
