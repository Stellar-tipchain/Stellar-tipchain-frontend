"use client";

import { useState, useEffect } from "react";
import CreatorCard from "@/components/CreatorCard";
import Skeleton from "@/components/Skeleton";
import ErrorBoundary from "@/components/ErrorBoundary";
import { api } from "@/services/api";

export default function ExplorePage() {
  const [creators, setCreators] = useState<{ username: string; bio?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.getCreators()
      .then(setCreators)
      .catch((err: Error) => setError(`Could not load creators: ${err.message}`))
      .finally(() => setLoading(false));
  }, []);

  const filtered = creators.filter((c) =>
    c.username.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Explore Creators</h1>
      <label htmlFor="creator-search" className="sr-only">
        Search creators
      </label>
      <input
        id="creator-search"
        type="search"
        placeholder="Search creators…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full mb-8 px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <ErrorBoundary>
        {loading ? (
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4" aria-busy="true" aria-label="Loading">
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
          <p className="text-red-400">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400">
            {query ? `No results for "${query}"` : "No creators registered yet"}
          </p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <li key={c.username}>
                <CreatorCard username={c.username} bio={c.bio} />
              </li>
            ))}
          </ul>
        )}
      </ErrorBoundary>
    </section>
  );
}
