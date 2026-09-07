import { Breadcrumb, Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PlaygroundCodePanel } from "@/components/playground";
import { StorybookEmbed } from "@/components/storybook-embed";
import { Link, type Locale, routing } from "@/i18n/routing";
import componentMetadata from "@/lib/component-metadata.json";
import { breadcrumbTrailLd, jsonLdScriptAttributes } from "@/lib/jsonld";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import {
  getPlaygroundExample,
  getRegistryPackageVersion,
} from "@/lib/playground";
import { registry } from "@/lib/registry";
import { canonical, languageAlternates, localizePathname } from "@/lib/seo";
import {
  getCategoryForComponent,
  getSidebarSections,
} from "@/lib/sidebar-sections";
import type { RegistryComponent } from "@/types/registry";

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
};

const metadata_map = componentMetadata as Record<
  string,
  {
    category: string;
    defaultStoryId: string;
    description: string;
    name: string;
    stories: { id: string; name: string }[];
    title: string;
  }
>;

function findComponent(slug: string): RegistryComponent | undefined {
  return registry.items.find(
    (item): item is RegistryComponent =>
      item.name === slug && item.type === "registry:component",
  );
}

export async function generateStaticParams() {
  const slugs = registry.items
    .filter(
      (item): item is RegistryComponent => item.type === "registry:component",
    )
    .map((item) => item.name);

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
  const meta = metadata_map[slug];
  const title = meta?.title ?? component.title;
  const description =
    meta?.description ?? component.description ?? t("metaDescriptionFallback");
  const pathname = `/components/${slug}/playground`;
  // Canonicalize to the parent component page: the playground is an interactive
  // variant of the same content, not a distinct indexable document.
  const canonicalPath = `/components/${slug}`;

  const ogParameters = {
    category: getCategoryForComponent(slug),
    description,
    title,
    type: "component" as const,
  };

  return {
    alternates: {
      canonical: canonical(canonicalPath, locale),
      languages: languageAlternates(canonicalPath),
    },
    description,
    openGraph: generateOGMetadata(ogParameters, { locale, pathname }),
    title: t("metaTitle", { title }),
    twitter: generateTwitterMetadata(ogParameters),
  };
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

  const meta = metadata_map[slug];
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
      <Sidebar
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
