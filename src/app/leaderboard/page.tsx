"use client";

import { useCallback } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import { useAsync } from "@/hooks/useAsync";
import { formatAmount, pluralize } from "@/utils/format";
import { ROUTES } from "@/constants";
import Avatar from "@/components/Avatar";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Skeleton from "@/components/Skeleton";

/** Medals for the top three; everyone else gets their numeric rank. */
function rankLabel(index: number): string {
  return ["🥇", "🥈", "🥉"][index] ?? `#${index + 1}`;
}

export default function LeaderboardPage() {
  const load = useCallback(() => api.getLeaderboard(), []);
  const { data, loading, error, reload } = useAsync(load);

  const creators = data ?? [];

  return (
    <section className="max-w-2xl mx-auto px-4 py-16 flex flex-col gap-6">
      <PageHeader
        title="Leaderboard"
        description="The creators receiving the most support right now."
      />

      {loading && (
        <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading leaderboard">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-16 rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <Alert severity="error" title="Could not load the leaderboard">
          <p className="mb-3">{error}</p>
          <Button variant="outline" onClick={reload}>
            Try again
          </Button>
        </Alert>
      )}

      {!loading && !error && creators.length === 0 && (
        <EmptyState
          title="No tips recorded yet"
          description="The leaderboard fills up as creators start receiving tips."
          action={
            <Link href={ROUTES.explore}>
              <Button variant="outline">Explore creators</Button>
            </Link>
          }
        />
      )}

      {creators.length > 0 && (
        <ol className="flex flex-col gap-2">
          {creators.map((creator, index) => (
            <li key={creator.username}>
              <Link
                href={ROUTES.creator(creator.username)}
                className="flex items-center gap-4 bg-gray-800 hover:bg-gray-700 transition rounded-xl px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              >
                <span className="w-8 text-center text-lg" aria-label={`Rank ${index + 1}`}>
                  {rankLabel(index)}
                </span>
                <Avatar name={creator.username} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">@{creator.username}</p>
                  {creator.bio && (
                    <p className="text-xs text-gray-400 truncate">{creator.bio}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {creator.totalReceived !== undefined && (
                    <p className="font-semibold">{formatAmount(creator.totalReceived)} XLM</p>
                  )}
                  {creator.tipCount !== undefined && (
                    <p className="text-xs text-gray-500">{pluralize(creator.tipCount, "tip")}</p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
