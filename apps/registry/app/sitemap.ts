import type { MetadataRoute } from "next";

import { getPublishedArticles } from "@/lib/articles";
import { getChangelogEntries } from "@/lib/changelog";
import { buildSitemap, latestChangelogDate } from "@/lib/sitemap";
import { getRegistryGeneratedAt } from "@/lib/stats";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, changelog] = await Promise.all([
    getPublishedArticles(),
    getChangelogEntries(),
  ]);

  return buildSitemap({
    articles,
    buildDate: new Date(),
    changelogDate: latestChangelogDate(changelog),
    registryDate: getRegistryGeneratedAt(),
  });
}
