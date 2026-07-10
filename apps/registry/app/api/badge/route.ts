const LEFT_TEXT = "built with";
const RIGHT_TEXT = "VLLNT UI";

const LEFT_BG = "#1f2937";
const RIGHT_BG = "#6d28d9";
const TEXT_COLOR = "#ffffff";

const HEIGHT = 28;
const PADDING = 10;
const CHAR_WIDTH = 6.4;
const RADIUS = 4;

const FONT_STACK =
  "Verdana,DejaVu Sans,system-ui,-apple-system,Segoe UI,sans-serif";

function segmentWidth(text: string): number {
  return Math.round(text.length * CHAR_WIDTH + PADDING * 2);
}

/**
 * Static "Built with VLLNT UI" badge served as SVG (same pattern as /api/og).
 *
 * The badge image carries no link equity on its own — consumers wrap it in an
 * `<a href="https://ui.vllnt.com?ref=badge">` (see buildBadgeSnippets), and
 * that anchor in their page DOM is the backlink.
 */
export function GET(): Response {
  const leftWidth = segmentWidth(LEFT_TEXT);
  const rightWidth = segmentWidth(RIGHT_TEXT);
  const totalWidth = leftWidth + rightWidth;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${HEIGHT}" role="img" aria-label="Built with VLLNT UI">
  <title>Built with VLLNT UI</title>
  <defs>
    <clipPath id="r"><rect width="${totalWidth}" height="${HEIGHT}" rx="${RADIUS}" /></clipPath>
  </defs>
  <g clip-path="url(#r)">
    <rect width="${leftWidth}" height="${HEIGHT}" fill="${LEFT_BG}" />
    <rect x="${leftWidth}" width="${rightWidth}" height="${HEIGHT}" fill="${RIGHT_BG}" />
  </g>
  <g fill="${TEXT_COLOR}" font-family="${FONT_STACK}" font-size="12">
    <text x="${leftWidth / 2}" y="18" text-anchor="middle">${LEFT_TEXT}</text>
    <text x="${leftWidth + rightWidth / 2}" y="18" text-anchor="middle" font-weight="bold">${RIGHT_TEXT}</text>
  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      "cache-control": "public, max-age=86400, s-maxage=604800, immutable",
      "content-type": "image/svg+xml; charset=utf-8",
    },
  });
}
