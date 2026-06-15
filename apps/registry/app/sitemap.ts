import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";
import type { RegistryComponent } from "@/types/registry";

import { getAiComponentSlugs } from "../lib/ai-seo";
import { DOCS_PAGES, getDocsPath } from "../lib/docs-pages";
import { getRegistryItems } from "../lib/registry";
import { getTemplatePath, TEMPLATES } from "../lib/templates";
import { getUseCasePath, USE_CASES } from "../lib/use-cases";

const AI_COMPONENT_SLUGS = new Set(getAiComponentSlugs());

type SitemapEntry = MetadataRoute.Sitemap[number];
type ChangeFrequency = NonNullable<SitemapEntry["changeFrequency"]>;
type SitemapEntryInput = {
  readonly changeFrequency: ChangeFrequency;
  readonly lastModified: Date;
  readonly priority: number;
  readonly url: string;
};

function entry({
  changeFrequency,
  lastModified,
  priority,
  url,
}: SitemapEntryInput): SitemapEntry {
  return { changeFrequency, lastModified, priority, url };
}

function staticRoutes(lastModified: Date): MetadataRoute.Sitemap {
  const routes = [
    { changeFrequency: "weekly", priority: 1, url: SITE_URL },
    { changeFrequency: "weekly", priority: 0.9, url: `${SITE_URL}/ai` },
    { changeFrequency: "weekly", priority: 1, url: `${SITE_URL}/components` },
    { changeFrequency: "weekly", priority: 0.8, url: `${SITE_URL}/templates` },
    { changeFrequency: "weekly", priority: 0.8, url: `${SITE_URL}/changelog` },
    { changeFrequency: "weekly", priority: 0.8, url: `${SITE_URL}/docs` },
    {
      changeFrequency: "monthly",
      priority: 0.6,
      url: `${SITE_URL}/philosophy`,
    },
    { changeFrequency: "monthly", priority: 0.8, url: `${SITE_URL}/design` },
    { changeFrequency: "weekly", priority: 0.8, url: `${SITE_URL}/releases` },
    { changeFrequency: "monthly", priority: 0.7, url: `${SITE_URL}/vs/shadcn` },
    {
      changeFrequency: "monthly",
      priority: 0.7,
      url: `${SITE_URL}/vs/vercel-ai-sdk`,
    },
    {
      changeFrequency: "monthly",
      priority: 0.7,
      url: `${SITE_URL}/vs/assistant-ui`,
    },
  ] satisfies readonly Omit<SitemapEntryInput, "lastModified">[];

  return routes.map((route) => entry({ ...route, lastModified }));
}

function docsRoutes(lastModified: Date): MetadataRoute.Sitemap {
  return DOCS_PAGES.map((page) =>
    entry({
      changeFrequency: "monthly",
      lastModified,
      priority: 0.75,
      url: `${SITE_URL}${getDocsPath(page)}`,
    }),
  );
}

function templateRoutes(lastModified: Date): MetadataRoute.Sitemap {
  return TEMPLATES.map((template) =>
    entry({
      changeFrequency: "weekly",
      lastModified,
      priority: 0.7,
      url: `${SITE_URL}${getTemplatePath(template)}`,
    }),
  );
}

function buildGuideRoutes(lastModified: Date): MetadataRoute.Sitemap {
  return USE_CASES.map((useCase) =>
    entry({
      changeFrequency: "monthly",
      lastModified,
      priority: 0.8,
      url: `${SITE_URL}${getUseCasePath(useCase)}`,
    }),
  );
}

function componentRoutes(
  items: readonly RegistryComponent[],
  lastModified: Date,
): MetadataRoute.Sitemap {
  // Concentrate crawl budget on the AI wedge: AI components rank higher than
  // generic clones, which sit below the default.
  return items.map((item) =>
    entry({
      changeFrequency: "weekly",
      lastModified,
      priority: AI_COMPONENT_SLUGS.has(item.name) ? 0.85 : 0.6,
      url: `${SITE_URL}/components/${item.name}`,
    }),
  );
}

function registryRoutes(
  items: readonly RegistryComponent[],
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
