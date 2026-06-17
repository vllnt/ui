import { registry, type RegistryComponent } from "@/lib/registry";

import packageJson from "../../../packages/ui/package.json";

const PACKAGE = packageJson as { readonly version: string };

export function getComponentCount(): number {
  return registry.items.length;
}

export function getLibraryVersion(): string {
  return registry.version ?? PACKAGE.version;
}

export function getRegistryGeneratedAt(): string | undefined {
  return registry.generatedAt;
}

type CategoryStat = {
  readonly category: string;
  readonly count: number;
};

function getCategoryStats(): readonly CategoryStat[] {
  const counts = registry.items.reduce((accumulator, item) => {
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
    .map((slug) => registry.items.find((item) => item.name === slug))
    .filter((item): item is RegistryComponent => item !== undefined);
}
