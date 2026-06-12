"use client";

import { useState, useEffect } from "react";
import CreatorCard from "@/components/CreatorCard";
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
      <input
        type="search"
        placeholder="Search creators…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full mb-8 px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-800 animate-pulse" />
          ))}
        </div>
      )}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="text-gray-400">No creators found.</p>
      )}
      {!loading && !error && filtered.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <li key={c.username}>
              <CreatorCard username={c.username} bio={c.bio} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
