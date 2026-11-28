import { MDXContent, ShareSection } from "@vllnt/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { buildComponentMdxKit } from "@/components/component-mdx";
import { PlatformSidebar } from "@/components/platform-sidebar";
import { type Locale, routing } from "@/i18n/routing";
import { getAiSeo } from "@/lib/ai-seo";
import { getComponentContent } from "@/lib/component-content";
import { componentMeta } from "@/lib/component-meta";
import { getComponentSeo } from "@/lib/component-seo";
import { pageMetadata } from "@/lib/og";
import { getPlatform } from "@/lib/platform";
import { findComponent, registry } from "@/lib/registry";
import { canonical } from "@/lib/seo";
import { oembedUrl, withRef } from "@/lib/share";
import {
  getCategoryForComponent,
  getSidebarSections,
  groupedComponents,
} from "@/lib/sidebar-sections";

import {
  buildComponentArticle,
  getComponentCopy,
  getRelatedComponents,
  loadComponentSources,
} from "./component-page-data";
import {
  ComponentFallbackSections,
  ComponentFaqSection,
  ComponentHeader,
  ComponentJsonLd,
  ComponentRelatedSection,
  ComponentSourceSection,
  ComponentToc,
  ComponentUsageBlock,
} from "./component-page-sections";

type Props = {
  params: Promise<{ locale: Locale; platform?: string; slug: string }>;
};

export const revalidate = 86_400;

/**
 * `generateStaticParams` below covers every component, so an unknown slug gets
 * a 404 that no cache stores. Without this flag, each unknown slug would render
 * once and keep its 404 for a day.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = registry.items.map((item) => item.name);

  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const component = findComponent(slug);

  if (!component) {
    return {};
  }

  const meta = componentMeta[slug];
  const category = getCategoryForComponent(slug);
  const aiSeo = getAiSeo(slug);
  const componentSeo = getComponentSeo(slug);
  const [componentMdx, t] = await Promise.all([
    getComponentContent(slug, locale),
    getTranslations({ locale, namespace: "pages.component" }),
  ]);
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
  const purposeDescription =
    handWrittenDescription ??
    componentMdx?.frontmatter.description ??
    meta?.description ??
    component.description ??
    title;
  const description = component.native
    ? t("nativeMetaDescription", { description: purposeDescription, title })
    : purposeDescription;
  const pathname = `/components/${slug}`;
  const ogTitle = component.native ? t("nativeMetaTitle", { title }) : title;

  return pageMetadata({
    alternates: {
      types: {
        "application/json+oembed": oembedUrl(canonical(pathname, locale)),
      },
    },
    description,
    keywords: componentMdx?.frontmatter.keywords,
    locale,
    og: { category, description, title: ogTitle, type: "component" },
    pathname,
    title: component.native
      ? ogTitle
      : (handWrittenTitle ?? `${title} - VLLNT UI`),
  });
}

export default async function ComponentPage(props: Props) {
  const { locale, platform: platformParameter, slug } = await props.params;
  setRequestLocale(locale);
  const component = findComponent(slug);

  if (!component) {
    notFound();
  }

  const category = getCategoryForComponent(slug);
  const [t, localized, sidebarSections] = await Promise.all([
    getTranslations("pages.component"),
    getComponentContent(slug, locale),
    getSidebarSections(category, locale),
  ]);
  const meta = componentMeta[slug];
  const platform = getPlatform(platformParameter, "all");
  const copy = getComponentCopy(slug, component, locale);
  const sources = await loadComponentSources(component, platform, {
    react: t("sourceReact"),
    reactNative: t("sourceReactNative"),
  });
  const installCommand =
    platform === "native" && component.native
      ? t("nativeSourceOnlyCommand")
      : `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/${component.name}.json`;
  const mdxKit = buildComponentMdxKit({
    component,
    hasSources: sources.length > 0,
    installCommand,
    sourceLinkLabel: t("viewSource"),
    storybookLabel: t("viewInStorybook"),
    storyId: meta?.defaultStoryId,
  });
  const familyGroup = groupedComponents.find(
    (group) => group.category === category,
  );
  const relatedComponents = getRelatedComponents({
    component,
    componentSeo: copy.componentSeo,
    familyGroup,
    platform,
  });
  const article = buildComponentArticle({
    category,
    component,
    copy,
    describeNative: (values) => t("nativeMetaDescription", values),
    locale,
    localized,
  });
  const faqs = copy.seoCopy?.faqs ?? [];

  return (
    <>
      <ComponentJsonLd
        article={article}
        component={component}
        faqs={faqs}
        locale={locale}
      />
      <PlatformSidebar platform={platform} sections={sidebarSections} />
      <div
        className="min-w-0 flex-1 overflow-x-hidden bg-background"
        data-pagefind-ignore={platformParameter === undefined ? undefined : ""}
        data-slot="page-content"
      >
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_200px] gap-8">
            <div className="min-w-0">
              <ComponentHeader
                article={article}
                component={component}
                familyGroup={familyGroup}
                locale={locale}
                platform={platform}
              />
              <ComponentUsageBlock
                familyGroup={familyGroup}
                platform={platform}
                seoCopy={copy.seoCopy}
                whenToUse={copy.whenToUse}
              />
              <ComponentSourceSection
                componentName={component.name}
                sources={sources}
                storyId={meta?.defaultStoryId}
              />
              {localized ? (
                <MDXContent
                  components={mdxKit}
                  content={localized.content}
                  enableMDX
                />
              ) : (
                <ComponentFallbackSections
                  component={component}
                  installCommand={installCommand}
                  meta={meta}
                />
              )}
              <ComponentRelatedSection
                locale={locale}
                platform={platform}
                slugs={relatedComponents}
              />
              <ComponentFaqSection faqs={faqs} />
              <ShareSection
                shareOn={t("shareOn")}
                shareTitle={t("shareTitle")}
                title={`${article.title} — VLLNT UI`}
                url={withRef(article.url, "share")}
              />
            </div>

            <ComponentToc
              hasFaq={faqs.length > 0}
              hasRelated={relatedComponents.length > 0}
              hasSources={sources.length > 0}
              hasStory={Boolean(meta?.defaultStoryId)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
