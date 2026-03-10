import { generateOGImageURL } from "@/lib/og";
import { components, groupedComponents } from "@/lib/sidebar-sections";

const STATIC_PAGES = [
  {
    description: "Component Registry built with shadcn/ui",
    title: "VLLNT UI",
    type: "home" as const,
  },
  {
    description: "Explore all VLLNT UI components",
    title: "Components",
    type: "component" as const,
  },
  {
    description: "Learn how to use VLLNT UI components",
    title: "Documentation",
    type: "docs" as const,
  },
  {
    description: "The principles behind VLLNT UI",
    title: "Philosophy",
    type: "page" as const,
  },
];

function OGCard({
  label,
  ogUrl,
  subtitle,
}: {
  label: string;
  ogUrl: string;
  subtitle?: string;
}): React.JSX.Element {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {subtitle ? (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        ) : undefined}
      </div>
      <div className="rounded-lg border overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={`OG preview: ${label}`}
          className="w-full h-auto"
          loading="lazy"
          src={ogUrl}
        />
      </div>
      <code className="block text-xs text-muted-foreground break-all">
        {ogUrl}
      </code>
    </div>
  );
}

export default function OGPreviewPage(): React.JSX.Element {
  return (
    <main className="flex-1 overflow-y-auto bg-background">
      <div className="container mx-auto px-4 py-8 lg:px-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">OG Image Preview</h1>
          <p className="text-muted-foreground">
            {components.length} components + {STATIC_PAGES.length} static pages
            = {components.length + STATIC_PAGES.length} OG images
          </p>
        </div>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Static Pages</h2>
          <div className="space-y-8">
            {STATIC_PAGES.map((page) => (
              <OGCard
                key={page.title}
                label={page.title}
                ogUrl={generateOGImageURL({
                  description: page.description,
                  title: page.title,
                  type: page.type,
                })}
                subtitle={page.type}
              />
            ))}
          </div>
        </section>

        {groupedComponents.map((group) => (
          <section className="mb-12" key={group.category}>
            <h2 className="text-xl font-semibold mb-4">
              {group.label} ({group.items.length})
            </h2>
            <div className="space-y-8">
              {group.items.map((component) => (
                <OGCard
                  key={component.name}
                  label={component.title}
                  ogUrl={generateOGImageURL({
                    category: group.category,
                    title: component.title,
                    type: "component",
                  })}
                  subtitle={group.category}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
