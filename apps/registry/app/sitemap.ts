import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { canonical } from "@/lib/seo";

import { getAiComponentSlugs } from "../lib/ai-seo";
import { DOCS_PAGES, getDocsPath } from "../lib/docs-pages";
import { getTemplatePath, TEMPLATES } from "../lib/templates";
import { getUseCasePath, USE_CASES } from "../lib/use-cases";
import registry from "../registry.json";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";

const AI_COMPONENT_SLUGS = new Set(getAiComponentSlugs());

type RegistryItem = {
  readonly name: string;
};

type SitemapEntry = MetadataRoute.Sitemap[number];
type ChangeFrequency = NonNullable<SitemapEntry["changeFrequency"]>;
type SitemapEntryInput = {
  readonly changeFrequency: ChangeFrequency;
  readonly lastModified: Date;
  readonly priority: number;
  readonly url: string;
};
type PageRouteInput = {
  readonly changeFrequency: ChangeFrequency;
  readonly path: string;
  readonly priority: number;
};

function getRegistryItems(): readonly RegistryItem[] {
  return (registry as { readonly items: readonly RegistryItem[] }).items;
}

function entry({
  changeFrequency,
  lastModified,
  priority,
  url,
}: SitemapEntryInput): SitemapEntry {
  return { changeFrequency, lastModified, priority, url };
}

/**
 * Expand a localizable page route into one sitemap entry per configured
 * locale so non-default locales (e.g. `/fr/*`) are crawlable. The default
 * locale stays unprefixed under the `as-needed` strategy.
 */
function localizedEntries(
  route: PageRouteInput,
  lastModified: Date,
): MetadataRoute.Sitemap {
  return routing.locales.map((locale) =>
    entry({
      changeFrequency: route.changeFrequency,
      lastModified,
      priority: route.priority,
      url: canonical(route.path, locale),
    }),
  );
}

function staticRoutes(lastModified: Date): MetadataRoute.Sitemap {
  const routes = [
    { changeFrequency: "weekly", path: "/", priority: 1 },
    { changeFrequency: "weekly", path: "/ai", priority: 0.9 },
    { changeFrequency: "weekly", path: "/components", priority: 1 },
    { changeFrequency: "weekly", path: "/templates", priority: 0.8 },
    { changeFrequency: "weekly", path: "/changelog", priority: 0.8 },
    { changeFrequency: "weekly", path: "/docs", priority: 0.8 },
    { changeFrequency: "monthly", path: "/philosophy", priority: 0.6 },
    { changeFrequency: "monthly", path: "/design", priority: 0.8 },
    { changeFrequency: "weekly", path: "/releases", priority: 0.8 },
    { changeFrequency: "monthly", path: "/vs/shadcn", priority: 0.7 },
    { changeFrequency: "monthly", path: "/vs/vercel-ai-sdk", priority: 0.7 },
    { changeFrequency: "monthly", path: "/vs/assistant-ui", priority: 0.7 },
  ] satisfies readonly PageRouteInput[];

  return routes.flatMap((route) => localizedEntries(route, lastModified));
}

function docsRoutes(lastModified: Date): MetadataRoute.Sitemap {
  return DOCS_PAGES.flatMap((page) =>
    localizedEntries(
      {
        changeFrequency: "monthly",
        path: getDocsPath(page),
        priority: 0.75,
      },
      lastModified,
    ),
  );
}

function templateRoutes(lastModified: Date): MetadataRoute.Sitemap {
  return TEMPLATES.flatMap((template) =>
    localizedEntries(
      {
        changeFrequency: "weekly",
        path: getTemplatePath(template),
        priority: 0.7,
      },
      lastModified,
    ),
  );
}

function buildGuideRoutes(lastModified: Date): MetadataRoute.Sitemap {
  return USE_CASES.flatMap((useCase) =>
    localizedEntries(
      {
        changeFrequency: "monthly",
        path: getUseCasePath(useCase),
        priority: 0.8,
      },
      lastModified,
    ),
  );
}

function componentRoutes(
  items: readonly RegistryItem[],
  lastModified: Date,
): MetadataRoute.Sitemap {
  // Concentrate crawl budget on the AI wedge: AI components rank higher than
  // generic clones, which sit below the default.
  return items.flatMap((item) =>
    localizedEntries(
      {
        changeFrequency: "weekly",
        path: `/components/${item.name}`,
        priority: AI_COMPONENT_SLUGS.has(item.name) ? 0.85 : 0.6,
      },
      lastModified,
    ),
  );
}

function registryRoutes(
  items: readonly RegistryItem[],
  lastModified: Date,
): MetadataRoute.Sitemap {
  const rawRoutes = [
    {
      changeFrequency: "weekly",
      priority: 0.3,
      url: `${SITE_URL}/r/registry.json`,
    },
    {
      changeFrequency: "monthly",
      priority: 0.3,
      url: `${SITE_URL}/r/design.json`,
    },
    { changeFrequency: "monthly", priority: 0.3, url: `${SITE_URL}/DESIGN.md` },
  ] satisfies readonly Omit<SitemapEntryInput, "lastModified">[];

  return [
    ...rawRoutes.map((route) => entry({ ...route, lastModified })),
    ...items.map((item) =>
      entry({
        changeFrequency: "weekly",
        lastModified,
        priority: 0.3,
        url: `${SITE_URL}/r/${item.name}.json`,
      }),
    ),
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const items = getRegistryItems();

  return [
    ...staticRoutes(lastModified),
    ...docsRoutes(lastModified),
    ...templateRoutes(lastModified),
    ...buildGuideRoutes(lastModified),
    ...componentRoutes(items, lastModified),
    ...registryRoutes(items, lastModified),
  ];
}
