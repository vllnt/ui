import {
  feedUpdatedAt,
  getReleaseRecords,
  releasePageUrl,
} from "@/lib/changelog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";
const RSS_HEADERS = new Headers([
  [
    "Cache-Control",
    "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  ],
  ["Content-Type", "application/rss+xml; charset=utf-8"],
]);
type ReleaseRecord = Awaited<ReturnType<typeof getReleaseRecords>>[number];

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildRssDate(value?: string): string {
  return new Date(value ?? 0).toUTCString();
}

function buildRssItem(release: ReleaseRecord): string {
  const link = releasePageUrl(release);
  return [
    "    <item>",
    `      <title>${escapeXml(release.title)}</title>`,
    `      <link>${escapeXml(link)}</link>`,
    `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
    `      <pubDate>${escapeXml(buildRssDate(release.date))}</pubDate>`,
    `      <description>${escapeXml(release.summary)}</description>`,
    "    </item>",
  ].join("\n");
}

async function buildRssXml(): Promise<string> {
  const releases = await getReleaseRecords();
  const items = releases
    .filter((release) => release.date !== undefined)
    .map(buildRssItem)
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    "    <title>VLLNT UI Releases</title>",
    `    <link>${SITE_URL}/releases</link>`,
    "    <description>Versioned VLLNT UI release notes.</description>",
    `    <lastBuildDate>${buildRssDate(feedUpdatedAt(releases))}</lastBuildDate>`,
    "    <language>en-US</language>",
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");
}

export const revalidate = 3600;

async function getRssXml(): Promise<Response> {
  const body = await buildRssXml();
  return new Response(body, { headers: RSS_HEADERS });
}

export { getRssXml as GET };
