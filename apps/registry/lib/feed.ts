export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.com";

/** Escapes text for XML element content and attribute values. */
export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/** Response headers for a cached release feed of the given content type. */
export function feedHeaders(contentType: string): Headers {
  return new Headers([
    [
      "Cache-Control",
      "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    ],
    ["Content-Type", contentType],
  ]);
}
