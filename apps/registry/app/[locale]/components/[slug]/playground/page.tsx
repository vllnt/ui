import { Breadcrumb } from "@vllnt/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PlatformSidebar } from "@/components/platform-sidebar";
import { PlaygroundCodePanel } from "@/components/playground";
import { StorybookEmbed } from "@/components/storybook-embed";
import { Link, type Locale, routing } from "@/i18n/routing";
import { componentMeta } from "@/lib/component-meta";
import { breadcrumbTrailLd, jsonLdScriptAttributes } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/og";
import {
  getPlaygroundExample,
  getRegistryPackageVersion,
} from "@/lib/playground";
import { findComponent, registry } from "@/lib/registry";
import { localizePathname } from "@/lib/seo";
import {
  getCategoryForComponent,
  getSidebarSections,
} from "@/lib/sidebar-sections";

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateStaticParams() {
  const slugs = registry.items.map((item) => item.name);

  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const component = findComponent(slug);

  if (!component) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: "pages.playground" });
  const meta = componentMeta[slug];
  const title = meta?.title ?? component.title;

  return pageMetadata({
    // Canonicalize to the parent component page: the playground is an
    // interactive variant of the same content, not a distinct indexable document.
    canonicalPath: `/components/${slug}`,
    locale,
    og: {
      category: getCategoryForComponent(slug),
      description:
        meta?.description ??
        component.description ??
        t("metaDescriptionFallback"),
      title,
      type: "component",
    },
    pathname: `/components/${slug}/playground`,
    title: t("metaTitle", { title }),
  });
}

export default async function ComponentPlaygroundPage(props: Props) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.playground");
  const common = await getTranslations("common");
  const component = findComponent(slug);

  if (!component) {
    notFound();
  }

  const meta = componentMeta[slug];
  const displayTitle = meta?.title ?? component.title ?? component.name;
  const displayDescription =
    meta?.description ?? component.description ?? t("descriptionFallback");
  const playgroundExample = getPlaygroundExample(component);
  const registryPackageVersion = getRegistryPackageVersion(registry.version);

  return (
    <>
      <script
        {...jsonLdScriptAttributes(
          breadcrumbTrailLd(locale, [
            { name: "Components", path: "/components" },
            { name: displayTitle, path: `/components/${component.name}` },
            {
              name: "Playground",
              path: `/components/${component.name}/playground`,
            },
          ]),
        )}
      />
      <PlatformSidebar
        sections={await getSidebarSections(
          getCategoryForComponent(slug),
          locale,
        )}
      />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <Breadcrumb
            className="mb-4 text-muted-foreground"
            items={[
              { href: localizePathname("/", locale), label: common("home") },
              {
                href: localizePathname("/components", locale),
                label: common("components"),
              },
              {
                href: localizePathname(`/components/${component.name}`, locale),
                label: displayTitle,
              },
              { label: t("title") },
            ]}
          />
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-semibold mb-2">
                {t("heading", { title: displayTitle })}
              </h1>
              <p className="max-w-3xl text-lg text-muted-foreground">
                {displayDescription}
              </p>
            </div>
            <Link
              className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
              href={`/components/${component.name}`}
            >
              {t("backToComponent")}
            </Link>
          </div>
          <div className="space-y-6">
            <div className="overflow-hidden rounded-lg border bg-card">
              <StorybookEmbed
                componentName={component.name}
                height={460}
                storyId={meta?.defaultStoryId}
              />
            </div>
            <PlaygroundCodePanel
              componentName={component.name}
              example={playgroundExample}
              packageVersion={registryPackageVersion}
              surface="route"
            />
          </div>
        </div>
      </main>
    </>
  );
}
