import { readFile } from "node:fs/promises";
import path from "node:path";

import { Breadcrumb, MDXContent } from "@vllnt/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PlatformSidebar } from "@/components/platform-sidebar";
import { type Locale, routing } from "@/i18n/routing";
import { getPageContent } from "@/lib/content";
import { DOCS_PAGES, getDocsPage, getDocsPath } from "@/lib/docs-pages";
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
  const contentWithoutDuplicateTitle = stripLeadingMarkdownHeading(content);
  const pageContent =
    docsPage.slug === "changelog"
      ? `${contentWithoutDuplicateTitle}\n\n${await readChangelog()}`
      : contentWithoutDuplicateTitle;
  const pageUrl = canonical(getDocsPath(docsPage), locale);
  const c = await getTranslations("common");

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
      <PlatformSidebar sections={await getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-4 py-16 lg:px-8">
          <div className="mb-8">
            <Breadcrumb
              className="mb-4 text-muted-foreground"
              items={[
                { href: localizePathname("/", locale), label: c("home") },
                { href: localizePathname("/docs", locale), label: c("docs") },
                { label: frontmatter.title },
              ]}
            />
            <h1 className="text-4xl font-semibold mb-4">{frontmatter.title}</h1>
            <p className="text-muted-foreground text-lg">
              {frontmatter.description}
            </p>
          </div>

          <MDXContent content={pageContent} />
        </div>
      </main>
    </>
  );
}
