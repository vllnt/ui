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
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { PreviewPlaygroundTabs } from "@/components/playground";
import { QuickAdd } from "@/components/quick-add";
import { ShareEmbedBar } from "@/components/share-embed-bar";
import { type Locale, routing } from "@/i18n/routing";
import { getAiSeo } from "@/lib/ai-seo";
import componentMetadata from "@/lib/component-metadata.json";
import { getComponentSeo } from "@/lib/component-seo";
import {
  breadcrumbTrailLd,
  faqPageLd,
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
  const componentSeo = getComponentSeo(slug);
  const title = meta?.title ?? component.title;
  const description =
    aiSeo?.description ??
    componentSeo?.description ??
    meta?.description ??
    component.description;
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
    title: aiSeo?.title ?? componentSeo?.title ?? `${title} - VLLNT UI`,
    twitter: generateTwitterMetadata(ogParameters),
  };
}

export default async function ComponentPage(props: Props) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);
  const component = registry.items.find(
    (item): item is RegistryComponent =>
      item.name === slug && item.type === "registry:component",
  );

  if (!component) {
    notFound();
  }

  const meta = metadata_map[slug];
  const aiSeo = getAiSeo(slug);
  const componentSeo = getComponentSeo(slug);
  const displayTitle = meta?.title ?? component.title ?? component.name;
  const displayDescription =
    aiSeo?.description ??
    componentSeo?.description ??
    meta?.description ??
    component.description ??
    "";
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

  const installCommand = `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/${component.name}.json`;

  const componentCategory = getCategoryForComponent(slug);
  const familyGroup = componentCategory
    ? groupedComponents.find((group) => group.category === componentCategory)
    : undefined;

  const relatedSlugs = (
    componentSeo && componentSeo.related.length > 0
      ? componentSeo.related
      : (familyGroup?.items ?? []).map((item) => item.name)
  )
    .filter((name) => name !== component.name)
    .slice(0, 6);
  const relatedComponents = relatedSlugs
    .map((name) =>
      registry.items.find(
        (item): item is RegistryComponent =>
          item.name === name && item.type === "registry:component",
      ),
    )
    .filter((item): item is RegistryComponent => item !== undefined)
    .map((item) => ({ name: item.name, title: item.title ?? item.name }));

  const sections = [
    { id: "installation", title: "Installation" },
    ...(meta?.defaultStoryId ? [{ id: "preview", title: "Preview" }] : []),
    ...(meta?.defaultStoryId ? [{ id: "storybook", title: "Storybook" }] : []),
    ...(componentCode ? [{ id: "code", title: "Code" }] : []),
    ...(component.dependencies && component.dependencies.length > 0
      ? [{ id: "dependencies", title: "Dependencies" }]
      : []),
    ...(componentSeo?.faqs.length ? [{ id: "faq", title: "FAQ" }] : []),
    ...(relatedComponents.length > 0
      ? [{ id: "related", title: "Related" }]
      : []),
  ] as { id: string; title: string }[];

  return (
    <>
      <script
        {...jsonLdScriptAttributes([
          softwareSourceCodeLd({
            description: displayDescription,
            name: component.name,
            title: displayTitle,
          }),
          breadcrumbTrailLd(locale, [
            { name: "Components", path: "/components" },
            { name: displayTitle, path: `/components/${component.name}` },
          ]),
          ...(componentSeo?.faqs.length ? [faqPageLd(componentSeo.faqs)] : []),
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
                    { href: localizePathname("/", locale), label: "Home" },
                    {
                      href: localizePathname("/components", locale),
                      label: "Components",
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
                    href={localizePathname(
                      `/report?component=${component.name}`,
                      locale,
                    )}
                  >
                    Report a bug
                  </Link>
                </div>
              </div>

              {/* When to use in an AI app */}
              {aiSeo?.whenToUse ? (
                <div className="mb-8 rounded-lg border border-border bg-muted/30 p-6">
                  <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    When to use this in an AI app
                  </h2>
                  <p className="mt-3 text-base leading-relaxed">
                    {aiSeo.whenToUse}
                  </p>
                  <Link
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground underline"
                    href={localizePathname("/families/ai", locale)}
                  >
                    Browse all AI agent components
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              ) : null}

              {/* Usage block for non-AI components */}
              {!aiSeo?.whenToUse && componentSeo?.whatItIs ? (
                <div className="mb-8 rounded-lg border border-border bg-muted/30 p-6">
                  <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    What it is &amp; when to use
                  </h2>
                  <p className="mt-3 text-base leading-relaxed">
                    {componentSeo.whatItIs}
                  </p>
                  {familyGroup ? (
                    <Link
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground underline"
                      href={localizePathname(
                        familyPath(familyGroup.category),
                        locale,
                      )}
                    >
                      Browse all {familyGroup.label}
                      <ExternalLink className="size-3" />
                    </Link>
                  ) : null}
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
                <h2 className="text-2xl font-semibold mb-4">Installation</h2>
                <StaticCode code={installCommand} language="bash" />
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
                    <ExternalLink className="size-4" />
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
                  <StaticCode code={componentCode} language="typescript" />
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
                              aria-label={`View ${dep} on npm`}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              href={npmUrl}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              <ExternalLink className="size-3" />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              ) : null}

              {/* FAQ (visible content backing FAQPage structured data) */}
              {componentSeo?.faqs.length ? (
                <div className="mb-8 scroll-mt-8" id="faq">
                  <h2 className="text-2xl font-semibold mb-4">
                    Frequently asked questions
                  </h2>
                  <dl className="space-y-6">
                    {componentSeo.faqs.map((faq) => (
                      <div key={faq.question}>
                        <dt className="font-medium">{faq.question}</dt>
                        <dd className="mt-2 leading-relaxed text-muted-foreground">
                          {faq.answer}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}

              {/* Related components (internal linking) */}
              {relatedComponents.length > 0 ? (
                <div className="mb-8 scroll-mt-8" id="related">
                  <h2 className="text-2xl font-semibold mb-4">
                    Related components
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {relatedComponents.map((related) => (
                      <Link
                        className="rounded-md border px-3 py-1 text-sm transition-colors hover:bg-muted"
                        href={localizePathname(
                          `/components/${related.name}`,
                          locale,
                        )}
                        key={related.name}
                      >
                        {related.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              <ShareSection
                shareOn="Share on"
                shareTitle="Share this component"
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
