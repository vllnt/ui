import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

import { ReportBugForm } from "./report-bug-form";

type LocaleParameters = {
  readonly params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({
  params,
}: LocaleParameters): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.report" });
  const ogParameters = {
    description: t("metaDescription"),
    title: t("title"),
    type: "page" as const,
  };

  return {
    alternates: {
      canonical: canonical("/report", locale),
      languages: languageAlternates("/report"),
    },
    description: ogParameters.description,
    openGraph: generateOGMetadata(ogParameters, {
      locale,
      pathname: "/report",
    }),
    robots: { follow: true, index: false },
    title: `${t("title")} · VLLNT UI`,
    twitter: generateTwitterMetadata(ogParameters),
  };
}

type SearchParameters = {
  readonly component?: string;
};

export default async function ReportBugPage({
  params,
  searchParams,
}: LocaleParameters & {
  searchParams: Promise<SearchParameters>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { component } = await searchParams;
  const t = await getTranslations("pages.report");

  return (
    <>
      <Sidebar sections={await getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto max-w-2xl px-4 py-16 lg:px-8">
          <h1 className="text-4xl font-semibold mb-3">{t("title")}</h1>
          <p className="text-muted-foreground text-lg mb-8">
            {t("description")}
          </p>
          <ReportBugForm initialComponent={component ?? ""} />
        </div>
      </main>
    </>
  );
}
