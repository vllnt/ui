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
import { frontmatterPageMetadata } from "@/lib/og";
import { canonical } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { frontmatter } = await getPageContent("philosophy", locale);

  return frontmatterPageMetadata(frontmatter, {
    locale,
    pathname: "/philosophy",
  });
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
