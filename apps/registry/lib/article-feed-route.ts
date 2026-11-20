import { createTranslator } from "next-intl";

import { type Locale, locales } from "@/i18n/locales";
import {
  type ArticleFeedFormat,
  buildArticlesAtom,
  buildArticlesRss,
} from "@/lib/article-feed";
import { getArticles } from "@/lib/articles";
import { feedHeaders } from "@/lib/feed";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";

const MESSAGES: Record<Locale, typeof en> = { en, fr };

const CONTENT_TYPES: Record<ArticleFeedFormat, string> = {
  atom: "application/atom+xml; charset=utf-8",
  rss: "application/rss+xml; charset=utf-8",
};

/**
 * The response of an articles feed route. The channel title and description
 * come from the locale's messages, read directly so the handler needs no
 * request context. An unknown locale answers 404.
 *
 * @param locale - the `[locale]` segment of the route
 * @param format - `rss` or `atom`
 * @returns The feed, or a 404 response
 * @example
 * export const GET = (_request, { params }) =>
 *   params.then(({ locale }) => articleFeedResponse(locale, "rss"));
 */
export async function articleFeedResponse(
  locale: string,
  format: ArticleFeedFormat,
): Promise<Response> {
  const known = locales.find((candidate) => candidate === locale);
  if (!known) {
    return new Response("Not found", {
      headers: new Headers([["Cache-Control", "no-store"]]),
      status: 404,
    });
  }

  const t = createTranslator({
    locale: known,
    messages: MESSAGES[known],
    namespace: "pages.articles",
  });
  const articles = await getArticles(known);
  const channel = {
    buildDate: new Date(),
    description: t("feedDescription"),
    title: t("feedTitle"),
  };
  const body =
    format === "rss"
      ? buildArticlesRss(known, articles, channel)
      : buildArticlesAtom(known, articles, channel);

  return new Response(body, { headers: feedHeaders(CONTENT_TYPES[format]) });
}
