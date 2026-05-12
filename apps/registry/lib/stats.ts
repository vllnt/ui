import packageJson from "../../../packages/ui/package.json";
import registry from "../registry.json";

type RegistryItem = {
  readonly name: string;
  readonly category?: string;
};

type Registry = {
  readonly items: readonly RegistryItem[];
  readonly version?: string;
  readonly generatedAt?: string;
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
  const counts = new Map<string, number>();
  for (const item of REGISTRY.items) {
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

export function getFeaturedComponents(): readonly RegistryItem[] {
  const featuredSlugs = [
    "button",
    "data-table",
    "ai-chat-input",
    "combobox",
    "timeline",
    "globe-3d",
  ];
  const registryByName = new Map<string, RegistryItem>();
  for (const item of REGISTRY.items) {
    registryByName.set(item.name, item);
  }

  const featured: RegistryItem[] = [];
  for (const slug of featuredSlugs) {
    const item = registryByName.get(slug);
    if (item) {
      featured.push(item);
    }
  }
  return featured;
}
