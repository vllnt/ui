import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ComponentCard } from "@/components/component-card";
import type { Locale } from "@/i18n/routing";
import { getPageContent } from "@/lib/content";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates, localizePathname } from "@/lib/seo";
import {
  components,
  familyPath,
  getSidebarSections,
  groupedComponents,
} from "@/lib/sidebar-sections";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { frontmatter } = await getPageContent("components", locale);
  const og = frontmatter.og;

  return {
    alternates: {
      canonical: canonical("/components", locale),
      languages: languageAlternates("/components"),
    },
    description: frontmatter.description,
    openGraph: generateOGMetadata(
      {
        description: og?.description ?? frontmatter.description,
        title: og?.title ?? frontmatter.title,
        type: og?.type ?? frontmatter.type,
      },
      { locale, pathname: "/components" },
    ),
    title: frontmatter.title,
    twitter: generateTwitterMetadata({
      description: og?.description ?? frontmatter.description,
      title: og?.title ?? frontmatter.title,
      type: og?.type ?? frontmatter.type,
    }),
  };
}

export default async function ComponentsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.components");
  const common = await getTranslations("common");

  return (
    <>
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-4 py-16 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-semibold mb-4">{t("title")}</h1>
            <p className="text-muted-foreground text-lg">
              {t("description", { count: components.length })}
            </p>
          </div>

          {groupedComponents.map((group) => (
            <section className="mb-12" key={group.category}>
              <h2 className="text-2xl font-semibold mb-6">
                <Link
                  className="hover:underline"
                  href={localizePathname(familyPath(group.category), locale)}
                >
                  {group.label}
                </Link>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map((component) => (
                  <ComponentCard
                    key={component.name}
                    locale={locale}
                    slug={component.name}
                  />
                ))}
              </div>
            </section>
          ))}

          <section className="mt-4 flex flex-col items-center gap-3 rounded-lg border border-dashed bg-card px-6 py-12 text-center">
            <h2 className="text-xl font-semibold">{t("ctaTitle")}</h2>
            <p className="text-muted-foreground max-w-md">
              {t("ctaDescription")}
            </p>
            <Link
              className="mt-2 inline-flex h-10 items-center rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
              href={localizePathname("/request-component", locale)}
            >
              {common("requestComponent")}
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
