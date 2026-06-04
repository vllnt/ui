import type { MetadataRoute } from "next";

import { DOCS_PAGES, getDocsPath } from "../lib/docs-pages";
import registry from "../registry.json";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";

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

function staticRoutes(lastModified: Date): MetadataRoute.Sitemap {
  const routes = [
    { changeFrequency: "weekly", priority: 1, url: SITE_URL },
    { changeFrequency: "weekly", priority: 1, url: `${SITE_URL}/components` },
    { changeFrequency: "weekly", priority: 0.8, url: `${SITE_URL}/changelog` },
    { changeFrequency: "weekly", priority: 0.8, url: `${SITE_URL}/docs` },
    {
      changeFrequency: "monthly",
      priority: 0.6,
      url: `${SITE_URL}/philosophy`,
    },
    { changeFrequency: "monthly", priority: 0.8, url: `${SITE_URL}/design` },
    { changeFrequency: "weekly", priority: 0.8, url: `${SITE_URL}/releases` },
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

function componentRoutes(
  items: readonly RegistryItem[],
  lastModified: Date,
): MetadataRoute.Sitemap {
  return items.map((item) =>
    entry({
      changeFrequency: "weekly",
      lastModified,
      priority: 0.7,
      url: `${SITE_URL}/components/${item.name}`,
    }),
  );
}

function registryRoutes(
  items: readonly RegistryItem[],
  lastModified: Date,
): MetadataRoute.Sitemap {
  return [
    entry({
      changeFrequency: "weekly",
      lastModified,
      priority: 0.3,
      url: `${SITE_URL}/r/registry.json`,
    }),
    entry({
      changeFrequency: "monthly",
      lastModified,
      priority: 0.3,
      url: `${SITE_URL}/r/design.json`,
    }),
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
    ...componentRoutes(items, lastModified),
    ...registryRoutes(items, lastModified),
  ];
}
