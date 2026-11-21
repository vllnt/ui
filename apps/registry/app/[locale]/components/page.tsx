import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ComponentCard } from "@/components/component-card";
import { PageShell } from "@/components/page-shell";
import { PlatformSelector } from "@/components/platform-selector";
import { Link, type Locale } from "@/i18n/routing";
import { getPageContent } from "@/lib/content";
import { breadcrumbTrailLd, collectionPageLd } from "@/lib/jsonld";
import { frontmatterPageMetadata, pageMetadata } from "@/lib/og";
import {
  canonicalPlatformPath,
  getPlatform,
  variantQuery,
  withPlatformQuery,
} from "@/lib/platform";
import { registry } from "@/lib/registry";
import { canonical } from "@/lib/seo";
import {
  familyPath,
  getSidebarSections,
  groupedComponents,
} from "@/lib/sidebar-sections";

type Props = {
  readonly params: Promise<{ locale: Locale; platform?: string }>;
};

export const revalidate = 86_400;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, platform } = await params;
  const [{ frontmatter }, t] = await Promise.all([
    getPageContent("components", locale),
    getTranslations({ locale, namespace: "pages.components" }),
  ]);

  const selectedPlatform = getPlatform(platform, "all");
  const pathname = canonicalPlatformPath("/components", selectedPlatform);

  if (selectedPlatform !== "native") {
    return frontmatterPageMetadata(frontmatter, { locale, pathname });
  }

  return pageMetadata({
    locale,
    og: {
      description: t("nativeMetaDescription"),
      title: t("nativeMetaTitle"),
      type: frontmatter.og?.type ?? frontmatter.type,
    },
    pathname,
  });
}

export default async function ComponentsPage({ params }: Props) {
  const { locale, platform } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.components");
  const common = await getTranslations("common");
  const selectedPlatform = getPlatform(platform, "all");
  const query = variantQuery(selectedPlatform);
  const platformsByName = new Map(
    registry.items.map((item) => [item.name, new Set(item.platforms)]),
  );
  const visibleGroups = groupedComponents
    .map((group) => ({
      ...group,
      items: selectedPlatform
        ? group.items.filter((item) =>
            platformsByName.get(item.name)?.has(selectedPlatform),
          )
        : group.items,
    }))
    .filter((group) => group.items.length > 0);
  const visibleCount = visibleGroups.reduce(
    (count, group) => count + group.items.length,
    0,
  );
  const nativeFilter = selectedPlatform === "native";
  const catalogPathname = canonicalPlatformPath(
    "/components",
    selectedPlatform,
  );
  const catalogDescription = t("description", { count: visibleCount });

  return (
    <PageShell
      jsonLd={[
        breadcrumbTrailLd(locale, [
          { name: t("title"), path: catalogPathname },
        ]),
        collectionPageLd({
          description: nativeFilter
            ? t("nativeMetaDescription")
            : catalogDescription,
          items: visibleGroups.flatMap((group) =>
            group.items.map((item) => ({
              name: item.title,
              url: canonical(`/components/${item.name}`, locale),
            })),
          ),
          title: nativeFilter ? t("nativeMetaTitle") : t("title"),
          url: canonical(catalogPathname, locale),
        }),
      ]}
      platform={selectedPlatform}
      searchable={platform === undefined}
      sections={await getSidebarSections(undefined, locale)}
    >
      <div className="container mx-auto px-4 py-16 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-semibold mb-4">{t("title")}</h1>
          <p className="text-muted-foreground text-lg">{catalogDescription}</p>
          <PlatformSelector
            className="mt-6 flex min-h-11 w-fit max-w-full items-center gap-1 overflow-x-auto rounded-md border border-border p-1"
            includeAll
            pathname="/components"
            platform={selectedPlatform}
          />
        </div>

        {visibleGroups.map((group) => (
          <section className="mb-12" key={group.category}>
            <h2 className="text-2xl font-semibold mb-6">
              <Link
                className="hover:underline"
                href={withPlatformQuery(
                  familyPath(group.category),
                  query,
                  selectedPlatform,
                )}
              >
                {group.label}
              </Link>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map((component) => (
                <ComponentCard
                  key={component.name}
                  locale={locale}
                  platform={selectedPlatform}
                  query={query}
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
            href={withPlatformQuery(
              "/request-component",
              query,
              selectedPlatform,
            )}
          >
            {common("requestComponent")}
          </Link>
        </section>
      </div>
    </PageShell>
  );
}
