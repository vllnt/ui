import { getRegistry, getRegistryItems } from "@/lib/registry";
import type { RegistryComponent } from "@/types/registry";

import packageJson from "../../../packages/ui/package.json";

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
  const counts = getRegistryItems().reduce((accumulator, item) => {
    const key = item.category ?? "uncategorized";
    return accumulator.set(key, (accumulator.get(key) ?? 0) + 1);
  }, new Map<string, number>());
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
