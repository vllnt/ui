import { DOCS_PAGES } from "@/lib/docs-pages";
import { splitLocale } from "@/lib/platform-variant";

import componentSlugs from "./component-slugs.json";

/**
 * Pages that can answer `Accept: text/markdown`. Each has authored markdown
 * behind it (the llms.txt summary, the design guide, MDX content), so the
 * markdown is the page's content and not a conversion of its HTML.
 */
export type MarkdownTarget =
  | { readonly kind: "component"; readonly slug: string }
  | { readonly kind: "design" }
  | { readonly kind: "docs"; readonly slug: string }
  | { readonly kind: "home" }
  | { readonly kind: "philosophy" };

/** The changelog page appends the CHANGELOG.md files when it renders, so MDX alone would be partial. */
const MARKDOWN_DOCS = new Set(
  DOCS_PAGES.map((page) => page.slug).filter((slug) => slug !== "changelog"),
);
const MARKDOWN_COMPONENTS = new Set(componentSlugs);

function weightOf(parameters: readonly string[]): number {
  const weight = parameters.find((parameter) => parameter.startsWith("q="));
  const value = weight ? Number(weight.slice(2)) : 1;

  return Number.isNaN(value) ? 0 : value;
}

/**
 * Whether an `Accept` header asks for markdown at least as strongly as HTML.
 * Browsers never name `text/markdown`, and a wildcard does not select it, so a
 * client gets markdown when it names the type.
 *
 * @param accept - raw `Accept` request header
 * @returns `true` when the header names `text/markdown` and ranks it at or above `text/html`
 * @example
 * prefersMarkdown("text/markdown, text/html;q=0.9"); // true
 * prefersMarkdown("text/html,application/xhtml+xml,*\/*;q=0.8"); // false
 */
export function prefersMarkdown(accept: null | string | undefined): boolean {
  if (!accept) return false;
  const weights = new Map(
    accept
      .toLowerCase()
      .split(",")
      .map((part) => {
        const [type = "", ...parameters] = part
          .split(";")
          .map((segment) => segment.trim());

        return [type, weightOf(parameters)] as const;
      }),
  );
  const markdown = weights.get("text/markdown") ?? 0;

  return markdown > 0 && markdown >= (weights.get("text/html") ?? 0);
}

/**
 * The markdown page behind a public pathname.
 *
 * @param pathname - pathname without a locale prefix (`/docs/cli`)
 * @returns The target, or `undefined` for a page with no markdown twin
 */
export function markdownTarget(pathname: string): MarkdownTarget | undefined {
  if (pathname === "/") return { kind: "home" };
  if (pathname === "/design") return { kind: "design" };
  if (pathname === "/philosophy") return { kind: "philosophy" };
  const [, section, slug, ...rest] = pathname.split("/");
  if (slug === undefined || rest.length > 0) return undefined;
  if (section === "docs" && MARKDOWN_DOCS.has(slug)) {
    return { kind: "docs", slug };
  }
  if (section === "components" && MARKDOWN_COMPONENTS.has(slug)) {
    return { kind: "component", slug };
  }

  return undefined;
}

/**
 * Every public pathname that has a markdown twin, without a locale prefix.
 * The markdown route prerenders one document per entry and locale.
 *
 * @returns Pathnames such as `/`, `/docs/cli` and `/components/button`
 */
export function markdownPathnames(): string[] {
  return [
    "/",
    "/design",
    "/philosophy",
    ...[...MARKDOWN_DOCS].map((slug) => `/docs/${slug}`),
    ...[...MARKDOWN_COMPONENTS].map((slug) => `/components/${slug}`),
  ];
}

/** Route that serves the markdown for a public pathname. */
const MARKDOWN_ROUTE = "/md";

/**
 * Internal route that holds the markdown twin of a public page, or `undefined`
 * when the page has none. The middleware rewrites to it for `Accept: text/markdown`.
 *
 * @param pathname - public pathname as received (`/fr/docs/cli`)
 * @returns Internal pathname such as `/md/fr/docs/cli`
 * @example
 * markdownPathname("/components/button"); // "/md/en/components/button"
 */
export function markdownPathname(pathname: string): string | undefined {
  const path = splitLocale(pathname);
  if (!markdownTarget(path.pathname)) return undefined;
  const rest = path.pathname === "/" ? "" : path.pathname;

  return `${MARKDOWN_ROUTE}/${path.locale}${rest}`;
}
