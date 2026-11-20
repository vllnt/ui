import { locales } from "@/i18n/locales";
import { articleFeedResponse } from "@/lib/article-feed-route";

/**
 * Atom feed of one locale's articles, at `/articles/<locale>/atom.xml`. The
 * dotted file name keeps it outside the locale middleware.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

type Context = {
  readonly params: Promise<{ locale: string }>;
};

export function generateStaticParams(): { locale: string }[] {
  return locales.map((locale) => ({ locale }));
}

async function getArticlesAtom(
  _request: Request,
  { params }: Context,
): Promise<Response> {
  const { locale } = await params;

  return articleFeedResponse(locale, "atom");
}

export { getArticlesAtom as GET };
