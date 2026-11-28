import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ArticleMeta } from "@/components/article-meta";
import { PageShell } from "@/components/page-shell";
import { Link, type Locale } from "@/i18n/routing";
import { articleFeedPath } from "@/lib/article-feed";
import {
  articlesIndexMetadata,
  articlesIndexStructuredData,
} from "@/lib/article-seo";
import { articleHeading, articlePath, getArticles } from "@/lib/articles";
import { getSidebarSections } from "@/lib/sidebar-sections";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.articles" });

  return articlesIndexMetadata(locale, {
    description: t("metaDescription"),
    title: t("metaTitle"),
  });
}

export default async function ArticlesIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, common, articles] = await Promise.all([
    getTranslations("pages.articles"),
    getTranslations("common"),
    getArticles(locale),
  ]);

  return (
    <PageShell
      jsonLd={articlesIndexStructuredData({
        articles,
        copy: { description: t("metaDescription"), title: t("title") },
        homeName: common("home"),
        locale,
      })}
      sections={await getSidebarSections(undefined, locale)}
    >
      <div className="container mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <h1 className="mb-3 text-4xl font-semibold">{t("title")}</h1>
        <p className="mb-6 text-lg text-muted-foreground">{t("intro")}</p>
        <p className="mb-10 flex items-center gap-4 text-sm text-muted-foreground">
          <span>{t("subscribe")}</span>
          <a
            className="underline hover:text-foreground"
            href={articleFeedPath(locale, "rss")}
          >
            {t("rss")}
          </a>
          <a
            className="underline hover:text-foreground"
            href={articleFeedPath(locale, "atom")}
          >
            {t("atom")}
          </a>
        </p>

        {articles.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-5 text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          <ul className="space-y-3">
            {articles.map((article) => (
              <li key={article.slug}>
                <article className="rounded-lg border border-border p-5 hover:border-foreground/40">
                  <h2 className="text-lg font-semibold">
                    <Link
                      className="hover:underline"
                      href={articlePath(article.slug)}
                    >
                      {articleHeading(article)}
                    </Link>
                  </h2>
                  <p className="mt-1 mb-3 text-sm text-muted-foreground">
                    {article.frontmatter.description}
                  </p>
                  <ArticleMeta
                    frontmatter={article.frontmatter}
                    locale={locale}
                    showTags={false}
                  />
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
