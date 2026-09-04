import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  Breadcrumb,
  MDXContent,
  ShareSection,
  StaticCode,
  TableOfContents,
} from "@vllnt/ui";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ComponentCard } from "@/components/component-card";
import { buildComponentMdxKit } from "@/components/component-mdx";
import { PlatformBadges } from "@/components/platform-badges";
import { PlatformSelector } from "@/components/platform-selector";
import { PlatformSidebar } from "@/components/platform-sidebar";
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
import { nativeRegistry } from "@/lib/native-registry";
import {
  generateOGImageURL,
  generateOGMetadata,
  generateTwitterMetadata,
} from "@/lib/og";
import {
  getPlatform,
  type PlatformQuery,
  withPlatformQuery,
} from "@/lib/platform";
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
  searchParams: Promise<PlatformQuery>;
};

const metadata_map = componentMetadata as Record<
  string,
  {
    category: string;
    defaultStoryId: string;
    description: string;
    name: string;
    platforms: ("native" | "web")[];
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
  const [{ locale, slug }, query] = await Promise.all([
    props.params,
    props.searchParams,
  ]);
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
  const pathname =
    getPlatform(query.platform) === "native"
      ? `/components/${slug}?platform=native`
      : `/components/${slug}`;

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
  const [{ locale, slug }, query] = await Promise.all([
    props.params,
    props.searchParams,
  ]);
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
  const supportsNative = component.platforms.includes("native");
  const platform = getPlatform(query.platform) ?? "web";
  const nativeFilter = platform === "native";

  // The browser catalog always renders the Web implementation. Native remains
  // a capability filter with separate contract and source metadata.
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

  const localizedComponent = await getComponentContent(slug, locale);
  const componentMdx = localizedComponent;
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
      (item) =>
        item.name === name &&
        item.type === "registry:component" &&
        item.platforms.includes(platform),
    ),
  );

  const sections = [
    ...(nativeFilter
      ? [
          {
            id: "native",
            title: supportsNative
              ? t("nativeCapabilityTitle")
              : t("webOnlyTitle"),
          },
        ]
      : []),
    ...(meta?.defaultStoryId ? [{ id: "preview", title: t("preview") }] : []),
    { id: "installation", title: t("installation") },
    ...(meta?.defaultStoryId
      ? [{ id: "storybook", title: t("storybook") }]
      : []),
    ...(componentCode ? [{ id: "code", title: t("code") }] : []),
    ...(component.dependencies && component.dependencies.length > 0
      ? [{ id: "dependencies", title: t("dependencies") }]
      : []),
    ...(relatedComponents.length > 0
      ? [{ id: "related", title: t("related") }]
      : []),
    ...(seoCopy?.faqs.length ? [{ id: "faq", title: t("faq") }] : []),
  ] as { id: string; title: string }[];

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.com";
  const articleTitle = localizedComponent?.frontmatter.title ?? displayTitle;
  const articleDescription =
    localizedComponent?.frontmatter.description ?? displayDescription;
  const componentPath = nativeFilter
    ? `/components/${component.name}?platform=native`
    : `/components/${component.name}`;
  const componentUrl = canonical(componentPath, locale);
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
            keywords: localizedComponent?.frontmatter.keywords,
            locale,
            name: component.name,
            platforms: component.platforms,
            title: articleTitle,
            url: componentUrl,
          }),
          techArticleLd({
            dateModified: registryGeneratedAt,
            description: articleDescription,
            image: ogImage,
            inLanguage: locale,
            keywords: localizedComponent?.frontmatter.keywords,
            title: articleTitle,
            url: componentUrl,
          }),
          ...(seoCopy?.faqs.length ? [faqPageLd(seoCopy.faqs)] : []),
          breadcrumbTrailLd(
            locale,
            [
              {
                name: common("components"),
                path: nativeFilter
                  ? "/components?platform=native"
                  : "/components",
              },
              { name: articleTitle, path: componentPath },
            ],
            common("home"),
          ),
        ])}
      />
      <PlatformSidebar
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
                      href: withPlatformQuery(
                        localizePathname("/", locale),
                        query,
                        platform,
                      ),
                      label: common("home"),
                    },
                    {
                      href: withPlatformQuery(
                        localizePathname("/components", locale),
                        query,
                        platform,
                      ),
                      label: common("components"),
                    },
                    ...(familyGroup
                      ? [
                          {
                            href: withPlatformQuery(
                              localizePathname(
                                familyPath(familyGroup.category),
                                locale,
                              ),
                              query,
                              platform,
                            ),
                            label: familyGroup.label,
                          },
                        ]
                      : []),
                    { label: articleTitle },
                  ]}
                />
                <h1 className="text-4xl font-semibold mb-2">{articleTitle}</h1>
                <p className="mb-4 text-lg text-muted-foreground">
                  {articleDescription}
                </p>
                <PlatformBadges
                  className="mb-4 flex flex-wrap items-center gap-2"
                  platforms={component.platforms}
                />
                <PlatformSelector className="mb-6 flex min-h-11 w-fit max-w-full items-center gap-1 overflow-x-auto rounded-md border border-border p-1" />
                {nativeFilter ? (
                  <p className="mb-6 max-w-3xl rounded-md border border-border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
                    {t(
                      supportsNative
                        ? "webPreviewNotice"
                        : "webPreviewOnlyNotice",
                    )}
                  </p>
                ) : null}
                <div className="flex flex-wrap items-center gap-3">
                  <QuickAdd componentName={component.name} />
                  <ShareEmbedBar
                    pageUrl={componentUrl}
                    slug={component.name}
                    title={articleTitle}
                  />
                  <Link
                    className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
                    href={withPlatformQuery(
                      `/report?component=${component.name}`,
                      query,
                      platform,
                    )}
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
                    href={withPlatformQuery("/families/ai", query, platform)}
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
                      href={withPlatformQuery(
                        familyPath(familyGroup.category),
                        query,
                        platform,
                      )}
                    >
                      {familyGroup.label}
                      <ExternalLink className="size-3" />
                    </Link>
                  ) : null}
                </div>
              ) : null}

              {nativeFilter ? (
                supportsNative ? (
                  <section
                    className="mb-8 rounded-lg border border-border bg-card p-6 scroll-mt-8"
                    id="native"
                  >
                    <h2 className="text-2xl font-semibold">
                      {t("nativeCapabilityTitle")}
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                      {t("nativeCapabilityDescription")}
                    </p>
                    <div
                      aria-disabled="true"
                      className="mt-6 rounded-md border border-dashed border-border bg-muted/30 p-4"
                    >
                      <p className="text-sm font-medium">
                        {t("nativeAvailableAfterCanary")}
                      </p>
                      <code className="mt-3 block overflow-x-auto font-mono text-sm text-muted-foreground">
                        {nativeRegistry.installation.command}
                      </code>
                    </div>
                    {component.native ? (
                      <dl className="mt-6 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
                        <div className="bg-background p-4">
                          <dt className="text-sm text-muted-foreground">
                            {t("nativeCompatibilityLabel")}
                          </dt>
                          <dd className="mt-1 font-medium">
                            {component.native.compatibility ===
                            "portable-options"
                              ? t("nativeCompatibilityPortable")
                              : t("nativeCompatibilityAdapted")}
                          </dd>
                        </div>
                        <div className="bg-background p-4">
                          <dt className="text-sm text-muted-foreground">
                            {t("nativeRequirementsLabel")}
                          </dt>
                          <dd className="mt-1 font-medium">
                            React {nativeRegistry.minimumReact}+ · React Native{" "}
                            {nativeRegistry.minimumReactNative}+
                          </dd>
                        </div>
                        <div className="bg-background p-4 sm:col-span-2">
                          <dt className="text-sm text-muted-foreground">
                            {t("nativeSourcePathLabel")}
                          </dt>
                          <dd className="mt-1 overflow-x-auto font-mono text-sm">
                            {component.native.source}
                          </dd>
                        </div>
                      </dl>
                    ) : null}
                    <h3 className="mt-6 text-lg font-semibold">
                      {t("nativeSourceTitle")}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t("nativeSourceDescription")}
                    </p>
                    <Link
                      className="mt-6 inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      href={withPlatformQuery("/docs/native", query, "native")}
                    >
                      {t("nativeReadGuide")}
                    </Link>
                  </section>
                ) : (
                  <section
                    className="mb-8 scroll-mt-8 rounded-lg border border-border bg-muted/30 p-6"
                    id="native"
                  >
                    <h2 className="text-2xl font-semibold">
                      {t("webOnlyTitle")}
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                      {t("webOnlyDescription")}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        className="inline-flex min-h-11 items-center rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        href={withPlatformQuery("/components", query, "native")}
                      >
                        {t("browseNativeCatalog")}
                      </Link>
                      <Link
                        className="inline-flex min-h-11 items-center rounded-md border border-border px-5 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        href={withPlatformQuery(
                          `/components/${component.name}`,
                          query,
                          "web",
                        )}
                      >
                        {t("viewWebComponent")}
                      </Link>
                    </div>
                  </section>
                )
              ) : null}

              {componentMdx ? (
                <MDXContent
                  components={mdxKit}
                  content={componentMdx.content}
                  enableMDX
                />
              ) : (
                <>
                  {meta?.defaultStoryId ? (
                    <PreviewPlaygroundTabs
                      componentName={component.name}
                      example={playgroundExample}
                      packageVersion={registryPackageVersion}
                      storyId={meta.defaultStoryId}
                    />
                  ) : null}

                  <div className="mb-8 scroll-mt-8" id="installation">
                    <h2 className="text-2xl font-semibold mb-4">
                      {t("installation")}
                    </h2>
                    <StaticCode code={installCommand} language="bash" />
                  </div>

                  {meta?.defaultStoryId ? (
                    <div className="mb-8 scroll-mt-8" id="storybook">
                      <h2 className="text-2xl font-semibold mb-4">
                        {t("storybook")}
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        {t("storybookDescription")}
                      </p>
                      <a
                        className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
                                className="inline-flex min-h-11 items-center rounded-md border px-3 text-sm transition-colors hover:bg-muted"
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
                        platform={platform}
                        query={query}
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
                url={withRef(componentUrl, "share")}
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
