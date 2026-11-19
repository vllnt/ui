const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.com";

/**
 * Content Signals (https://contentsignals.org) state what a crawler may do with
 * the content it fetches. The library is MIT-licensed and the site exists for
 * people and agents to read, so the signals permit every use, AI training
 * included. They match the explicit allow rules for the AI crawlers below.
 */
const CONTENT_SIGNAL = "search=yes, ai-input=yes, ai-train=yes";

const USER_AGENTS = [
  "*",
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

const TEXT_HEADERS = new Headers([
  [
    "Cache-Control",
    "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
  ],
  ["Content-Type", "text/plain; charset=utf-8"],
]);

/**
 * `MetadataRoute.Robots` cannot carry a `Content-Signal` line, so this function
 * writes the file. Each group repeats the signal because a crawler obeys the
 * group that names it and ignores the rest.
 */
function buildRobotsTxt(): string {
  const groups = USER_AGENTS.map((userAgent) =>
    [
      `User-Agent: ${userAgent}`,
      "Allow: /",
      `Content-Signal: ${CONTENT_SIGNAL}`,
    ].join("\n"),
  );

  const locations = [`Host: ${SITE_URL}`, `Sitemap: ${SITE_URL}/sitemap.xml`];

  return `${[...groups, locations.join("\n")].join("\n\n")}\n`;
}

export const dynamic = "force-static";

function getRobotsTxt(): Response {
  return new Response(buildRobotsTxt(), { headers: TEXT_HEADERS });
}

export { getRobotsTxt as GET };
