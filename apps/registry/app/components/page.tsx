import { Sidebar } from "@vllnt/ui";
import Link from "next/link";

import componentMetadata from "@/lib/component-metadata.json";
import {
  components,
  getSidebarSections,
  groupedComponents,
} from "@/lib/sidebar-sections";

const metadata_map = componentMetadata as Record<
  string,
  {
    description: string;
    stories: { id: string; name: string }[];
    title: string;
  }
>;

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
                {group.items.map((component) => {
                  const meta = metadata_map[component.name];
                  const storyCount = meta?.stories?.length ?? 0;

                  return (
                    <Link
                      className="group flex flex-col rounded-lg border bg-card hover:border-foreground/20 transition-colors overflow-hidden"
                      href={`/components/${component.name}`}
                      key={component.name}
                    >
                      <div className="flex-1 p-4 bg-muted/30 border-b min-h-[100px] flex flex-col justify-center">
                        <h3 className="text-sm font-medium group-hover:text-foreground transition-colors">
                          {component.title}
                        </h3>
                        {meta?.description ? (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {meta.description}
                          </p>
                        ) : null}
                      </div>
                      <div className="px-3 py-2 shrink-0 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {storyCount > 0
                            ? `${storyCount} ${storyCount === 1 ? "story" : "stories"}`
                            : "No preview"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
