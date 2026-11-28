import { Breadcrumb, MDXContent } from "@vllnt/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ArticleMeta } from "@/components/article-meta";
import { ComponentCard } from "@/components/component-card";
import { PageShell } from "@/components/page-shell";
import type { Locale } from "@/i18n/routing";
import { articleMetadata, articleStructuredData } from "@/lib/article-seo";
import {
  articleBody,
  articleHeading,
  articleLocales,
  getArticle,
  getPublishedArticles,
} from "@/lib/articles";
import { localizePathname } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

type Props = {
  readonly params: Promise<{ locale: Locale; slug: string }>;
};

/**
 * The build generates the published articles. A draft, an unknown slug or a
 * locale without a file gets a 404 that no cache stores.
 */
export const dynamicParams = false;

export async function generateStaticParams(): Promise<
  { locale: Locale; slug: string }[]
> {
  const articles = await getPublishedArticles();

  return articles.map(({ locale, slug }) => ({ locale, slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticle(slug, locale);
  if (!article) return {};

  const published = await getPublishedArticles();

  return articleMetadata(article, articleLocales(published, slug));
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const article = await getArticle(slug, locale);
  if (!article) notFound();

  const [t, common] = await Promise.all([
    getTranslations("pages.articles"),
    getTranslations("common"),
  ]);
  const heading = articleHeading(article);
  const { components = [], description } = article.frontmatter;

  return (
    <PageShell
      jsonLd={articleStructuredData({
        article,
        articlesName: t("title"),
        homeName: common("home"),
      })}
      sections={await getSidebarSections(undefined, locale)}
    >
      <div className="container mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <header className="mb-10">
          <Breadcrumb
            className="mb-4 text-muted-foreground"
            items={[
              { href: localizePathname("/", locale), label: common("home") },
              {
                href: localizePathname("/articles", locale),
                label: t("title"),
              },
              { label: heading },
            ]}
          />
          <h1 className="mb-4 text-4xl font-semibold">{heading}</h1>
          <p className="mb-6 text-lg text-muted-foreground">{description}</p>
          <ArticleMeta frontmatter={article.frontmatter} locale={locale} />
        </header>

        <MDXContent content={articleBody(article)} />

        {components.length > 0 ? (
          <section className="mt-14">
            <h2 className="mb-6 text-2xl font-semibold">
              {t("relatedComponents")}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {components.map((name) => (
                <ComponentCard key={name} locale={locale} slug={name} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </PageShell>
  );
}
