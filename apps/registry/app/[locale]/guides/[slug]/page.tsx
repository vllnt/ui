import { MDXContent } from "@vllnt/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link, type Locale, routing } from "@/i18n/routing";
import { getGuideContent, getGuideSlugs } from "@/lib/content-routes";
import { jsonLdScriptAttributes, techArticleLd } from "@/lib/jsonld";
import { canonical, languageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateStaticParams() {
  const slugs = await getGuideSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const guide = await getGuideContent(slug, locale);
  if (!guide) notFound();
  return {
    alternates: {
      canonical: canonical(`/guides/${slug}`, locale),
      languages: languageAlternates(`/guides/${slug}`),
    },
    description: guide.frontmatter.description,
    title: guide.frontmatter.title,
  };
}

export default async function GuidePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const guide = await getGuideContent(slug, locale);
  if (!guide) notFound();
  const t = await getTranslations("guides");
  return (
    <main className="flex-1 overflow-y-auto bg-background">
      <Script
        id={`guide-${slug}-json-ld`}
        {...jsonLdScriptAttributes(
          techArticleLd({
            description: guide.frontmatter.description,
            inLanguage: locale,
            title: guide.frontmatter.title,
            url: canonical(`/guides/${slug}`, locale),
          }),
        )}
      />
      <article className="container mx-auto max-w-3xl px-4 py-16">
        <Link
          className="text-primary underline underline-offset-4"
          href="/guides"
        >
          {t("title")}
        </Link>
        <h1 className="mb-4 mt-8 text-4xl font-semibold">
          {guide.frontmatter.title}
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          {guide.frontmatter.description}
        </p>
        <MDXContent components={{ a: Link }} content={guide.content} />
      </article>
    </main>
  );
}
