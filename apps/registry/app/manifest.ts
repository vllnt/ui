import type { MetadataRoute } from "next";

import { getComponentCount } from "@/lib/stats";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#0a0a0a",
    categories: ["developer", "productivity", "design"],
    description: `Agent-first React component registry. ${getComponentCount()} accessible components built on Radix UI, Tailwind CSS, and CVA.`,
    dir: "ltr",
    display: "standalone",
    icons: [
      { purpose: "any", sizes: "any", src: "/icon.svg", type: "image/svg+xml" },
      { sizes: "180x180", src: "/apple-icon", type: "image/png" },
    ],
    id: "/",
    lang: "en",
    name: "VLLNT UI",
    orientation: "any",
    scope: "/",
    short_name: "VLLNT UI",
    start_url: "/",
    theme_color: "#0a0a0a",
  };
}
