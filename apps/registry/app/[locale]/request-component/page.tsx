import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

import { RequestComponentForm } from "./request-component-form";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "pages.requestComponent",
  });
  const ogParameters = {
    description: t("metaDescription"),
    title: t("title"),
    type: "page" as const,
  };

  return {
    alternates: {
      canonical: canonical("/request-component", locale),
      languages: languageAlternates("/request-component"),
    },
    description: ogParameters.description,
    openGraph: generateOGMetadata(ogParameters, {
      locale,
      pathname: "/request-component",
    }),
    robots: { follow: true, index: false },
    title: `${t("title")} · VLLNT UI`,
    twitter: generateTwitterMetadata(ogParameters),
  };
}

export default async function RequestComponentPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.requestComponent");

  return (
    <>
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto max-w-2xl px-4 py-16 lg:px-8">
          <h1 className="text-4xl font-semibold mb-3">{t("title")}</h1>
          <p className="text-muted-foreground text-lg mb-8">
            {t("description")}
          </p>
          <RequestComponentForm />
        </div>
      </main>
    </>
  );
}
