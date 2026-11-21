import { Breadcrumb, StaticCode, TableOfContents } from "@vllnt/ui";
import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { ComponentCard } from "@/components/component-card";
import {
  type ComponentSource,
  ComponentSourceCode,
} from "@/components/component-source-code";
import { PlatformBadges } from "@/components/platform-badges";
import { PlatformComparison } from "@/components/platform-comparison";
import { PreviewPlaygroundTabs } from "@/components/playground";
import { QuickAdd } from "@/components/quick-add";
import { ShareEmbedBar } from "@/components/share-embed-bar";
import { Link, type Locale } from "@/i18n/routing";
import type { ComponentMeta } from "@/lib/component-meta";
import type { ComponentFaq, ComponentSeo } from "@/lib/component-seo";
import {
  breadcrumbTrailLd,
  faqPageLd,
  jsonLdScriptAttributes,
  softwareSourceCodeLd,
  techArticleLd,
} from "@/lib/jsonld";
import {
  type PlatformContext,
  variantQuery,
  withPlatformQuery,
} from "@/lib/platform";
import type { RegistryComponent } from "@/lib/registry";
import { localizePathname } from "@/lib/seo";
import { familyPath } from "@/lib/sidebar-sections";
import { getRegistryGeneratedAt } from "@/lib/stats";

import type { ComponentArticle, FamilyGroup } from "./component-page-data";

const STORYBOOK_URL =
  process.env.NEXT_PUBLIC_STORYBOOK_URL ?? "http://localhost:6006";

const USAGE_LINK_CLASS =
  "mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground underline";

/*
 * The sections of a component page. Each async section resolves its own
 * translations, so the page decides which sections to render.
 */

export async function ComponentJsonLd({
  article,
  component,
  faqs,
  locale,
}: {
  readonly article: ComponentArticle;
  readonly component: RegistryComponent;
  readonly faqs: readonly ComponentFaq[];
  readonly locale: Locale;
}) {
  const common = await getTranslations("common");

  return (
    <script
      {...jsonLdScriptAttributes([
        softwareSourceCodeLd({
          description: article.description,
          image: article.ogImage,
          keywords: article.keywords,
          locale,
          name: component.name,
          platforms: component.platforms,
          title: article.title,
        }),
        techArticleLd({
          dateModified: getRegistryGeneratedAt(),
          description: article.description,
          image: article.ogImage,
          inLanguage: locale,
          keywords: article.keywords,
          title: article.title,
          url: article.url,
        }),
        ...(faqs.length > 0 ? [faqPageLd(faqs)] : []),
        breadcrumbTrailLd(
          locale,
          [
            { name: common("components"), path: "/components" },
            { name: article.title, path: article.path },
          ],
          common("home"),
        ),
      ])}
    />
  );
}

async function ComponentBreadcrumb({
  familyGroup,
  locale,
  platform,
  title,
}: {
  readonly familyGroup?: FamilyGroup;
  readonly locale: Locale;
  readonly platform: PlatformContext;
  readonly title: string;
}) {
  const common = await getTranslations("common");
  const withPlatform = (href: string) =>
    withPlatformQuery(href, variantQuery(platform), platform);

  return (
    <Breadcrumb
      className="mb-4 text-muted-foreground"
      items={[
        {
          href: withPlatform(localizePathname("/", locale)),
          label: common("home"),
        },
        {
          href: withPlatform(localizePathname("/components", locale)),
          label: common("components"),
        },
        ...(familyGroup
          ? [
              {
                href: withPlatform(
                  localizePathname(familyPath(familyGroup.category), locale),
                ),
                label: familyGroup.label,
              },
            ]
          : []),
        { label: title },
      ]}
    />
  );
}

export async function ComponentHeader({
  article,
  component,
  familyGroup,
  locale,
  platform,
}: {
  readonly article: ComponentArticle;
  readonly component: RegistryComponent;
  readonly familyGroup?: FamilyGroup;
  readonly locale: Locale;
  readonly platform: PlatformContext;
}) {
  const t = await getTranslations("pages.component");
  const withPlatform = (href: string) =>
    withPlatformQuery(href, variantQuery(platform), platform);

  return (
    <div className="mb-8">
      <ComponentBreadcrumb
        familyGroup={familyGroup}
        locale={locale}
        platform={platform}
        title={article.title}
      />
      <h1 className="text-4xl font-semibold mb-2">{article.title}</h1>
      <p className="mb-4 text-lg text-muted-foreground">
        {article.description}
      </p>
      <PlatformBadges
        className="mb-4 flex flex-wrap items-center gap-2"
        platforms={component.platforms}
      />
      <div className="flex flex-wrap items-center gap-3">
        <QuickAdd componentName={component.name} platform={platform} />
        <ShareEmbedBar
          pageUrl={article.url}
          slug={component.name}
          title={article.title}
        />
        <Link
          className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-secondary"
          href={withPlatform(`/report?component=${component.name}`)}
        >
          {t("reportBug")}
        </Link>
      </div>
    </div>
  );
}

function UsageCard({
  link,
  platform,
  text,
  title,
}: {
  readonly link?: { readonly href: string; readonly label: string };
  readonly platform: PlatformContext;
  readonly text: string;
  readonly title: string;
}) {
  return (
    <div className="mb-8 rounded-lg border border-border bg-muted/30 p-6">
      <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <p className="mt-3 text-base leading-relaxed">{text}</p>
      {link ? (
        <Link
          className={USAGE_LINK_CLASS}
          href={withPlatformQuery(link.href, variantQuery(platform), platform)}
        >
          {link.label}
          <ExternalLink className="size-3" />
        </Link>
      ) : null}
    </div>
  );
}

/**
 * "When to use in an AI app" for AI components, otherwise the usage block for
 * components that have hand-written copy.
 */
export async function ComponentUsageBlock({
  familyGroup,
  platform,
  seoCopy,
  whenToUse,
}: {
  readonly familyGroup?: FamilyGroup;
  readonly platform: PlatformContext;
  readonly seoCopy?: ComponentSeo;
  readonly whenToUse?: string;
}) {
  const t = await getTranslations("pages.component");

  if (whenToUse) {
    return (
      <UsageCard
        link={{ href: "/families/ai", label: t("browseAiComponents") }}
        platform={platform}
        text={whenToUse}
        title={t("whenToUseTitle")}
      />
    );
  }

  if (seoCopy?.whatItIs) {
    return (
      <UsageCard
        link={
          familyGroup
            ? {
                href: familyPath(familyGroup.category),
                label: familyGroup.label,
              }
            : undefined
        }
        platform={platform}
        text={seoCopy.whatItIs}
        title={t("whatItIsTitle")}
      />
    );
  }

  return null;
}

/** The live preview with its source tab, or the source block on its own. */
export async function ComponentSourceSection({
  componentName,
  sources,
  storyId,
}: {
  readonly componentName: string;
  readonly sources: readonly ComponentSource[];
  readonly storyId?: string;
}) {
  const t = await getTranslations("pages.component");
  const code =
    sources.length > 0 ? (
      <ComponentSourceCode
        label={t("sourceImplementationLabel")}
        sources={sources}
      />
    ) : null;

  if (storyId) {
    return (
      <PreviewPlaygroundTabs
        code={code}
        componentName={componentName}
        storyId={storyId}
      />
    );
  }

  return code ? (
    <div className="mb-8 scroll-mt-8" id="code">
      {code}
    </div>
  ) : null;
}

async function StorybookLinks({
  defaultStoryId,
  stories,
}: {
  readonly defaultStoryId: string;
  readonly stories: ComponentMeta["stories"];
}) {
  const t = await getTranslations("pages.component");

  return (
    <div className="mb-8 scroll-mt-8" id="storybook">
      <h2 className="text-2xl font-semibold mb-4">{t("storybook")}</h2>
      <p className="text-muted-foreground mb-4">{t("storybookDescription")}</p>
      <a
        className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        href={`${STORYBOOK_URL}/?path=/story/${defaultStoryId}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        {t("viewInStorybook")}
        <ExternalLink className="size-4" />
      </a>
      {stories.length > 1 ? (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">
            {t("storiesAvailable", { count: stories.length })}
          </p>
          <div className="flex flex-wrap gap-2">
            {stories.map((story) => (
              <a
                className="inline-flex min-h-11 items-center rounded-md border px-3 text-sm transition-colors hover:bg-secondary"
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
  );
}

/** The page body for a component that has no localized MDX content. */
export async function ComponentFallbackSections({
  component,
  installCommand,
  meta,
}: {
  readonly component: RegistryComponent;
  readonly installCommand: string;
  readonly meta?: ComponentMeta;
}) {
  const t = await getTranslations("pages.component");

  return (
    <>
      <PlatformComparison component={component} />

      <div className="mb-8 scroll-mt-8" id="installation">
        <h2 className="text-2xl font-semibold mb-4">{t("installation")}</h2>
        <StaticCode code={installCommand} language="bash" />
      </div>

      {meta?.defaultStoryId ? (
        <StorybookLinks
          defaultStoryId={meta.defaultStoryId}
          stories={meta.stories}
        />
      ) : null}
    </>
  );
}

export async function ComponentRelatedSection({
  locale,
  platform,
  slugs,
}: {
  readonly locale: Locale;
  readonly platform: PlatformContext;
  readonly slugs: readonly string[];
}) {
  if (slugs.length === 0) return null;

  const t = await getTranslations("pages.component");
  const query = variantQuery(platform);

  return (
    <section className="mb-8 scroll-mt-8" id="related">
      <h2 className="text-2xl font-semibold mb-4">{t("related")}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {slugs.map((relatedSlug) => (
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
  );
}

export async function ComponentFaqSection({
  faqs,
}: {
  readonly faqs: readonly ComponentFaq[];
}) {
  if (faqs.length === 0) return null;

  const t = await getTranslations("pages.component");

  return (
    <section className="mb-8 scroll-mt-8" id="faq">
      <h2 className="text-2xl font-semibold mb-4">{t("faq")}</h2>
      <dl className="space-y-6">
        {faqs.map((faq) => (
          <div key={faq.question}>
            <dt className="font-medium">{faq.question}</dt>
            <dd className="mt-2 text-muted-foreground">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** "On this page" lists the sections the page renders. */
export async function ComponentToc({
  hasFaq,
  hasRelated,
  hasSources,
  hasStory,
}: {
  readonly hasFaq: boolean;
  readonly hasRelated: boolean;
  readonly hasSources: boolean;
  readonly hasStory: boolean;
}) {
  const [t, shared] = await Promise.all([
    getTranslations("pages.component"),
    getTranslations("shared"),
  ]);
  const candidates = [
    { id: "preview", show: hasStory, title: t("preview") },
    { id: "platform-comparison", show: true, title: t("platformComparison") },
    { id: "installation", show: true, title: t("installation") },
    { id: "code", show: hasSources && !hasStory, title: t("code") },
    { id: "storybook", show: hasStory, title: t("storybook") },
    { id: "related", show: hasRelated, title: t("related") },
    { id: "faq", show: hasFaq, title: t("faq") },
  ];
  const sections = candidates
    .filter((candidate) => candidate.show)
    .map(({ id, title }) => ({ id, title }));

  return <TableOfContents label={shared("onThisPage")} sections={sections} />;
}
