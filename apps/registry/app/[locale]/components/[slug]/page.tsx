import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  Breadcrumb,
  MDXContent,
  ShareSection,
  Sidebar,
  StaticCode,
  TableOfContents,
} from "@vllnt/ui";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ComponentCard } from "@/components/component-card";
import { buildComponentMdxKit } from "@/components/component-mdx";
import { PreviewPlaygroundTabs } from "@/components/playground";
import { QuickAdd } from "@/components/quick-add";
import { ShareEmbedBar } from "@/components/share-embed-bar";
import { Link, type Locale, routing } from "@/i18n/routing";
import { getAiSeo } from "@/lib/ai-seo";
import { getComponentContent } from "@/lib/component-content";
import componentMetadata from "@/lib/component-metadata.json";
import { getComponentSeo } from "@/lib/component-seo";
import {
  breadcrumbTrailLd,
  faqPageLd,
  jsonLdScriptAttributes,
  softwareSourceCodeLd,
  techArticleLd,
} from "@/lib/jsonld";
import {
  generateOGImageURL,
  generateOGMetadata,
  generateTwitterMetadata,
} from "@/lib/og";
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
import { getRegistryGeneratedAt } from "@/lib/stats";
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
  const componentMdx = await getComponentContent(slug, locale);
  // Hand-written copy (ai-seo / component-seo) is English and outranks the
  // templated MDX on the default locale. Other locales must use the localized
  // MDX frontmatter, never English copy.
  const isDefaultLocale = locale === routing.defaultLocale;
  const handWrittenDescription = isDefaultLocale
    ? (aiSeo?.description ?? componentSeo?.description)
    : undefined;
  const handWrittenTitle = isDefaultLocale
    ? (aiSeo?.title ?? componentSeo?.title)
    : undefined;
  const title =
    componentMdx?.frontmatter.title ?? meta?.title ?? component.title;
  const description =
    handWrittenDescription ??
    componentMdx?.frontmatter.description ??
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
    keywords: componentMdx?.frontmatter.keywords,
    openGraph: generateOGMetadata(ogParameters, { locale, pathname }),
    title: handWrittenTitle ?? `${title} - VLLNT UI`,
    twitter: generateTwitterMetadata(ogParameters),
  };
}

export default async function ComponentPage(props: Props) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.component");
  const common = await getTranslations("common");
  const shared = await getTranslations("shared");
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
  const isDefaultLocale = locale === routing.defaultLocale;
  // ai-seo / component-seo copy is hand-written English. Render it on the
  // default locale; other locales get the localized MDX body instead. (The
  // curated `related` slugs are language-neutral and always apply.)
  const seoCopy = isDefaultLocale ? componentSeo : undefined;
  const whenToUse = isDefaultLocale ? aiSeo?.whenToUse : undefined;
  const displayTitle = meta?.title ?? component.title ?? component.name;
  const displayDescription =
    (isDefaultLocale
      ? (aiSeo?.description ?? componentSeo?.description)
      : undefined) ??
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

  const componentMdx = await getComponentContent(slug, locale);
  const mdxKit = buildComponentMdxKit({
    componentCode,
    componentName: component.name,
    example: playgroundExample,
    installCommand,
    packageVersion: registryPackageVersion,
    storyId: meta?.defaultStoryId,
  });

  const componentCategory = getCategoryForComponent(slug);
  const familyGroup = componentCategory
    ? groupedComponents.find((group) => group.category === componentCategory)
    : undefined;
  // Hand-curated related slugs (component-seo) beat the family fallback.
  const relatedSlugs = (
    componentSeo && componentSeo.related.length > 0
      ? componentSeo.related
      : (familyGroup?.items ?? []).map((item) => item.name)
  )
    .filter((name) => name !== component.name)
    .slice(0, 6);
  const relatedComponents = relatedSlugs.filter((name) =>
    registry.items.some(
      (item) => item.name === name && item.type === "registry:component",
    ),
  );

  const sections = [
    ...(meta?.defaultStoryId ? [{ id: "preview", title: t("preview") }] : []),
    { id: "installation", title: t("installation") },
    ...(componentCode ? [{ id: "code", title: t("code") }] : []),
    ...(meta?.defaultStoryId
      ? [{ id: "storybook", title: t("storybook") }]
      : []),
    ...(component.dependencies && component.dependencies.length > 0
      ? [{ id: "dependencies", title: t("dependencies") }]
      : []),
    ...(seoCopy?.faqs.length ? [{ id: "faq", title: t("faq") }] : []),
    ...(relatedComponents.length > 0
      ? [{ id: "related", title: t("related") }]
      : []),
  ] as { id: string; title: string }[];

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.com";
  const articleTitle = componentMdx?.frontmatter.title ?? displayTitle;
  const articleDescription =
    componentMdx?.frontmatter.description ?? displayDescription;
  const componentUrl = canonical(`/components/${component.name}`, locale);
  const ogImage = `${SITE_URL}${generateOGImageURL({
    category: componentCategory ?? undefined,
    description: articleDescription,
    title: articleTitle,
    type: "component",
  })}`;
  const registryGeneratedAt = getRegistryGeneratedAt();

  return (
    <>
      <script
        {...jsonLdScriptAttributes([
          softwareSourceCodeLd({
            description: articleDescription,
            image: ogImage,
            keywords: componentMdx?.frontmatter.keywords,
            locale,
            name: component.name,
            title: articleTitle,
          }),
          techArticleLd({
            dateModified: registryGeneratedAt,
            description: articleDescription,
            image: ogImage,
            inLanguage: locale,
            keywords: componentMdx?.frontmatter.keywords,
            title: articleTitle,
            url: componentUrl,
          }),
          ...(seoCopy?.faqs.length ? [faqPageLd(seoCopy.faqs)] : []),
          breadcrumbTrailLd(
            locale,
            [
              { name: common("components"), path: "/components" },
              {
                name: articleTitle,
                path: `/components/${component.name}`,
              },
            ],
            common("home"),
          ),
        ])}
      />
      <Sidebar
        sections={await getSidebarSections(
          getCategoryForComponent(slug),
          locale,
        )}
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
                    { label: articleTitle },
                  ]}
                />
                <h1 className="text-4xl font-semibold mb-2">{articleTitle}</h1>
                <p className="text-muted-foreground text-lg mb-6">
                  {articleDescription}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <QuickAdd componentName={component.name} />
                  <ShareEmbedBar
                    pageUrl={canonical(`/components/${component.name}`, locale)}
                    slug={component.name}
                    title={articleTitle}
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
              {whenToUse ? (
                <div className="mb-8 rounded-lg border border-border bg-muted/30 p-6">
                  <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    {t("whenToUseTitle")}
                  </h2>
                  <p className="mt-3 text-base leading-relaxed">{whenToUse}</p>
                  <Link
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground underline"
                    href="/families/ai"
                  >
                    {t("browseAiComponents")}
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              ) : null}

              {/* Usage block for non-AI components */}
              {!whenToUse && seoCopy?.whatItIs ? (
                <div className="mb-8 rounded-lg border border-border bg-muted/30 p-6">
                  <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    {t("whatItIsTitle")}
                  </h2>
                  <p className="mt-3 text-base leading-relaxed">
                    {seoCopy.whatItIs}
                  </p>
                  {familyGroup ? (
                    <Link
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground underline"
                      href={localizePathname(
                        familyPath(familyGroup.category),
                        locale,
                      )}
                    >
                      {familyGroup.label}
                      <ExternalLink className="size-3" />
                    </Link>
                  ) : null}
                </div>
              ) : null}

              {componentMdx ? (
                <MDXContent
                  components={mdxKit}
                  content={componentMdx.content}
                  enableMDX
                />
              ) : (
                <>
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
                            {t("storiesAvailable", {
                              count: meta.stories.length,
                            })}
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
                      <h2 className="text-2xl font-semibold mb-4">
                        {t("code")}
                      </h2>
                      <StaticCode code={componentCode} language="typescript" />
                    </div>
                  ) : null}
                </>
              )}

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

              {relatedComponents.length > 0 ? (
                <section className="mb-8 scroll-mt-8" id="related">
                  <h2 className="text-2xl font-semibold mb-4">
                    {t("related")}
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {relatedComponents.map((relatedSlug) => (
                      <ComponentCard
                        key={relatedSlug}
                        locale={locale}
                        slug={relatedSlug}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {seoCopy?.faqs.length ? (
                <section className="mb-8 scroll-mt-8" id="faq">
                  <h2 className="text-2xl font-semibold mb-4">{t("faq")}</h2>
                  <dl className="space-y-6">
                    {seoCopy.faqs.map((faq) => (
                      <div key={faq.question}>
                        <dt className="font-medium">{faq.question}</dt>
                        <dd className="mt-2 text-muted-foreground">
                          {faq.answer}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ) : null}

              <ShareSection
                shareOn={t("shareOn")}
                shareTitle={t("shareTitle")}
                title={`${articleTitle} — VLLNT UI`}
                url={withRef(
                  canonical(`/components/${component.name}`, locale),
                  "share",
                )}
              />
            </div>

            {/* Table of Contents */}
            <TableOfContents label={shared("onThisPage")} sections={sections} />
          </div>
        </div>
      </main>
    </>
  );
}
