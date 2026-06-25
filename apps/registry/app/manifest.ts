import type { MetadataRoute } from "next";

import { getComponentCount } from "@/lib/stats";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#0a0a0a",
    categories: ["developer", "productivity", "design"],
    description: `Agent-first React component registry. ${getComponentCount()} accessible components built on Radix UI, Tailwind CSS, and CVA.`,
    display: "standalone",
    name: "VLLNT UI",
    orientation: "any",
    scope: "/",
    short_name: "VLLNT UI",
    start_url: "/",
    theme_color: "#0a0a0a",
  };
}
