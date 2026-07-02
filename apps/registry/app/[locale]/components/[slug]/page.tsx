import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  Breadcrumb,
  ShareSection,
  Sidebar,
  StaticCode,
  TableOfContents,
} from "@vllnt/ui";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PreviewPlaygroundTabs } from "@/components/playground";
import { QuickAdd } from "@/components/quick-add";
import { ShareEmbedBar } from "@/components/share-embed-bar";
import { Link, type Locale, routing } from "@/i18n/routing";
import { getAiSeo } from "@/lib/ai-seo";
import componentMetadata from "@/lib/component-metadata.json";
import {
  breadcrumbLd,
  jsonLdScriptAttributes,
  softwareSourceCodeLd,
} from "@/lib/jsonld";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import {
  getPlaygroundExample,
  getRegistryPackageVersion,
} from "@/lib/playground";
import { registry } from "@/lib/registry";
import { canonical, languageAlternates, localizePathname } from "@/lib/seo";
import { oembedUrl, withRef } from "@/lib/share";
import {
  familyPath,
  getCategoryForComponent,
  getSidebarSections,
  groupedComponents,
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

const STORYBOOK_URL =
  process.env.NEXT_PUBLIC_STORYBOOK_URL ?? "http://localhost:6006";

export async function generateStaticParams() {
  const slugs = registry.items.reduce<string[]>((names, item) => {
    if (item.type === "registry:component") {
      names.push(item.name);
    }
    return names;
  }, []);

  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

function getNpmUrl(packageName: string): string {
  return `https://www.npmjs.com/package/${packageName}`;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const component = registry.items.find(
    (item): item is RegistryComponent =>
      item.name === slug && item.type === "registry:component",
  );

  if (!component) {
    return {};
  }

  const meta = metadata_map[slug];
  const category = getCategoryForComponent(slug);
  const aiSeo = getAiSeo(slug);
  const title = meta?.title ?? component.title;
  const description =
    aiSeo?.description ?? meta?.description ?? component.description;
  const pathname = `/components/${slug}`;

  const ogParameters = {
    category,
    description,
    title,
    type: "component" as const,
  };

  return {
    alternates: {
      canonical: canonical(pathname, locale),
      languages: languageAlternates(pathname),
      types: {
        "application/json+oembed": oembedUrl(canonical(pathname, locale)),
      },
    },
    description,
    openGraph: generateOGMetadata(ogParameters, { locale, pathname }),
    title: aiSeo?.title ?? `${title} - VLLNT UI`,
    twitter: generateTwitterMetadata(ogParameters),
  };
}

export default async function ComponentPage(props: Props) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.component");
  const common = await getTranslations("common");
  const component = registry.items.find(
    (item): item is RegistryComponent =>
      item.name === slug && item.type === "registry:component",
  );

  if (!component) {
    notFound();
  }

  const meta = metadata_map[slug];
  const aiSeo = getAiSeo(slug);
  const displayTitle = meta?.title ?? component.title ?? component.name;
  const displayDescription =
    aiSeo?.description ?? meta?.description ?? component.description ?? "";
  const playgroundExample = getPlaygroundExample(component);
  const registryPackageVersion = getRegistryPackageVersion(registry.version);

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

  const installCommand = `pnpm dlx shadcn@latest add https://ui.vllnt.ai/r/${component.name}.json`;

  const componentCategory = getCategoryForComponent(slug);
  const familyGroup = componentCategory
    ? groupedComponents.find((group) => group.category === componentCategory)
    : undefined;

  const sections = [
    { id: "installation", title: "Installation" },
    ...(meta?.defaultStoryId ? [{ id: "preview", title: "Preview" }] : []),
    ...(meta?.defaultStoryId ? [{ id: "storybook", title: "Storybook" }] : []),
    ...(componentCode ? [{ id: "code", title: "Code" }] : []),
    ...(component.dependencies && component.dependencies.length > 0
      ? [{ id: "dependencies", title: "Dependencies" }]
      : []),
  ] as { id: string; title: string }[];

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";

  return (
    <>
      <script
        {...jsonLdScriptAttributes([
          softwareSourceCodeLd({
            description: displayDescription,
            name: component.name,
            title: displayTitle,
          }),
          breadcrumbLd([
            { name: common("home"), url: SITE_URL },
            { name: common("components"), url: `${SITE_URL}/components` },
            {
              name: displayTitle,
              url: `${SITE_URL}/components/${component.name}`,
            },
          ]),
        ])}
      />
      <Sidebar
        sections={getSidebarSections(getCategoryForComponent(slug), locale)}
      />
      <main className="flex-1 overflow-y-auto bg-background overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_200px] gap-8">
            <div className="min-w-0">
              {/* Header */}
              <div className="mb-8">
                <Breadcrumb
                  className="mb-4 text-muted-foreground"
                  items={[
                    {
                      href: localizePathname("/", locale),
                      label: common("home"),
                    },
                    {
                      href: localizePathname("/components", locale),
                      label: common("components"),
                    },
                    ...(familyGroup
                      ? [
                          {
                            href: localizePathname(
                              familyPath(familyGroup.category),
                              locale,
                            ),
                            label: familyGroup.label,
                          },
                        ]
                      : []),
                    { label: displayTitle },
                  ]}
                />
                <h1 className="text-4xl font-semibold mb-2">{displayTitle}</h1>
                <p className="text-muted-foreground text-lg mb-6">
                  {displayDescription}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <QuickAdd componentName={component.name} />
                  <ShareEmbedBar
                    pageUrl={canonical(`/components/${component.name}`, locale)}
                    slug={component.name}
                    title={displayTitle}
                  />
                  <Link
                    className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
                    href={`/report?component=${component.name}`}
                  >
                    {t("reportBug")}
                  </Link>
                </div>
              </div>

              {/* When to use in an AI app */}
              {aiSeo?.whenToUse ? (
                <div className="mb-8 rounded-lg border border-border bg-muted/30 p-6">
                  <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    {t("whenToUseTitle")}
                  </h2>
                  <p className="mt-3 text-base leading-relaxed">
                    {aiSeo.whenToUse}
                  </p>
                  <Link
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground underline"
                    href="/families/ai"
                  >
                    {t("browseAiComponents")}
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              ) : null}

              {/* Preview + Playground */}
              {meta?.defaultStoryId ? (
                <PreviewPlaygroundTabs
                  componentName={component.name}
                  example={playgroundExample}
                  packageVersion={registryPackageVersion}
                  storyId={meta.defaultStoryId}
                />
              ) : null}

              {/* Installation */}
              <div className="mb-8 scroll-mt-8" id="installation">
                <h2 className="text-2xl font-semibold mb-4">
                  {t("installation")}
                </h2>
                <StaticCode code={installCommand} language="bash" />
              </div>

              {/* Storybook link */}
              {meta?.defaultStoryId ? (
                <div className="mb-8 scroll-mt-8" id="storybook">
                  <h2 className="text-2xl font-semibold mb-4">
                    {t("storybook")}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {t("storybookDescription")}
                  </p>
                  <a
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    href={`${STORYBOOK_URL}/?path=/story/${meta.defaultStoryId}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t("viewInStorybook")}
                    <ExternalLink className="size-4" />
                  </a>
                  {meta.stories.length > 1 ? (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        {t("storiesAvailable", { count: meta.stories.length })}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {meta.stories.map((story) => (
                          <a
                            className="rounded-md border px-3 py-1 text-sm transition-colors hover:bg-muted"
                            href={`${STORYBOOK_URL}/?path=/story/${story.id}`}
                            key={story.id}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {story.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Code */}
              {componentCode ? (
                <div className="mb-8 scroll-mt-8" id="code">
                  <h2 className="text-2xl font-semibold mb-4">{t("code")}</h2>
                  <StaticCode code={componentCode} language="typescript" />
                </div>
              ) : null}

              {/* Dependencies */}
              {component.dependencies && component.dependencies.length > 0 ? (
                <div className="mb-8 scroll-mt-8" id="dependencies">
                  <h2 className="text-2xl font-semibold mb-4">
                    {t("dependencies")}
                  </h2>
                  <div className="rounded-lg border bg-card p-6">
                    <ul className="space-y-2">
                      {component.dependencies.map((dep) => {
                        const npmUrl = getNpmUrl(dep);
                        return (
                          <li className="flex items-center gap-2" key={dep}>
                            <code className="bg-muted px-2 py-1 rounded text-sm">
                              {dep}
                            </code>
                            <a
                              aria-label={t("viewOnNpm", { dep })}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              href={npmUrl}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              <ExternalLink className="size-3" />
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              ) : null}

              <ShareSection
                shareOn={t("shareOn")}
                shareTitle={t("shareTitle")}
                title={`${displayTitle} — VLLNT UI`}
                url={withRef(
                  canonical(`/components/${component.name}`, locale),
                  "share",
                )}
              />
            </div>

            {/* Table of Contents */}
            <TableOfContents sections={sections} />
          </div>
        </div>
      </main>
    </>
  );
}
