import { readFile } from "node:fs/promises";
import path from "node:path";

import { CodeBlock, Sidebar, TableOfContents } from "@vllnt/ui";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { QuickAdd } from "@/components/quick-add";
import { StorybookEmbed } from "@/components/storybook-embed";
import componentMetadata from "@/lib/component-metadata.json";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
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

const STORYBOOK_URL =
  process.env.NEXT_PUBLIC_STORYBOOK_URL ?? "http://localhost:6006";

export async function generateStaticParams() {
  return registry.items
    .filter(
      (item): item is RegistryComponent => item.type === "registry:component",
    )
    .map((item) => ({
      slug: item.name,
    }));
}

function getNpmUrl(packageName: string): string {
  return `https://www.npmjs.com/package/${packageName}`;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const component = registry.items.find(
    (item): item is RegistryComponent =>
      item.name === slug && item.type === "registry:component",
  );

  if (!component) {
    return {};
  }

  const meta = metadata_map[slug];
  const category = getCategoryForComponent(slug);
  const title = meta?.title ?? component.title;
  const description = meta?.description ?? component.description;

  const ogParameters = {
    category,
    description,
    title,
    type: "component" as const,
  };

  return {
    description,
    openGraph: generateOGMetadata(ogParameters),
    title: `${title} - VLLNT UI`,
    twitter: generateTwitterMetadata(ogParameters),
  };
}

export default async function ComponentPage(props: Props) {
  const { slug } = await props.params;
  const component = registry.items.find(
    (item): item is RegistryComponent =>
      item.name === slug && item.type === "registry:component",
  );

  if (!component) {
    notFound();
  }

  const meta = metadata_map[slug];
  const displayTitle = meta?.title ?? component.title ?? component.name;
  const displayDescription = meta?.description ?? component.description ?? "";

  // Read component source for code display
  let componentCode = "";
  try {
    const isChartComponent = ["area-chart", "bar-chart", "line-chart"].includes(
      component.name,
    );

    const sourcePath = isChartComponent
      ? path.join(
          process.cwd(),
          "..",
          "..",
          "packages",
          "ui",
          "src",
          "components",
          "chart",
          `${component.name}.tsx`,
        )
      : path.join(
          process.cwd(),
          "..",
          "..",
          "packages",
          "ui",
          "src",
          "components",
          component.name,
          `${component.name}.tsx`,
        );

    try {
      componentCode = await readFile(sourcePath, "utf8");
    } catch {
      const directPath = path.join(
        process.cwd(),
        "..",
        "..",
        "packages",
        "ui",
        "src",
        "components",
        `${component.name}.tsx`,
      );
      componentCode = await readFile(directPath, "utf8");
    }
  } catch {
    // Source file not found — skip code section
  }

  const installCommand = `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/${component.name}.json`;

  const sections = [
    { id: "installation", title: "Installation" },
    ...(meta?.defaultStoryId ? [{ id: "storybook", title: "Storybook" }] : []),
    ...(componentCode ? [{ id: "code", title: "Code" }] : []),
    ...(component.dependencies && component.dependencies.length > 0
      ? [{ id: "dependencies", title: "Dependencies" }]
      : []),
  ] as { id: string; title: string }[];

  return (
    <>
      <Sidebar sections={getSidebarSections(getCategoryForComponent(slug))} />
      <main className="flex-1 overflow-y-auto bg-background overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_200px] gap-8">
            <div className="min-w-0">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">{displayTitle}</h1>
                <p className="text-muted-foreground text-lg mb-6">
                  {displayDescription}
                </p>
                <QuickAdd componentName={component.name} />
              </div>

              {/* Preview — Storybook Embed */}
              {meta?.defaultStoryId ? (
                <div className="mb-8 scroll-mt-8">
                  <div className="rounded-lg border bg-card overflow-hidden">
                    <StorybookEmbed
                      componentName={component.name}
                      storyId={meta.defaultStoryId}
                    />
                  </div>
                </div>
              ) : null}

              {/* Installation */}
              <div className="mb-8 scroll-mt-8" id="installation">
                <h2 className="text-2xl font-semibold mb-4">Installation</h2>
                <CodeBlock language="bash" showLanguage={true}>
                  {installCommand}
                </CodeBlock>
              </div>

              {/* Storybook link */}
              {meta?.defaultStoryId ? (
                <div className="mb-8 scroll-mt-8" id="storybook">
                  <h2 className="text-2xl font-semibold mb-4">Storybook</h2>
                  <p className="text-muted-foreground mb-4">
                    Explore all variants, controls, and accessibility checks in
                    the interactive Storybook playground.
                  </p>
                  <Link
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    href={`${STORYBOOK_URL}/?path=/story/${meta.defaultStoryId}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    View in Storybook
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  {meta.stories.length > 1 ? (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        {meta.stories.length} stories available:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {meta.stories.map((story) => (
                          <Link
                            className="rounded-md border px-3 py-1 text-sm transition-colors hover:bg-muted"
                            href={`${STORYBOOK_URL}/?path=/story/${story.id}`}
                            key={story.id}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {story.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Code */}
              {componentCode ? (
                <div className="mb-8 scroll-mt-8" id="code">
                  <h2 className="text-2xl font-semibold mb-4">Code</h2>
                  <CodeBlock language="typescript" showLanguage={true}>
                    {componentCode}
                  </CodeBlock>
                </div>
              ) : null}

              {/* Dependencies */}
              {component.dependencies && component.dependencies.length > 0 ? (
                <div className="mb-8 scroll-mt-8" id="dependencies">
                  <h2 className="text-2xl font-semibold mb-4">Dependencies</h2>
                  <div className="rounded-lg border bg-card p-6">
                    <ul className="space-y-2">
                      {component.dependencies.map((dep) => {
                        const npmUrl = getNpmUrl(dep);
                        return (
                          <li className="flex items-center gap-2" key={dep}>
                            <code className="bg-muted px-2 py-1 rounded text-sm">
                              {dep}
                            </code>
                            <Link
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              href={npmUrl}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Table of Contents */}
            <TableOfContents sections={sections} />
          </div>
        </div>
      </main>
    </>
  );
}
