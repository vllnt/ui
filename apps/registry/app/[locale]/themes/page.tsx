import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { ThemeEditor } from "@/components/theme-editor";
import type { Locale } from "@/i18n/routing";
import { breadcrumbTrailLd, jsonLdScriptAttributes } from "@/lib/jsonld";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

const codeChunk = (chunks: ReactNode) => (
  <code className="rounded bg-muted px-1.5 py-0.5 text-sm">{chunks}</code>
);

export const dynamic = "force-static";
export const revalidate = 86_400;

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.themes" });
  const title = t("metaTitle");
  const description = t("metaDescription");

  return {
    alternates: {
      canonical: canonical("/themes", locale),
      languages: languageAlternates("/themes"),
    },
    description,
    openGraph: generateOGMetadata(
      { description, title, type: "page" },
      { locale, pathname: "/themes" },
    ),
    title,
    twitter: generateTwitterMetadata({
      description,
      title,
      type: "page",
    }),
  };
}

export default async function ThemesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pages.themes" });
  const common = await getTranslations({ locale, namespace: "common" });

  return (
    <>
      <script
        {...jsonLdScriptAttributes(
          breadcrumbTrailLd(
            locale,
            [{ name: t("metaTitle"), path: "/themes" }],
            common("home"),
          ),
        )}
      />
      <Sidebar sections={await getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="mb-8 border-b border-border pb-8">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              {t("eyebrow")}
            </p>
            <h1 className="text-4xl font-semibold">{t("title")}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
              {t.rich("description", { code: codeChunk })}
            </p>
          </div>
          <ThemeEditor />
        </div>
      </main>
    </>
  );
}
