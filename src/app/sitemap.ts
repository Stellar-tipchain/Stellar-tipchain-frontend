import type { MetadataRoute } from "next";

/**
 * Static routes only. Creator profiles are rendered client-side from the
 * backend API, so they are not enumerable at build time; a future milestone
 * can add them here once creators can be listed server-side.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stellar-tipchain.example";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/explore", "/tips", "/register", "/leaderboard", "/history"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
