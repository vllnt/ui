import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PlatformSidebar } from "@/components/platform-sidebar";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/og";
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

  return pageMetadata({
    locale,
    og: { description: t("metaDescription"), title: t("title"), type: "page" },
    pathname: "/request-component",
    robots: { follow: true, index: false },
    title: `${t("title")} · VLLNT UI`,
  });
}

export default async function RequestComponentPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.requestComponent");

  return (
    <>
      <PlatformSidebar sections={await getSidebarSections(undefined, locale)} />
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
