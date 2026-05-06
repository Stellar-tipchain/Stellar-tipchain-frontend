"use client";

import { useState } from "react";
import CreatorCard from "@/components/CreatorCard";

const MOCK_CREATORS = [
  { username: "alice", bio: "Digital artist & illustrator" },
  { username: "bob", bio: "Open-source developer" },
  { username: "carol", bio: "Music producer & beatmaker" },
  { username: "dave", bio: "Writer & content creator" },
  { username: "eve", bio: "Photographer & visual storyteller" },
  { username: "frank", bio: "Indie game developer" },
];

export default function ExplorePage() {
  const [query, setQuery] = useState("");

  const filtered = MOCK_CREATORS.filter((c) =>
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
      {filtered.length === 0 ? (
        <p className="text-gray-400">No creators found.</p>
      ) : (
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
