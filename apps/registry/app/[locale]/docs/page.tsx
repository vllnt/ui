import { Breadcrumb, MDXContent, Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { getPageContent } from "@/lib/content";
import { DOCS_PAGES, getDocsPath } from "@/lib/docs-pages";
import {
  breadcrumbLd,
  jsonLdScriptAttributes,
  techArticleLd,
} from "@/lib/jsonld";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates, localizePathname } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.com";

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

  return (
    <>
      <Script
        id="docs-json-ld"
        {...jsonLdScriptAttributes([
          breadcrumbLd([
            { name: "Home", url: SITE_URL },
            { name: "Docs", url: `${SITE_URL}/docs` },
          ]),
          techArticleLd({
            description:
              "Learn how to use VLLNT UI components in your projects.",
            title: "Documentation",
            url: `${SITE_URL}/docs`,
          }),
        ])}
      />
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-4 py-16 lg:px-8">
          <div className="mb-8">
            <Breadcrumb
              className="mb-4 text-muted-foreground"
              items={[
                { href: localizePathname("/", locale), label: "Home" },
                { label: "Docs" },
              ]}
            />
            <h1 className="text-4xl font-semibold mb-4">Documentation</h1>
            <p className="text-muted-foreground text-lg">
              Learn how to use VLLNT UI components in your projects.
            </p>
          </div>

          <nav aria-label="Documentation pages" className="mb-12">
            <ul className="grid gap-4 md:grid-cols-2">
              {DOCS_PAGES.map((page) => (
                <li
                  className="rounded-lg border border-border bg-card p-4"
                  key={page.slug}
                >
                  <Link
                    className="font-medium text-foreground underline underline-offset-4"
                    href={localizePathname(getDocsPath(page), locale)}
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

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:mt-8 prose-headings:font-semibold prose-headings:text-black prose-h1:text-5xl prose-h2:text-4xl prose-h3:text-3xl prose-h4:text-2xl prose-h5:text-xl prose-h6:text-lg dark:prose-headings:text-white prose-p:leading-7 prose-blockquote:mt-6 prose-blockquote:border-l prose-blockquote:pl-6 prose-blockquote:italic prose-ul:my-6 prose-ul:ml-6 prose-ul:list-disc prose-ol:my-6 prose-ol:ml-6 prose-ol:list-decimal prose-code:relative prose-code:rounded prose-code:bg-muted prose-code:px-[0.3rem] prose-code:py-[0.3rem] prose-code:text-sm  prose-pre:my-6 prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:bg-zinc-950 prose-pre:py-4  prose-pre:text-sm prose-pre:text-white prose-pre:shadow-lg dark:prose-pre:bg-zinc-900 prose-hr:my-8 prose-hr:border-border prose-table:w-full prose-table:border-collapse prose-table:border prose-table:border-border prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-2 prose-th:text-left prose-th:font-medium prose-td:border prose-td:border-border prose-td:p-2 prose-img:rounded-lg prose-img:border prose-img:border-border prose-img:shadow-lg prose-a:font-medium prose-a:text-primary prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-primary/80 prose-strong:font-semibold prose-em:italic prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground">
              <MDXContent content={content} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
