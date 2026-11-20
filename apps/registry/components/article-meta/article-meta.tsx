import { Badge } from "@vllnt/ui";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import type { ArticleFrontmatter } from "@/lib/articles";

type ArticleMetaProps = {
  readonly frontmatter: ArticleFrontmatter;
  readonly locale: Locale;
  /** List the tags under the dates. On by default; the index leaves them off. */
  readonly showTags?: boolean;
};

function formatDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

/**
 * Status, publication date and, when it differs, the update date of an article,
 * then its tags. Dates are `YYYY-MM-DD` calendar days, so they are formatted in
 * UTC and read the same in every time zone.
 *
 * @param frontmatter - the article's validated frontmatter
 * @param locale - locale of the labels and the date format
 * @param showTags - whether to list the tags
 */
export async function ArticleMeta({
  frontmatter,
  locale,
  showTags = true,
}: ArticleMetaProps) {
  const t = await getTranslations({ locale, namespace: "pages.articles" });
  const { date, status, tags, updated } = frontmatter;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <Badge variant="outline">{t(`status.${status}`)}</Badge>
        <span>
          {t("published")} <time dateTime={date}>{formatDate(date, locale)}</time>
        </span>
        {updated === date ? null : (
          <span>
            {t("updated")}{" "}
            <time dateTime={updated}>{formatDate(updated, locale)}</time>
          </span>
        )}
      </div>
      {showTags && tags.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li key={tag}>
              <Badge variant="secondary">{tag}</Badge>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
