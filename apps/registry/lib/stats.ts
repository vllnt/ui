import packageJson from "../../../packages/ui/package.json";
import registry from "../registry.json";

type RegistryItem = {
  readonly category?: string;
  readonly name: string;
};

type Registry = {
  readonly generatedAt?: string;
  readonly items: readonly RegistryItem[];
  readonly version?: string;
};

const REGISTRY = registry as Registry;
const PACKAGE = packageJson as { readonly version: string };

export function getComponentCount(): number {
  return REGISTRY.items.length;
}

export function getLibraryVersion(): string {
  return REGISTRY.version ?? PACKAGE.version;
}

export function getRegistryGeneratedAt(): string | undefined {
  return REGISTRY.generatedAt;
}

export type CategoryStat = {
  readonly category: string;
  readonly count: number;
};

export function getCategoryStats(): readonly CategoryStat[] {
  const counts = REGISTRY.items.reduce((accumulator, item) => {
    const key = item.category ?? "uncategorized";
    accumulator.set(key, (accumulator.get(key) ?? 0) + 1);
    return accumulator;
  }, new Map<string, number>());

  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

export function getCategoryCount(): number {
  return getCategoryStats().length;
}

export function getFeaturedComponents(): readonly RegistryItem[] {
  const featuredSlugs = [
    "button",
    "data-table",
    "ai-chat-input",
    "combobox",
    "timeline",
    "globe-3d",
  ];
  const registryByName = new Map(
    REGISTRY.items.map((item) => [item.name, item] as const),
  );

  return featuredSlugs.flatMap((slug) => {
    const item = registryByName.get(slug);
    return item ? [item] : [];
  });
}
