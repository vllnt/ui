import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ComponentCard } from "@/components/component-card";
import { PlatformSelector } from "@/components/platform-selector";
import { PlatformSidebar } from "@/components/platform-sidebar";
import { Link, type Locale } from "@/i18n/routing";
import { getPageContent } from "@/lib/content";
import {
  breadcrumbTrailLd,
  collectionPageLd,
  jsonLdScriptAttributes,
} from "@/lib/jsonld";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import {
  getPlatform,
  type PlatformQuery,
  withPlatformQuery,
} from "@/lib/platform";
import { componentPlatformSchema, registry } from "@/lib/registry";
import { canonical, languageAlternates } from "@/lib/seo";
import {
  familyPath,
  getSidebarSections,
  groupedComponents,
} from "@/lib/sidebar-sections";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
  readonly searchParams: Promise<PlatformQuery>;
};

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const { frontmatter } = await getPageContent("components", locale);
  const og = frontmatter.og;
  const nativeFilter = getPlatform(query.platform, "all") === "native";
  const pathname = nativeFilter ? "/components?platform=native" : "/components";
  const description = nativeFilter
    ? (await getTranslations({ locale, namespace: "pages.components" }))(
        "nativeFilterDescription",
      )
    : frontmatter.description;
  const socialDescription = nativeFilter
    ? description
    : (og?.description ?? description);

  return {
    alternates: {
      canonical: canonical(pathname, locale),
      languages: languageAlternates(pathname),
    },
    description,
    openGraph: generateOGMetadata(
      {
        description: socialDescription,
        title: og?.title ?? frontmatter.title,
        type: og?.type ?? frontmatter.type,
      },
      { locale, pathname },
    ),
    title: frontmatter.title,
    twitter: generateTwitterMetadata({
      description: socialDescription,
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
  const nativeFilter = selectedPlatform === "native";
  const catalogPathname = nativeFilter
    ? "/components?platform=native"
    : "/components";
  const catalogDescription = nativeFilter
    ? t("nativeFilterDescription")
    : t("description", { count: visibleCount });

  return (
    <>
      <script
        {...jsonLdScriptAttributes([
          breadcrumbTrailLd(locale, [
            { name: t("title"), path: catalogPathname },
          ]),
          collectionPageLd({
            description: catalogDescription,
            items: visibleGroups.flatMap((group) =>
              group.items.map((item) => ({
                name: item.title,
                url: canonical(
                  nativeFilter
                    ? `/components/${item.name}?platform=native`
                    : `/components/${item.name}`,
                  locale,
                ),
              })),
            ),
            title: t("title"),
            url: canonical(catalogPathname, locale),
          }),
        ])}
      />
      <PlatformSidebar sections={await getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-4 py-16 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-semibold mb-4">{t("title")}</h1>
            <p className="text-muted-foreground text-lg">
              {catalogDescription}
            </p>
            <PlatformSelector
              className="mt-6 flex min-h-11 w-fit max-w-full items-center gap-1 overflow-x-auto rounded-md border border-border p-1"
              includeAll
            />
            {nativeFilter ? (
              <div className="mt-6 max-w-3xl rounded-lg border border-border bg-muted/30 p-5">
                <p className="font-medium">
                  {t("nativeFilterTitle", { count: visibleCount })}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t("nativeFilterNotice")}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium">
                  <Link
                    className="underline underline-offset-4"
                    href={withPlatformQuery("/docs/native", query, "native")}
                  >
                    {t("nativeGuide")}
                  </Link>
                  <a
                    className="underline underline-offset-4"
                    href="/r/native/registry.json"
                  >
                    {t("nativeManifest")}
                  </a>
                </div>
              </div>
            ) : null}
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
      </main>
    </>
  );
}
