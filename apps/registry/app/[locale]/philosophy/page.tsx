import { MDXContent } from "@vllnt/ui";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PlatformSidebar } from "@/components/platform-sidebar";
import type { Locale } from "@/i18n/routing";
import { getPageContent } from "@/lib/content";
import {
  breadcrumbTrailLd,
  jsonLdScriptAttributes,
  techArticleLd,
} from "@/lib/jsonld";
import { stripLeadingMarkdownHeading } from "@/lib/markdown";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { frontmatter } = await getPageContent("philosophy", locale);
  const og = frontmatter.og;

  return {
    alternates: {
      canonical: canonical("/philosophy", locale),
      languages: languageAlternates("/philosophy"),
    },
    description: frontmatter.description,
    openGraph: generateOGMetadata(
      {
        description: og?.description ?? frontmatter.description,
        title: og?.title ?? frontmatter.title,
        type: og?.type ?? frontmatter.type,
      },
      { locale, pathname: "/philosophy" },
    ),
    title: frontmatter.title,
    twitter: generateTwitterMetadata({
      description: og?.description ?? frontmatter.description,
      title: og?.title ?? frontmatter.title,
      type: og?.type ?? frontmatter.type,
    }),
  };
}

export default async function PhilosophyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { content, frontmatter } = await getPageContent("philosophy", locale);
  const t = await getTranslations("pages.philosophy");
  const common = await getTranslations("common");

  return (
    <>
      <script
        {...jsonLdScriptAttributes([
          breadcrumbTrailLd(
            locale,
            [{ name: frontmatter.title, path: "/philosophy" }],
            common("home"),
          ),
          techArticleLd({
            description: frontmatter.description,
            inLanguage: locale,
            title: frontmatter.title,
            url: canonical("/philosophy", locale),
          }),
        ])}
      />
      <PlatformSidebar sections={await getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-4 py-16 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-semibold mb-4">{t("title")}</h1>
            <p className="text-muted-foreground text-lg">{t("description")}</p>
          </div>

          <MDXContent content={stripLeadingMarkdownHeading(content)} />
        </div>
      </main>
    </>
  );
}
