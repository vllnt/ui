import { Breadcrumb, Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ComponentPlaygroundShell } from "@/components/playground";
import componentMetadata from "@/lib/component-metadata.json";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import {
  getPlaygroundExample,
  getRegistryPackageVersion,
} from "@/lib/playground";
import { canonical } from "@/lib/seo";
import {
  getCategoryForComponent,
  getSidebarSections,
} from "@/lib/sidebar-sections";
import registryData from "@/registry.json";
import type { Registry, RegistryComponent } from "@/types/registry";

type Props = {
  params: Promise<{ slug: string }>;
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
  return registry.items
    .filter(
      (item): item is RegistryComponent => item.type === "registry:component",
    )
    .map((item) => ({
      slug: item.name,
    }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const component = findComponent(slug);

  if (!component) {
    return {};
  }

  const meta = metadata_map[slug];
  const title = meta?.title ?? component.title;
  const description =
    meta?.description ??
    component.description ??
    "Edit a live VLLNT UI component sandbox.";

  const ogParameters = {
    category: getCategoryForComponent(slug),
    description,
    title,
    type: "component" as const,
  };

  return {
    alternates: { canonical: canonical(`/components/${slug}/playground`) },
    description,
    openGraph: generateOGMetadata(ogParameters),
    title: `${title} Playground - VLLNT UI`,
    twitter: generateTwitterMetadata(ogParameters),
  };
}

export default async function ComponentPlaygroundPage(props: Props) {
  const { slug } = await props.params;
  const component = findComponent(slug);

  if (!component) {
    notFound();
  }

  const meta = metadata_map[slug];
  const displayTitle = meta?.title ?? component.title ?? component.name;
  const displayDescription =
    meta?.description ?? component.description ?? "Edit this component live.";
  const playgroundExample = getPlaygroundExample(component);
  const registryPackageVersion = getRegistryPackageVersion(registry.version);

  return (
    <>
      <Sidebar sections={getSidebarSections(getCategoryForComponent(slug))} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <Breadcrumb
            className="mb-4 text-muted-foreground"
            items={[
              { href: "/", label: "Home" },
              { href: "/components", label: "Components" },
              { href: `/components/${component.name}`, label: displayTitle },
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
              href={`/components/${component.name}`}
            >
              Back to component
            </Link>
          </div>
          <ComponentPlaygroundShell
            componentName={component.name}
            example={playgroundExample}
            packageVersion={registryPackageVersion}
            surface="route"
          />
        </div>
      </main>
    </>
  );
}
