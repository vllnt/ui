import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { canonical, languageAlternates } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

import { ReportBugForm } from "./report-bug-form";

type SearchParameters = {
  readonly component?: string;
};

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<SearchParameters>;
};

export async function generateMetadata({
  params,
}: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.report" });

  return {
    alternates: {
      canonical: canonical("/report", locale),
      languages: languageAlternates("/report"),
    },
    description: t("metaDescription"),
    robots: { follow: true, index: false },
    title: `${t("title")} - VLLNT UI`,
  };
}

export default async function ReportBugPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { component } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pages.report" });

  return (
    <>
      <Sidebar sections={getSidebarSections(undefined, locale)} />
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
