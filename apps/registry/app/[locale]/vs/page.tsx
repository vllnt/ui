import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link, type Locale } from "@/i18n/routing";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.vs.index" });
  const ogParameters = {
    description: t("metaDescription"),
    title: t("metaTitle"),
    type: "page" as const,
  };

  return {
    alternates: {
      canonical: canonical("/vs", locale),
      languages: languageAlternates("/vs"),
    },
    description: ogParameters.description,
    openGraph: generateOGMetadata(ogParameters, { locale, pathname: "/vs" }),
    title: ogParameters.title,
    twitter: generateTwitterMetadata(ogParameters),
  };
}

const COMPARISONS: readonly {
  readonly available: boolean;
  readonly name: string;
  readonly slug: string;
  readonly taglineKey: string;
}[] = [
  {
    available: true,
    name: "shadcn/ui",
    slug: "shadcn",
    taglineKey: "shadcn",
  },
  {
    available: false,
    name: "Radix UI",
    slug: "radix",
    taglineKey: "radix",
  },
  {
    available: false,
    name: "HeadlessUI",
    slug: "headless-ui",
    taglineKey: "headlessUi",
  },
  {
    available: false,
    name: "NextUI",
    slug: "nextui",
    taglineKey: "nextui",
  },
];

export default async function VsIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.vs.index");

  return (
    <>
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto max-w-3xl px-4 py-16 lg:px-8">
          <h1 className="text-4xl font-semibold mb-3">{t("title")}</h1>
          <p className="text-muted-foreground text-lg mb-10">{t("intro")}</p>

          <ul className="space-y-3">
            {COMPARISONS.map((entry) =>
              entry.available ? (
                <li key={entry.slug}>
                  <Link
                    className="block rounded-lg border border-border p-5 hover:border-foreground/40"
                    href={`/vs/${entry.slug}`}
                  >
                    <p className="text-lg font-semibold">
                      {t("cardTitle", { name: entry.name })}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t(`taglines.${entry.taglineKey}`)}
                    </p>
                  </Link>
                </li>
              ) : (
                <li
                  className="rounded-lg border border-dashed border-border p-5 opacity-60"
                  key={entry.slug}
                >
                  <p className="text-lg font-semibold">
                    {t("cardTitle", { name: entry.name })}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(`taglines.${entry.taglineKey}`)}. {t("comingSoon")}
                  </p>
                </li>
              ),
            )}
          </ul>
        </div>
      </main>
    </>
  );
}
