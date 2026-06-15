import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";


const AI_CRAWLERS = [
  "GPTBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  const aiAllow = AI_CRAWLERS.map((userAgent) => ({
    userAgent,
    allow: "/",
  }));

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      ...aiAllow,
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
