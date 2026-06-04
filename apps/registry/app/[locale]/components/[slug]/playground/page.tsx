import { Breadcrumb, Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { PlaygroundCodePanel } from "@/components/playground";
import { StorybookEmbed } from "@/components/storybook-embed";
import { type Locale, routing } from "@/i18n/routing";
import componentMetadata from "@/lib/component-metadata.json";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import {
  getPlaygroundExample,
  getRegistryPackageVersion,
} from "@/lib/playground";
import { canonical, languageAlternates, localizePathname } from "@/lib/seo";
import {
  getCategoryForComponent,
  getSidebarSections,
} from "@/lib/sidebar-sections";
import registryData from "@/registry.json";
import type { Registry, RegistryComponent } from "@/types/registry";

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
};

const registry = registryData as Registry;
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

  const meta = metadata_map[slug];
  const title = meta?.title ?? component.title;
  const description =
    meta?.description ??
    component.description ??
    "Preview a VLLNT UI component and copy its example.";
  const pathname = `/components/${slug}/playground`;

  const ogParameters = {
    category: getCategoryForComponent(slug),
    description,
    title,
    type: "component" as const,
  };

  return {
    alternates: {
      canonical: canonical(pathname, locale),
      languages: languageAlternates(pathname),
    },
    description,
    openGraph: generateOGMetadata(ogParameters, { locale, pathname }),
    title: `${title} Playground - VLLNT UI`,
    twitter: generateTwitterMetadata(ogParameters),
  };
}

export default async function ComponentPlaygroundPage(props: Props) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);
  const component = findComponent(slug);

  if (!component) {
    notFound();
  }

  const meta = metadata_map[slug];
  const displayTitle = meta?.title ?? component.title ?? component.name;
  const displayDescription =
    meta?.description ??
    component.description ??
    "Preview this component and copy its example.";
  const playgroundExample = getPlaygroundExample(component);
  const registryPackageVersion = getRegistryPackageVersion(registry.version);

  return (
    <>
      <Sidebar
        sections={getSidebarSections(getCategoryForComponent(slug), locale)}
      />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <Breadcrumb
            className="mb-4 text-muted-foreground"
            items={[
              { href: localizePathname("/", locale), label: "Home" },
              {
                href: localizePathname("/components", locale),
                label: "Components",
              },
              {
                href: localizePathname(`/components/${component.name}`, locale),
                label: displayTitle,
              },
              { label: "Playground" },
            ]}
          />
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-semibold mb-2">
                {displayTitle} Playground
              </h1>
              <p className="max-w-3xl text-lg text-muted-foreground">
                {displayDescription}
              </p>
            </div>
            <Link
              className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
              href={localizePathname(`/components/${component.name}`, locale)}
            >
              Back to component
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
