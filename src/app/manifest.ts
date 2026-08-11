import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Stellar Tipchain",
    short_name: "Tipchain",
    description: "Tip creators directly with Stellar assets.",
    start_url: "/",
    display: "standalone",
    background_color: "#030712",
    theme_color: "#030712",
  };
}
