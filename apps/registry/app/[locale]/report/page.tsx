import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";

import type { Locale } from "@/i18n/routing";
import { canonical, languageAlternates } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

import { ReportBugForm } from "./report-bug-form";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { resolveLocaleParams } from "@/lib/locale";

type LocaleParams = {
  readonly params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params;

  return {
    alternates: {
      canonical: canonical("/report", locale),
      languages: languageAlternates("/report"),
    },
    description:
      "Report a bug in VLLNT UI. The form opens a prefilled GitHub issue — no backend.",
    openGraph: generateOGMetadata(
      { description: "Report a bug in VLLNT UI. The form opens a prefilled GitHub issue — no backend.", title: "Report a bug · VLLNT UI" },
      { locale, pathname: "/report" },
    ),
    robots: { follow: true, index: false },
    title: "Report a bug · VLLNT UI",
    twitter: generateTwitterMetadata({
      description: "Report a bug in VLLNT UI. The form opens a prefilled GitHub issue — no backend.",
      title: "Report a bug · VLLNT UI",
    }),
  };
}

type SearchParameters = {
  readonly component?: string;
};

export default async function ReportBugPage({
  params,
  searchParams,
}: LocaleParams & {
  searchParams: Promise<SearchParameters>;
}) {
  const { locale } = await resolveLocaleParams(params);
  const { component } = await searchParams;

  return (
    <>
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto max-w-2xl px-4 py-16 lg:px-8">
          <h1 className="text-4xl font-semibold mb-3">Report a bug</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Found something broken? Fill out the fields and we&rsquo;ll open a
            prefilled GitHub issue with the right labels and template.
          </p>
          <ReportBugForm initialComponent={component ?? ""} />
        </div>
      </main>
    </>
  );
}
