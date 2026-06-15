import packageJson from "../../../packages/ui/package.json";

import { getRegistry, getRegistryItems } from "@/lib/registry";

import type { RegistryComponent } from "@/types/registry";

export function getComponentCount(): number {
  return getRegistryItems().length;
}

export function getLibraryVersion(): string {
  return getRegistry().version ?? packageJson.version;
}

export function getRegistryGeneratedAt(): string | undefined {
  return getRegistry().generatedAt;
}

type CategoryStat = {
  readonly category: string;
  readonly count: number;
};

function getCategoryStats(): readonly CategoryStat[] {
  const counts = new Map<string, number>();
  for (const item of getRegistryItems()) {
    const key = item.category ?? "uncategorized";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

export function getCategoryCount(): number {
  return getCategoryStats().length;
}

export function getFeaturedComponents(): readonly RegistryComponent[] {
  const featuredSlugs = [
    "button",
    "data-table",
    "ai-chat-input",
    "combobox",
    "timeline",
    "globe-3d",
  ];
  return featuredSlugs
    .map((slug) => getRegistryItems().find((item) => item.name === slug))
    .filter((item): item is RegistryComponent => item !== undefined);
}
