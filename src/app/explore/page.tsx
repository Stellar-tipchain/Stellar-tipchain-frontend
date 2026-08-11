"use client";

import { useCallback, useState } from "react";
import { api } from "@/services/api";
import { useAsync } from "@/hooks/useAsync";
import { useDebounce } from "@/hooks/useDebounce";
import { pluralize } from "@/utils/format";
import CreatorCard from "@/components/CreatorCard";
import Skeleton from "@/components/Skeleton";
import ErrorBoundary from "@/components/ErrorBoundary";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import Alert from "@/components/Alert";
import Button from "@/components/Button";

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 250);

  const load = useCallback(() => api.getCreators(), []);
  const { data, loading, error, reload } = useAsync(load);

  const creators = data ?? [];
  const needle = debouncedQuery.trim().toLowerCase();
  const filtered = needle
    ? creators.filter(
        (c) =>
          c.username.toLowerCase().includes(needle) ||
          c.bio?.toLowerCase().includes(needle)
      )
    : creators;

  return (
    <section className="max-w-3xl mx-auto px-4 py-16">
      <PageHeader
        title="Explore Creators"
        description={
          loading || error ? undefined : `${pluralize(creators.length, "creator")} registered`
        }
      />

      <label htmlFor="creator-search" className="sr-only">
        Search creators
      </label>
      <input
        id="creator-search"
        type="search"
        placeholder="Search by name or bio…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full mb-8 px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <ErrorBoundary>
        {loading ? (
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4" aria-busy="true" aria-label="Loading creators">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i}>
                <div className="flex flex-col items-center gap-2 p-5 rounded-xl bg-gray-800">
                  <Skeleton className="w-14 h-14 rounded-full" />
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-32 h-3" />
                </div>
              </li>
            ))}
          </ul>
        ) : error ? (
          <Alert severity="error" title="Could not load creators">
            <p className="mb-3">{error}</p>
            <Button variant="outline" onClick={reload}>
              Try again
            </Button>
          </Alert>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={needle ? `No results for "${debouncedQuery}"` : "No creators registered yet"}
            description={
              needle
                ? "Try a different name, or clear the search to see everyone."
                : "Be the first — register a username and start accepting tips."
            }
            action={
              needle ? (
                <Button variant="outline" onClick={() => setQuery("")}>
                  Clear search
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <li key={c.username}>
                <CreatorCard username={c.username} bio={c.bio} tipCount={c.tipCount} />
              </li>
            ))}
          </ul>
        )}
      </ErrorBoundary>
    </section>
  );
}
