import type { MetadataRoute } from "next";

import registry from "../registry.json";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";

type RegistryItem = {
  readonly name: string;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/components`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/docs`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/philosophy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const items = (registry as { readonly items: readonly RegistryItem[] }).items;

  const componentRoutes: MetadataRoute.Sitemap = items.map((item) => ({
    url: `${SITE_URL}/components/${item.name}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const registryEndpoints: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/r/registry.json`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.3,
    },
    ...items.map((item) => ({
      url: `${SITE_URL}/r/${item.name}.json`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.3,
    })),
  ];

  return [...staticRoutes, ...componentRoutes, ...registryEndpoints];
}
