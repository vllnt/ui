import { Breadcrumb, MDXContent } from "@vllnt/ui";
import type { Metadata } from "next";
import Script from "next/script";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PlatformSidebar } from "@/components/platform-sidebar";
import { Link, type Locale } from "@/i18n/routing";
import { getPageContent } from "@/lib/content";
import { DOCS_PAGES, getDocsPath } from "@/lib/docs-pages";
import {
  breadcrumbTrailLd,
  jsonLdScriptAttributes,
  techArticleLd,
} from "@/lib/jsonld";
import { stripLeadingMarkdownHeading } from "@/lib/markdown";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates, localizePathname } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { frontmatter } = await getPageContent("docs", locale);
  const og = frontmatter.og;

  return {
    alternates: {
      canonical: canonical("/docs", locale),
      languages: languageAlternates("/docs"),
    },
    description: frontmatter.description,
    openGraph: generateOGMetadata(
      {
        description: og?.description ?? frontmatter.description,
        title: og?.title ?? frontmatter.title,
        type: og?.type ?? frontmatter.type,
      },
      { locale, pathname: "/docs" },
    ),
    title: frontmatter.title,
    twitter: generateTwitterMetadata({
      description: og?.description ?? frontmatter.description,
      title: og?.title ?? frontmatter.title,
      type: og?.type ?? frontmatter.type,
    }),
  };
}

export default async function DocumentationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { content } = await getPageContent("docs", locale);
  const t = await getTranslations("pages.docs");
  const c = await getTranslations("common");
  // Localize each doc card from the page's own MDX frontmatter (en/fr).
  const documentLinks = await Promise.all(
    DOCS_PAGES.map(async (page) => {
      const { frontmatter } = await getPageContent(`docs/${page.slug}`, locale);
      return {
        description: frontmatter.description,
        href: getDocsPath(page),
        slug: page.slug,
        title: frontmatter.title,
      };
    }),
  );

  return (
    <>
      <Script
        id="docs-json-ld"
        {...jsonLdScriptAttributes([
          breadcrumbTrailLd(locale, [{ name: "Docs", path: "/docs" }]),
          techArticleLd({
            description:
              "Learn how to use VLLNT UI components in your projects.",
            title: "Documentation",
            url: canonical("/docs", locale),
          }),
        ])}
      />
      <PlatformSidebar sections={await getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-4 py-16 lg:px-8">
          <div className="mb-8">
            <Breadcrumb
              className="mb-4 text-muted-foreground"
              items={[
                { href: localizePathname("/", locale), label: c("home") },
                { label: c("docs") },
              ]}
            />
            <h1 className="text-4xl font-semibold mb-4">{t("title")}</h1>
            <p className="text-muted-foreground text-lg">{t("description")}</p>
          </div>

          <nav aria-label={t("nav")} className="mb-12">
            <ul className="grid gap-4 md:grid-cols-2">
              {documentLinks.map((page) => (
                <li
                  className="rounded-lg border border-border bg-card p-4"
                  key={page.slug}
                >
                  <Link
                    className="font-medium text-foreground underline underline-offset-4"
                    href={page.href}
                  >
                    {page.title}
                  </Link>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {page.description}
                  </p>
                </li>
              ))}
            </ul>
          </nav>

          <MDXContent content={stripLeadingMarkdownHeading(content)} />
        </div>
      </main>
    </>
  );
}
