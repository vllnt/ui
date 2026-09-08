import { Breadcrumb } from "@vllnt/ui";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Footer } from "@/components/footer/footer";
import { PlatformSelector } from "@/components/platform-selector";
import { PlatformSidebar } from "@/components/platform-sidebar";
import { Link, type Locale } from "@/i18n/routing";
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
import { registry } from "@/lib/registry";
import { canonical, languageAlternates, localizePathname } from "@/lib/seo";
import {
  familyPath,
  getCategoryDescription,
  getSidebarSections,
  groupedComponents,
} from "@/lib/sidebar-sections";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
  readonly searchParams: Promise<PlatformQuery>;
};

const PATHNAME = "/families";
const TITLE = "Component families";
const DESCRIPTION =
  "Browse VLLNT UI by family — AI, forms, data, overlays, navigation, content, and more. Every component installs independently with the shadcn CLI.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    alternates: {
      canonical: canonical(PATHNAME, locale),
      languages: languageAlternates(PATHNAME),
    },
    description: DESCRIPTION,
    openGraph: generateOGMetadata(
      { description: DESCRIPTION, title: TITLE, type: "page" },
      { locale, pathname: PATHNAME },
    ),
    title: `${TITLE} — VLLNT UI`,
    twitter: generateTwitterMetadata({
      description: DESCRIPTION,
      title: TITLE,
      type: "page",
    }),
  };
}

export default async function FamiliesPage({ params, searchParams }: Props) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations("pages.families");
  const common = await getTranslations("common");
  const platform = getPlatform(query.platform);
  const platformsByName = new Map(
    registry.items.map((item) => [item.name, item.platforms]),
  );
  const visibleGroups = groupedComponents
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        platformsByName.get(item.name)?.includes(platform ?? "web"),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <script
        {...jsonLdScriptAttributes([
          breadcrumbTrailLd(locale, [
            { name: "Components", path: "/components" },
            { name: "Families", path: PATHNAME },
          ]),
          collectionPageLd({
            description: DESCRIPTION,
            items: groupedComponents.map((group) => ({
              name: `${group.label} components`,
              url: canonical(familyPath(group.category), locale),
            })),
            title: TITLE,
            url: canonical(PATHNAME, locale),
          }),
        ])}
      />
      <PlatformSidebar sections={await getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-4 py-16 lg:px-8">
          <Breadcrumb
            className="mb-4 text-muted-foreground"
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
              { label: t("breadcrumb") },
            ]}
          />
          <div className="mb-12">
            <h1 className="text-4xl font-semibold mb-4">{t("title")}</h1>
            <p className="text-muted-foreground text-lg">
              {platform === "native"
                ? t("nativeDescription")
                : t("description")}
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              {t("familyCount", { count: visibleGroups.length })}
            </p>
            <PlatformSelector className="mt-6 flex min-h-11 w-fit max-w-full items-center gap-1 overflow-x-auto rounded-md border border-border p-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleGroups.map((group) => (
              <Link
                className="group flex flex-col rounded-lg border bg-card p-6 transition-colors hover:border-foreground/20"
                href={withPlatformQuery(
                  familyPath(group.category),
                  query,
                  platform,
                )}
                key={group.category}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-lg font-semibold transition-colors group-hover:text-foreground">
                    {group.label}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {group.items.length}
                  </span>
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {getCategoryDescription(group.category)}
                </p>
              </Link>
            ))}
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
