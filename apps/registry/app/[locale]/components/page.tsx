import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link, type Locale } from "@/i18n/routing";
import componentMetadata from "@/lib/component-metadata.json";
import { getPageContent } from "@/lib/content";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { getLocalizedDescription } from "@/lib/registry-i18n";
import { canonical, languageAlternates } from "@/lib/seo";
import {
  getGroupedComponents,
  getSidebarSections,
} from "@/lib/sidebar-sections";

const metadata_map = componentMetadata as Record<
  string,
  {
    description: string;
    descriptions?: Partial<Record<string, string>>;
    stories: { id: string; name: string }[];
    title: string;
  }
>;

type Props = {
  params: Promise<{ locale: Locale }>;
};

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
  const { frontmatter } = await getPageContent("components", locale);
  const t = await getTranslations({ locale, namespace: "pages.components" });
  const groupedComponents = getGroupedComponents(locale);

  return (
    <>
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-4 py-16 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-semibold mb-4">{frontmatter.title}</h1>
            <p className="text-muted-foreground text-lg">
              {frontmatter.description}
            </p>
          </div>

          {groupedComponents.map((group) => (
            <section className="mb-12" key={group.category}>
              <h2 className="text-2xl font-semibold mb-6">{group.label}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map((component) => {
                  const meta = metadata_map[component.name];
                  const storyCount = meta?.stories?.length ?? 0;
                  const description = getLocalizedDescription(
                    component,
                    locale,
                  );

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
                        {description ? (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {description}
                          </p>
                        ) : null}
                      </div>
                      <div className="px-3 py-2 shrink-0 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {storyCount > 0
                            ? t("stories", { count: storyCount })
                            : t("noPreview")}
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
