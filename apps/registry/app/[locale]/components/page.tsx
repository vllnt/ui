import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ComponentCard } from "@/components/component-card";
import { Link, type Locale } from "@/i18n/routing";
import { getPageContent } from "@/lib/content";
import {
  breadcrumbTrailLd,
  collectionPageLd,
  jsonLdScriptAttributes,
} from "@/lib/jsonld";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import {
  type ComponentPlatform,
  componentPlatformSchema,
  registry,
} from "@/lib/registry";
import { canonical, languageAlternates } from "@/lib/seo";
import {
  familyPath,
  getSidebarSections,
  groupedComponents,
} from "@/lib/sidebar-sections";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
  readonly searchParams: Promise<{ platform?: string }>;
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

export default async function ComponentsPage({ params, searchParams }: Props) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations("pages.components");
  const common = await getTranslations("common");
  const parsedPlatform = componentPlatformSchema.safeParse(query.platform);
  const selectedPlatform = parsedPlatform.success
    ? parsedPlatform.data
    : undefined;
  const platformsByName = new Map(
    registry.items.map((item) => [item.name, item.platforms]),
  );
  const visibleGroups = groupedComponents
    .map((group) => ({
      ...group,
      items: selectedPlatform
        ? group.items.filter((item) =>
            platformsByName.get(item.name)?.includes(selectedPlatform),
          )
        : group.items,
    }))
    .filter((group) => group.items.length > 0);
  const visibleCount = visibleGroups.reduce(
    (count, group) => count + group.items.length,
    0,
  );
  const filters: readonly {
    href: string;
    label: string;
    platform?: ComponentPlatform;
  }[] = [
    { href: "/components", label: t("platformAll") },
    {
      href: "/components?platform=web",
      label: t("platformWeb"),
      platform: "web",
    },
    {
      href: "/components?platform=native",
      label: t("platformNative"),
      platform: "native",
    },
  ];

  return (
    <>
      <script
        {...jsonLdScriptAttributes([
          breadcrumbTrailLd(locale, [
            { name: "Components", path: "/components" },
          ]),
          collectionPageLd({
            description: t("description", { count: visibleCount }),
            items: visibleGroups.flatMap((group) =>
              group.items.map((item) => ({
                name: item.title,
                url: canonical(`/components/${item.name}`, locale),
              })),
            ),
            title: t("title"),
            url: canonical("/components", locale),
          }),
        ])}
      />
      <Sidebar sections={await getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-4 py-16 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-semibold mb-4">{t("title")}</h1>
            <p className="text-muted-foreground text-lg">
              {t("description", { count: visibleCount })}
            </p>
            <nav
              aria-label={t("platformFilterLabel")}
              className="mt-6 flex flex-wrap items-center gap-2"
            >
              {filters.map((filter) => {
                const selected = filter.platform === selectedPlatform;
                return (
                  <Link
                    aria-current={selected ? "page" : undefined}
                    className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-muted aria-[current=page]:bg-foreground aria-[current=page]:text-background"
                    href={filter.href}
                    key={filter.href}
                  >
                    {filter.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {visibleGroups.map((group) => (
            <section className="mb-12" key={group.category}>
              <h2 className="text-2xl font-semibold mb-6">
                <Link
                  className="hover:underline"
                  href={familyPath(group.category)}
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

          {visibleGroups.length === 0 ? (
            <p className="rounded-lg border border-dashed bg-card px-6 py-12 text-center text-muted-foreground">
              {t("noPlatformResults")}
            </p>
          ) : null}

          <section className="mt-4 flex flex-col items-center gap-3 rounded-lg border border-dashed bg-card px-6 py-12 text-center">
            <h2 className="text-xl font-semibold">{t("ctaTitle")}</h2>
            <p className="text-muted-foreground max-w-md">
              {t("ctaDescription")}
            </p>
            <Link
              className="mt-2 inline-flex h-10 items-center rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
              href="/request-component"
            >
              {common("requestComponent")}
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
