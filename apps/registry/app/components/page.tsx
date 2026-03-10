import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { ComponentPreview } from "@/components/component-preview/component-preview";
import { getPageContent } from "@/lib/content";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import {
  components,
  getSidebarSections,
  groupedComponents,
} from "@/lib/sidebar-sections";

export async function generateMetadata(): Promise<Metadata> {
  const { frontmatter } = await getPageContent("components");
  const og = frontmatter.og;

  return {
    description: frontmatter.description,
    openGraph: generateOGMetadata({
      description: og?.description ?? frontmatter.description,
      title: og?.title ?? frontmatter.title,
      type: og?.type ?? frontmatter.type,
    }),
    title: frontmatter.title,
    twitter: generateTwitterMetadata({
      description: og?.description ?? frontmatter.description,
      title: og?.title ?? frontmatter.title,
      type: og?.type ?? frontmatter.type,
    }),
  };
}

export default function ComponentsPage() {
  return (
    <>
      <Sidebar sections={getSidebarSections()} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-4 py-16 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Components</h1>
            <p className="text-muted-foreground text-lg">
              Explore all {components.length} components available in the
              library.
            </p>
          </div>

          {groupedComponents.map((group) => (
            <section className="mb-12" key={group.category}>
              <h2 className="text-2xl font-semibold mb-6">{group.label}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map((component) => (
                  <div
                    className="group relative flex flex-col rounded-lg border bg-card hover:border-foreground/20 transition-colors overflow-hidden"
                    key={component.name}
                  >
                    <Link
                      className="absolute inset-0 z-10"
                      href={`/components/${component.name}`}
                    >
                      <span className="sr-only">{component.title}</span>
                    </Link>
                    <div className="flex-1 p-4 bg-muted/30 border-b h-[140px] flex items-center justify-center overflow-hidden">
                      <div className="scale-[0.85] origin-center pointer-events-none max-w-full">
                        <ComponentPreview componentName={component.name} />
                      </div>
                    </div>
                    <div className="px-3 py-2 shrink-0">
                      <h3 className="text-sm font-medium group-hover:text-foreground transition-colors truncate">
                        {component.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
