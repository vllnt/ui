import { readFile } from "node:fs/promises";
import path from "node:path";

import { Breadcrumb, MDXContent, Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { setRequestLocale } from "next-intl/server";

import { type Locale, routing } from "@/i18n/routing";
import { getPageContent } from "@/lib/content";
import { DOCS_PAGES, getDocsPage, getDocsPath } from "@/lib/docs-pages";
import {
  breadcrumbTrailLd,
  jsonLdScriptAttributes,
  techArticleLd,
} from "@/lib/jsonld";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates, localizePathname } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export function generateStaticParams(): { locale: Locale; slug: string }[] {
  return routing.locales.flatMap((locale) =>
    DOCS_PAGES.map((page) => ({ locale, slug: page.slug })),
  );
}

const ROOT_CHANGELOG_PATH = path.join(
  process.cwd(),
  "..",
  "..",
  "CHANGELOG.md",
);
const PACKAGE_CHANGELOG_PATH = path.join(
  process.cwd(),
  "..",
  "..",
  "packages",
  "ui",
  "CHANGELOG.md",
);

async function readChangelogFile(filePath: string): Promise<string> {
  try {
    const content = await readFile(filePath, "utf8");
    return content.trim();
  } catch {
    return "";
  }
}

async function readChangelog(): Promise<string> {
  const [rootChangelog, packageChangelog] = await Promise.all([
    readChangelogFile(ROOT_CHANGELOG_PATH),
    readChangelogFile(PACKAGE_CHANGELOG_PATH),
  ]);

  return [
    rootChangelog ? `## Repository changelog\n\n${rootChangelog}` : "",
    packageChangelog ? `## Package changelog\n\n${packageChangelog}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const docsPage = getDocsPage(slug);

  if (!docsPage) {
    return {
      title: "Documentation",
    };
  }

  const { frontmatter } = await getPageContent(`docs/${docsPage.slug}`, locale);
  const og = frontmatter.og;
  const href = getDocsPath(docsPage);

  return {
    alternates: {
      canonical: canonical(href, locale),
      languages: languageAlternates(href),
    },
    description: frontmatter.description,
    openGraph: generateOGMetadata(
      {
        description: og?.description ?? frontmatter.description,
        title: og?.title ?? frontmatter.title,
        type: og?.type ?? frontmatter.type,
      },
      { locale, pathname: href },
    ),
    title: frontmatter.title,
    twitter: generateTwitterMetadata({
      description: og?.description ?? frontmatter.description,
      title: og?.title ?? frontmatter.title,
      type: og?.type ?? frontmatter.type,
    }),
  };
}

export default async function DocsSlugPage(props: Props) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);
  const docsPage = getDocsPage(slug);

  if (!docsPage) {
    notFound();
  }

  const { content, frontmatter } = await getPageContent(
    `docs/${docsPage.slug}`,
    locale,
  );
  const pageContent =
    docsPage.slug === "changelog"
      ? `${content}\n\n${await readChangelog()}`
      : content;
  const pageUrl = canonical(getDocsPath(docsPage), locale);

  return (
    <>
      <Script
        id={`docs-${docsPage.slug}-json-ld`}
        {...jsonLdScriptAttributes([
          breadcrumbTrailLd(locale, [
            { name: "Docs", path: "/docs" },
            { name: frontmatter.title, path: getDocsPath(docsPage) },
          ]),
          techArticleLd({
            description: frontmatter.description,
            title: frontmatter.title,
            url: pageUrl,
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
                { href: localizePathname("/docs", locale), label: "Docs" },
                { label: frontmatter.title },
              ]}
            />
            <h1 className="text-4xl font-semibold mb-4">{frontmatter.title}</h1>
            <p className="text-muted-foreground text-lg">
              {frontmatter.description}
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:mt-8 prose-headings:font-semibold prose-headings:text-black prose-h1:text-5xl prose-h2:text-4xl prose-h3:text-3xl prose-h4:text-2xl prose-h5:text-xl prose-h6:text-lg dark:prose-headings:text-white prose-p:leading-7 prose-blockquote:mt-6 prose-blockquote:border-l prose-blockquote:pl-6 prose-blockquote:italic prose-ul:my-6 prose-ul:ml-6 prose-ul:list-disc prose-ol:my-6 prose-ol:ml-6 prose-ol:list-decimal prose-code:relative prose-code:rounded prose-code:bg-muted prose-code:px-[0.3rem] prose-code:py-[0.3rem] prose-code:text-sm  prose-pre:my-6 prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:bg-zinc-950 prose-pre:py-4  prose-pre:text-sm prose-pre:text-white prose-pre:shadow-lg dark:prose-pre:bg-zinc-900 prose-hr:my-8 prose-hr:border-border prose-table:w-full prose-table:border-collapse prose-table:border prose-table:border-border prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-2 prose-th:text-left prose-th:font-medium prose-td:border prose-td:border-border prose-td:p-2 prose-img:rounded-lg prose-img:border prose-img:border-border prose-img:shadow-lg prose-a:font-medium prose-a:text-primary prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-primary/80 prose-strong:font-semibold prose-em:italic prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground">
              <MDXContent content={pageContent} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
