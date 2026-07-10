import type { Locale } from "@/i18n/routing";
import { canonical } from "@/lib/seo";

/**
 * Centralized builders for the sharing and backlink system.
 *
 * Backlink rule: a link that should pass SEO equity must live in the HOST
 * page's DOM (the embed snippet caption, the badge anchor), not inside an
 * `<iframe>` — a search engine credits an iframe's links to the iframe origin.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.com";

/** Attribution source tags appended as `?ref=` so referrals stay measurable. */
export type ShareRef = "badge" | "embed" | "oembed" | "permalink" | "share";

/** Append a `ref` query param to an absolute URL, preserving existing params. */
export function withRef(absoluteUrl: string, ref: ShareRef): string {
  const url = new URL(absoluteUrl);
  url.searchParams.set("ref", ref);
  return url.toString();
}

/** Absolute, canonical URL of a component detail page. */
export function componentUrl(slug: string, locale: Locale = "en"): string {
  return canonical(`/components/${slug}`, locale);
}

/** Absolute URL of the chromeless, locale-neutral embed preview for a component. */
export function embedUrl(slug: string, theme?: "dark" | "light"): string {
  const url = new URL(`/embed/${slug}`, SITE_URL);
  if (theme) {
    url.searchParams.set("theme", theme);
  }
  return url.toString();
}

/** Absolute URL of the oEmbed JSON endpoint for a given component page URL. */
export function oembedUrl(pageUrl: string): string {
  const url = new URL("/api/oembed", SITE_URL);
  url.searchParams.set("url", pageUrl);
  url.searchParams.set("format", "json");
  return url.toString();
}

export const EMBED_DEFAULT_WIDTH = 600;
export const EMBED_DEFAULT_HEIGHT = 420;

/**
 * Embed snippet: a sized `<iframe>` for the live preview plus a visible
 * caption anchor. The caption anchor is the backlink — it lands in the host
 * page's DOM, so a search engine credits VLLNT UI for the link.
 */
export function buildEmbedSnippet(
  slug: string,
  title: string,
  options: { height?: number; ref?: ShareRef; width?: number } = {},
): string {
  const width = options.width ?? EMBED_DEFAULT_WIDTH;
  const height = options.height ?? EMBED_DEFAULT_HEIGHT;
  const iframeSource = embedUrl(slug);
  const link = withRef(componentUrl(slug), options.ref ?? "embed");
  return [
    `<iframe src="${iframeSource}" width="${width}" height="${height}" style="border:1px solid #e5e7eb;border-radius:12px;max-width:100%;" loading="lazy" title="${title} — VLLNT UI"></iframe>`,
    `<p><a href="${link}">${title} — VLLNT UI</a></p>`,
  ].join("\n");
}

export const BADGE_SVG_PATH = "/api/badge";

/** Copyable "Built with VLLNT UI" badge snippets. The anchor is the backlink. */
export function buildBadgeSnippets(): {
  html: string;
  jsx: string;
  markdown: string;
} {
  const href = withRef(SITE_URL, "badge");
  const img = new URL(BADGE_SVG_PATH, SITE_URL).toString();
  const alt = "Built with VLLNT UI";
  return {
    html: `<a href="${href}" target="_blank" rel="noopener"><img src="${img}" alt="${alt}" height="28" /></a>`,
    jsx: `<a href="${href}" target="_blank" rel="noopener">\n  <img src="${img}" alt="${alt}" height={28} />\n</a>`,
    markdown: `[![${alt}](${img})](${href})`,
  };
}
