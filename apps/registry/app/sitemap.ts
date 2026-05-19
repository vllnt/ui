/* eslint-disable max-lines-per-function */

import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { canonical, languageAlternates } from "@/lib/seo";

import registry from "../registry.json";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";

type RegistryItem = {
  readonly name: string;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPaths = [
    { changeFrequency: "weekly" as const, pathname: "/", priority: 1 },
    {
      changeFrequency: "weekly" as const,
      pathname: "/components",
      priority: 1,
    },
    { changeFrequency: "weekly" as const, pathname: "/docs", priority: 0.8 },
    {
      changeFrequency: "monthly" as const,
      pathname: "/philosophy",
      priority: 0.6,
    },
    { changeFrequency: "monthly" as const, pathname: "/vs", priority: 0.5 },
    {
      changeFrequency: "monthly" as const,
      pathname: "/vs/shadcn",
      priority: 0.5,
    },
  ];

  const staticRoutes: MetadataRoute.Sitemap = staticPaths.flatMap((route) =>
    routing.locales.map((locale) => ({
      alternates: { languages: languageAlternates(route.pathname) },
      changeFrequency: route.changeFrequency,
      lastModified,
      priority: route.priority,
      url: canonical(route.pathname, locale),
    })),
  );

  const items = (registry as { readonly items: readonly RegistryItem[] }).items;

  const componentRoutes: MetadataRoute.Sitemap = items.flatMap((item) =>
    routing.locales.map((locale) => ({
      alternates: {
        languages: languageAlternates(`/components/${item.name}`),
      },
      changeFrequency: "weekly" as const,
      lastModified,
      priority: 0.7,
      url: canonical(`/components/${item.name}`, locale),
    })),
  );

  const registryEndpoints: MetadataRoute.Sitemap = [
    {
      changeFrequency: "weekly",
      lastModified,
      priority: 0.3,
      url: `${SITE_URL}/r/registry.json`,
    },
    ...items.map((item) => ({
      changeFrequency: "weekly" as const,
      lastModified,
      priority: 0.3,
      url: `${SITE_URL}/r/${item.name}.json`,
    })),
  ];

  return [...staticRoutes, ...componentRoutes, ...registryEndpoints];
}
