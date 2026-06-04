import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

import { ComponentThumbnail } from "@/components/component-thumbnail";
import type { Locale } from "@/i18n/routing";
import componentMetadata from "@/lib/component-metadata.json";
import { getPageContent } from "@/lib/content";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates, localizePathname } from "@/lib/seo";
import {
  components,
  getSidebarSections,
  groupedComponents,
} from "@/lib/sidebar-sections";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

const metadata_map = componentMetadata as Record<
  string,
  {
    description: string;
    stories: { id: string; name: string }[];
    title: string;
  }
>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { frontmatter } = await getPageContent("components", locale);
  const og = frontmatter.og;

  return {
    alternates: {
      canonical: canonical("/components", locale),
      languages: languageAlternates("/components"),
    },
    description: frontmatter.description,
    openGraph: generateOGMetadata(
      {
        description: og?.description ?? frontmatter.description,
        title: og?.title ?? frontmatter.title,
        type: og?.type ?? frontmatter.type,
      },
      { locale, pathname: "/components" },
    ),
    title: frontmatter.title,
    twitter: generateTwitterMetadata({
      description: og?.description ?? frontmatter.description,
      title: og?.title ?? frontmatter.title,
      type: og?.type ?? frontmatter.type,
    }),
  };
}

export default async function ComponentsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-4 py-16 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-semibold mb-4">Components</h1>
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
                      href={localizePathname(
                        `/components/${component.name}`,
                        locale,
                      )}
                      key={component.name}
                    >
                      <ComponentThumbnail componentName={component.name} />
                      <div className="flex flex-1 flex-col p-4">
                        <h3 className="text-sm font-medium group-hover:text-foreground transition-colors">
                          {component.title}
                        </h3>
                        {meta?.description ? (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {meta.description}
                          </p>
                        ) : null}
                        {storyCount > 0 ? (
                          <span className="mt-3 text-xs text-muted-foreground">
                            {`${storyCount} ${storyCount === 1 ? "story" : "stories"}`}
                          </span>
                        ) : null}
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
