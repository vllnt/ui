import type { MetadataRoute } from "next";

import { locales } from "@/i18n/locales";
import { type Article, articleLocales, articlePath } from "@/lib/articles";
import { registry, type RegistryComponent } from "@/lib/registry";
import { canonical, languageAlternates } from "@/lib/seo";

import { getAiComponentSlugs } from "./ai-seo";
import { groupedComponents } from "./component-categories";
import { DOCS_PAGES, getDocsPath } from "./docs-pages";
import { getTemplatePath, TEMPLATES } from "./templates";
import { getUseCasePath, USE_CASES } from "./use-cases";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.com";

const AI_COMPONENT_SLUGS = new Set(getAiComponentSlugs());

type SitemapEntry = MetadataRoute.Sitemap[number];
type ChangeFrequency = NonNullable<SitemapEntry["changeFrequency"]>;
type LastModified = Date | string;
type SitemapEntryInput = {
  readonly alternates?: SitemapEntry["alternates"];
  readonly changeFrequency: ChangeFrequency;
  readonly lastModified: LastModified;
  readonly priority: number;
  readonly url: string;
};
type PageRouteInput = {
  readonly changeFrequency: ChangeFrequency;
  readonly lastModified?: LastModified;
  readonly path: string;
  readonly priority: number;
};

/**
 * What the sitemap needs from the build. Each date is a real date of the
 * content it dates; the build date serves as the fallback for a page without
 * one.
 */
export type SitemapInput = {
  /** Published articles, every locale. */
  readonly articles: readonly Article[];
  /** Date of this sitemap build. */
  readonly buildDate: Date;
  /** Date of the newest changelog release, for `/changelog` and `/releases`. */
  readonly changelogDate?: string;
  /** The registry stamp, for the component pages and the `/r/*.json` files. */
  readonly registryDate?: string;
};

function getRegistryItems(): readonly RegistryComponent[] {
  return registry.items;
}

function entry({
  alternates,
  changeFrequency,
  lastModified,
  priority,
  url,
}: SitemapEntryInput): SitemapEntry {
  return {
    ...(alternates ? { alternates } : {}),
    changeFrequency,
    lastModified,
    priority,
    url,
  };
}

/**
 * Expand a localizable page route into one sitemap entry per configured
 * locale so non-default locales (e.g. `/fr/*`) are crawlable. The default
 * locale stays unprefixed under the `as-needed` strategy.
 */
function localizedEntries(
  route: PageRouteInput,
  lastModified: LastModified,
): MetadataRoute.Sitemap {
  return locales.map((locale) =>
    entry({
      changeFrequency: route.changeFrequency,
      lastModified,
      priority: route.priority,
      url: canonical(route.path, locale),
    }),
  );
}

function staticRouteList(changelog: LastModified): readonly PageRouteInput[] {
  return [
    { changeFrequency: "weekly", path: "/", priority: 1 },
    { changeFrequency: "weekly", path: "/families", priority: 0.9 },
    { changeFrequency: "weekly", path: "/components", priority: 1 },
    { changeFrequency: "weekly", path: "/templates", priority: 0.8 },
    {
      changeFrequency: "weekly",
      lastModified: changelog,
      path: "/changelog",
      priority: 0.8,
    },
    { changeFrequency: "weekly", path: "/docs", priority: 0.8 },
    { changeFrequency: "monthly", path: "/vision", priority: 0.8 },
    { changeFrequency: "monthly", path: "/design", priority: 0.8 },
    {
      changeFrequency: "weekly",
      lastModified: changelog,
      path: "/releases",
      priority: 0.8,
    },
    { changeFrequency: "monthly", path: "/vs", priority: 0.7 },
    { changeFrequency: "monthly", path: "/vs/shadcn", priority: 0.7 },
    { changeFrequency: "monthly", path: "/vs/vercel-ai-sdk", priority: 0.7 },
    { changeFrequency: "monthly", path: "/vs/assistant-ui", priority: 0.7 },
    { changeFrequency: "monthly", path: "/themes", priority: 0.7 },
    { changeFrequency: "monthly", path: "/request-component", priority: 0.4 },
    { changeFrequency: "monthly", path: "/report", priority: 0.4 },
  ];
}

/**
 * The catalog and installation pages also exist as `?platform=native`
 * variants, which are not listed: a sitemap lists clean URLs, and the
 * `/p/<platform>/...` copies are private routes that the middleware redirects
 * back to the query form, so no clean URL stands in for them.
 */
function staticRoutes({
  buildDate,
  changelogDate,
}: SitemapInput): MetadataRoute.Sitemap {
  const changelog = changelogDate ?? buildDate;

  return staticRouteList(changelog).flatMap((route) =>
    localizedEntries(route, route.lastModified ?? buildDate),
  );
}

function familyRoutes({ buildDate }: SitemapInput): MetadataRoute.Sitemap {
  return groupedComponents.flatMap((group) =>
    localizedEntries(
      {
        changeFrequency: "weekly",
        path: `/families/${group.category}`,
        priority: group.category === "ai" ? 0.9 : 0.7,
      },
      buildDate,
    ),
  );
}

/**
 * `/docs/changelog` permanently redirects to `/changelog`, which the sitemap
 * already lists, so the sitemap leaves out the 3xx URL.
 */
function docsRoutes({ buildDate }: SitemapInput): MetadataRoute.Sitemap {
  return DOCS_PAGES.filter((page) => page.slug !== "changelog").flatMap(
    (page) =>
      localizedEntries(
        {
          changeFrequency: "monthly",
          path: getDocsPath(page),
          priority: 0.75,
        },
        buildDate,
      ),
  );
}

function templateRoutes({ buildDate }: SitemapInput): MetadataRoute.Sitemap {
  return TEMPLATES.flatMap((template) =>
    localizedEntries(
      {
        changeFrequency: "weekly",
        path: getTemplatePath(template),
        priority: 0.7,
      },
      buildDate,
    ),
  );
}

function buildGuideRoutes({ buildDate }: SitemapInput): MetadataRoute.Sitemap {
  return USE_CASES.flatMap((useCase) =>
    localizedEntries(
      {
        changeFrequency: "monthly",
        path: getUseCasePath(useCase),
        priority: 0.8,
      },
      buildDate,
    ),
  );
}

/**
 * A component page comes from its registry item, and its JSON-LD already
 * reports the registry stamp as `dateModified`, so the sitemap reports the same.
 * Crawl budget concentrates on the AI wedge: AI components rank higher than
 * generic clones, which sit below the default.
 */
function componentRoutes({
  buildDate,
  registryDate,
}: SitemapInput): MetadataRoute.Sitemap {
  return getRegistryItems().flatMap((item) =>
    localizedEntries(
      {
        changeFrequency: "weekly",
        path: `/components/${item.name}`,
        priority: AI_COMPONENT_SLUGS.has(item.name) ? 0.85 : 0.6,
      },
      registryDate ?? buildDate,
    ),
  );
}

function articleIndexRoutes(
  articles: readonly Article[],
): MetadataRoute.Sitemap {
  return locales.flatMap((locale) => {
    const [newest] = articles
      .filter((article) => article.locale === locale)
      .map((article) => article.frontmatter.updated)
      .sort()
      .reverse();

    return newest
      ? [
          entry({
            alternates: { languages: languageAlternates("/articles") },
            changeFrequency: "weekly",
            lastModified: newest,
            priority: 0.7,
            url: canonical("/articles", locale),
          }),
        ]
      : [];
  });
}

function articlePageRoutes(
  articles: readonly Article[],
): MetadataRoute.Sitemap {
  return articles.map((article) =>
    entry({
      alternates: {
        languages: languageAlternates(
          articlePath(article.slug),
          articleLocales(articles, article.slug),
        ),
      },
      changeFrequency: "monthly",
      lastModified: article.frontmatter.updated,
      priority: 0.7,
      url: canonical(articlePath(article.slug), article.locale),
    }),
  );
}

/**
 * The `/articles` index of each locale that has an article, dated by its newest
 * update, and every article page with its own `updated` date and the hreflang
 * alternates of the locales it exists in. An empty collection lists nothing.
 */
function articleRoutes({ articles }: SitemapInput): MetadataRoute.Sitemap {
  return [...articleIndexRoutes(articles), ...articlePageRoutes(articles)];
}

const REGISTRY_FILES = [
  { changeFrequency: "weekly", path: "/r/registry.json", priority: 0.3 },
  { changeFrequency: "weekly", path: "/r/native/registry.json", priority: 0.3 },
  { changeFrequency: "monthly", path: "/r/design.json", priority: 0.3 },
] as const;

function registryFileRoutes(stamp: LastModified): MetadataRoute.Sitemap {
  return REGISTRY_FILES.map((file) =>
    entry({
      changeFrequency: file.changeFrequency,
      lastModified: stamp,
      priority: file.priority,
      url: `${SITE_URL}${file.path}`,
    }),
  );
}

/**
 * The `/r/*.json` files carry the registry stamp themselves, so that stamp is
 * their date. `/DESIGN.md` has no date of its own.
 */
function registryRoutes({
  buildDate,
  registryDate,
}: SitemapInput): MetadataRoute.Sitemap {
  const stamp = registryDate ?? buildDate;

  return [
    ...registryFileRoutes(stamp),
    entry({
      changeFrequency: "monthly",
      lastModified: buildDate,
      priority: 0.3,
      url: `${SITE_URL}/DESIGN.md`,
    }),
    ...getRegistryItems().map((item) =>
      entry({
        changeFrequency: "weekly",
        lastModified: stamp,
        priority: 0.3,
        url: `${SITE_URL}/r/${item.name}.json`,
      }),
    ),
  ];
}

/**
 * The newest dated entry of a changelog.
 *
 * @param entries - changelog entries; an undated one (Unreleased) does not count
 * @returns The newest date, or `undefined` when no entry has one
 */
export function latestChangelogDate(
  entries: readonly { readonly date?: string }[],
): string | undefined {
  const [latest] = entries
    .flatMap((item) => (item.date ? [item.date] : []))
    .sort()
    .reverse();

  return latest;
}

/**
 * Every public URL of the site. The pages that have a date of their own report
 * it (an article's `updated`, the newest release for the changelog and release
 * pages, the registry stamp for components and registry files); the others
 * report the build date, so each deploy differs from the last.
 *
 * @param input - published articles and the dates of the build
 * @returns Sitemap entries
 */
export function buildSitemap(input: SitemapInput): MetadataRoute.Sitemap {
  return [
    ...staticRoutes(input),
    ...articleRoutes(input),
    ...familyRoutes(input),
    ...docsRoutes(input),
    ...templateRoutes(input),
    ...buildGuideRoutes(input),
    ...componentRoutes(input),
    ...registryRoutes(input),
  ];
}
