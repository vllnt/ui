import { locales } from "@/i18n/locales";
import { markdownPathnames } from "@/lib/markdown-negotiation";
import { getMarkdownPage } from "@/lib/markdown-pages";

/**
 * Markdown twin of a public page. The middleware rewrites a request that asks
 * for `text/markdown` here; the route is not a public URL. Every twin is
 * prerendered, so an agent crawling the site never renders a page on demand.
 *
 * The response is `private` because the page URL answers with HTML or markdown
 * by `Accept`: a shared cache that ignores `Vary: Accept` must not keep the
 * markdown and hand it to a browser.
 */
const MARKDOWN_HEADERS = new Headers([
  ["Cache-Control", "private, max-age=0, must-revalidate"],
  ["Content-Type", "text/markdown; charset=utf-8"],
  ["Vary", "Accept"],
]);

const NOT_FOUND_HEADERS = new Headers([["Cache-Control", "no-store"]]);

export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = 86_400;

type Context = {
  readonly params: Promise<{ locale: string; path?: string[] }>;
};

export function generateStaticParams(): { locale: string; path: string[] }[] {
  return locales.flatMap((locale) =>
    markdownPathnames().map((pathname) => ({
      locale,
      path: pathname.split("/").filter(Boolean),
    })),
  );
}

async function getMarkdown(
  _request: Request,
  { params }: Context,
): Promise<Response> {
  const { locale, path = [] } = await params;
  const entry = locales.find((candidate) => candidate === locale);
  const markdown = entry
    ? await getMarkdownPage(`/${path.join("/")}`, entry)
    : undefined;
  if (markdown === undefined) {
    return new Response("Not found", {
      headers: NOT_FOUND_HEADERS,
      status: 404,
    });
  }

  return new Response(markdown, { headers: MARKDOWN_HEADERS });
}

export { getMarkdown as GET };
