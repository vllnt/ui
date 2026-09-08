import { Breadcrumb } from "@vllnt/ui";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ComponentCard } from "@/components/component-card";
import { Footer } from "@/components/footer/footer";
import { PlatformSelector } from "@/components/platform-selector";
import { PlatformSidebar } from "@/components/platform-sidebar";
import { Link, type Locale, routing } from "@/i18n/routing";
import { getFamilyCopy } from "@/lib/family-copy";
import { getFamilyGroups } from "@/lib/family-groups";
import {
  breadcrumbTrailLd,
  collectionPageLd,
  faqPageLd,
  jsonLdScriptAttributes,
} from "@/lib/jsonld";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import {
  getPlatform,
  type PlatformQuery,
  withPlatformQuery,
} from "@/lib/platform";
import { registry } from "@/lib/registry";
import { canonical, languageAlternates, localizePathname } from "@/lib/seo";
import {
  getCategoryDescription,
  getSidebarSections,
  groupedComponents,
} from "@/lib/sidebar-sections";
import type { ComponentCategory } from "@/types/registry";

type Props = {
  readonly params: Promise<{ category: string; locale: Locale }>;
  readonly searchParams: Promise<PlatformQuery>;
};

function findFamily(category: string) {
  return groupedComponents.find((group) => group.category === category);
}

export function generateStaticParams(): {
  category: ComponentCategory;
  locale: Locale;
}[] {
  return routing.locales.flatMap((locale) =>
    groupedComponents.map((group) => ({ category: group.category, locale })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, locale } = await params;
  const group = findFamily(category);

  if (!group) {
    return {};
  }

  const pathname = `/families/${category}`;
  const copy = getFamilyCopy(group.category);
  const description = copy?.intro ?? getCategoryDescription(group.category);
  const ogTitle = `${group.label} components`;
  const lower = group.label.toLowerCase();
  const keywords = [
    `${lower} components`,
    `react ${lower} components`,
    `${lower} ui components`,
    `${lower} component library`,
    `shadcn ${lower} components`,
    `accessible ${lower} components`,
    ...group.items
      .slice(0, 6)
      .map((item) => `${item.title.toLowerCase()} component`),
  ];

  return {
    alternates: {
      canonical: canonical(pathname, locale),
      languages: languageAlternates(pathname),
    },
    description,
    keywords,
    openGraph: generateOGMetadata(
      { category: group.label, description, title: ogTitle, type: "page" },
      { locale, pathname },
    ),
    title: `${group.label} Components — VLLNT UI`,
    twitter: generateTwitterMetadata({
      category: group.label,
      description,
      title: ogTitle,
      type: "page",
    }),
  };
}

export default async function FamilyPage({ params, searchParams }: Props) {
  const [{ category, locale }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  setRequestLocale(locale);

  const group = findFamily(category);

  if (!group) {
    notFound();
  }

  const copy = getFamilyCopy(group.category);
  const description = copy?.intro ?? getCategoryDescription(group.category);
  const groups = getFamilyGroups(group.category);
  const pathname = `/families/${category}`;
  const t = await getTranslations("pages.families");
  const common = await getTranslations("common");
  const platform = getPlatform(query.platform);
  const platformsByName = new Map(
    registry.items.map((item) => [item.name, item.platforms]),
  );
  const supportsPlatform = (slug: string) =>
    platformsByName.get(slug)?.includes(platform ?? "web") ?? false;
  const visibleItems = group.items.filter((item) =>
    supportsPlatform(item.name),
  );
  const visibleGroups = groups
    ?.map((section) => ({
      ...section,
      slugs: section.slugs.filter(supportsPlatform),
    }))
    .filter((section) => section.slugs.length > 0);

  return (
    <>
      <script
        {...jsonLdScriptAttributes([
          breadcrumbTrailLd(locale, [
            { name: "Components", path: "/components" },
            { name: group.label, path: pathname },
          ]),
          collectionPageLd({
            description,
            items: group.items.map((item) => ({
              name: item.title,
              url: canonical(`/components/${item.name}`, locale),
            })),
            title: `${group.label} components`,
            url: canonical(pathname, locale),
          }),
          ...(copy && copy.faq.length > 0 ? [faqPageLd(copy.faq)] : []),
        ])}
      />
      <PlatformSidebar
        sections={await getSidebarSections(group.category, locale)}
      />
      <main className="flex-1 overflow-y-auto bg-background">
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
            <Breadcrumb
              className="mb-6 text-muted-foreground"
              items={[
                {
                  href: withPlatformQuery(
                    localizePathname("/", locale),
                    query,
                    platform,
                  ),
                  label: common("home"),
                },
                {
                  href: withPlatformQuery(
                    localizePathname("/components", locale),
                    query,
                    platform,
                  ),
                  label: common("components"),
                },
                { label: group.label },
              ]}
            />
            <p className="text-sm font-medium text-muted-foreground">
              VLLNT UI · {t("eyebrow")}
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
              {t("familyTitle", { label: group.label })}
            </h1>
            {description ? (
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
                {platform === "native"
                  ? t("nativeFamilyDescription", { label: group.label })
                  : description}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                className="inline-flex h-11 items-center gap-2 rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
                href={withPlatformQuery("/components", query, platform)}
              >
                {t("browseAll")}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                className="inline-flex h-11 items-center rounded-md border border-border px-5 text-sm font-medium hover:bg-muted"
                href={withPlatformQuery("/docs/agents", query, platform)}
              >
                {t("agentsDocs")}
              </Link>
              <span className="text-sm text-muted-foreground">
                {t("componentCount", { count: visibleItems.length })}
              </span>
            </div>
            <PlatformSelector className="mt-6 flex min-h-11 w-fit max-w-full items-center gap-1 overflow-x-auto rounded-md border border-border p-1" />
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
            {visibleItems.length === 0 ? (
              <p className="rounded-lg border border-dashed bg-card px-6 py-12 text-center text-muted-foreground">
                {t("noPlatformResults")}
              </p>
            ) : visibleGroups ? (
              <div className="space-y-14">
                {visibleGroups.map((section) => (
                  <div key={section.heading}>
                    <h2 className="text-2xl font-semibold">
                      {section.heading}
                    </h2>
                    <p className="mt-2 max-w-2xl text-muted-foreground">
                      {section.blurb}
                    </p>
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {section.slugs.map((slug) => (
                        <ComponentCard
                          key={slug}
                          locale={locale}
                          platform={platform}
                          query={query}
                          slug={slug}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleItems.map((component) => (
                  <ComponentCard
                    key={component.name}
                    locale={locale}
                    platform={platform}
                    query={query}
                    slug={component.name}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
            <p className="text-sm font-medium text-muted-foreground">
              {t("agentEyebrow")}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{t("agentTitle")}</h2>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {t("agentDescription")}
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <a
                className="rounded-lg border border-border p-5 hover:border-foreground/40"
                href="/llms.txt"
                rel="noreferrer"
                target="_blank"
              >
                <p className="font-mono text-sm">/llms.txt</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {t("llmsDescription")}
                </p>
              </a>
              <a
                className="rounded-lg border border-border p-5 hover:border-foreground/40"
                href="/llms-full.txt"
                rel="noreferrer"
                target="_blank"
              >
                <p className="font-mono text-sm">/llms-full.txt</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {t("llmsFullDescription")}
                </p>
              </a>
              <Link
                className="rounded-lg border border-border p-5 hover:border-foreground/40"
                href={withPlatformQuery("/docs/agents", query, platform)}
              >
                <p className="font-mono text-sm">{"/r/<name>.json"}</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {t("registryJsonDescription")}
                </p>
              </Link>
            </div>
          </div>
        </section>

        {copy && copy.faq.length > 0 ? (
          <section>
            <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
              <h2 className="text-2xl font-semibold">{t("faqTitle")}</h2>
              <dl className="mt-8 space-y-8">
                {copy.faq.map((item) => (
                  <div className="max-w-3xl" key={item.question}>
                    <dt className="font-medium">{item.question}</dt>
                    <dd className="mt-2 text-muted-foreground">
                      {item.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        ) : null}

        <Footer />
      </main>
    </>
  );
}
