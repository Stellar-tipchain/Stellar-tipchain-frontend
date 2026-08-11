import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stellar-tipchain.example";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // These pages are specific to the visitor's own connected wallet, so
      // there is nothing useful for a crawler to index.
      disallow: ["/history", "/dashboard"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
