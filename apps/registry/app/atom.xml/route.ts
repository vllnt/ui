import {
  feedUpdatedAt,
  getReleaseRecords,
  releasePageUrl,
} from "@/lib/changelog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";
const ATOM_HEADERS = new Headers([
  [
    "Cache-Control",
    "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  ],
  ["Content-Type", "application/atom+xml; charset=utf-8"],
]);

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildAtomDate(value?: string): string {
  return new Date(value ?? Date.now()).toISOString();
}

async function buildAtomXml(): Promise<string> {
  const releases = await getReleaseRecords();
  const entries = releases
    .map((release) => {
      const link = releasePageUrl(release);
      return [
        "  <entry>",
        `    <title>${escapeXml(release.title)}</title>`,
        `    <id>${escapeXml(link)}</id>`,
        `    <link href="${escapeXml(link)}" />`,
        `    <updated>${escapeXml(buildAtomDate(release.date))}</updated>`,
        `    <summary>${escapeXml(release.summary)}</summary>`,
        "  </entry>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    "  <title>VLLNT UI Releases</title>",
    `  <id>${SITE_URL}/releases</id>`,
    `  <link href="${SITE_URL}/releases" />`,
    `  <link rel="self" href="${SITE_URL}/atom.xml" />`,
    `  <updated>${escapeXml(feedUpdatedAt(releases))}</updated>`,
    entries,
    "</feed>",
  ].join("\n");
}

export const revalidate = 3600;

async function getAtomXml(): Promise<Response> {
  const body = await buildAtomXml();
  return new Response(body, { headers: ATOM_HEADERS });
}

export { getAtomXml as GET };
