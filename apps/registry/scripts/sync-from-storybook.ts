/**
 * Sync component metadata from Storybook index.json + registry.json
 *
 * Reads Storybook's build output to map component names → story IDs,
 * then merges with registry.json for category/description data.
 *
 * Output: lib/component-metadata.json (consumed by component pages)
 *
 * Usage: pnpm sync-storybook (runs after build-storybook)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));

type StoryEntry = {
  componentPath?: string;
  exportName: string;
  id: string;
  importPath: string;
  name: string;
  title: string;
  type: string;
};

type StorybookIndex = {
  entries: Record<string, StoryEntry>;
  v: number;
};

type RegistryItem = {
  category?: string;
  dependencies?: string[];
  description?: string;
  files: { path: string; type: string }[];
  name: string;
  registryDependencies?: string[];
  title?: string;
  type: string;
};

type Registry = {
  items: RegistryItem[];
};

type ComponentMetadata = {
  category: string;
  defaultStoryId: string;
  description: string;
  name: string;
  stories: { id: string; name: string }[];
  title: string;
};

type StoryMapEntry = {
  defaultStoryId: string;
  stories: { id: string; name: string }[];
};

function extractComponentName(importPath: string): string {
  const match = /\.\/src\/components\/([^/]+)\/[^/]+\.stories\.tsx$/.exec(
    importPath,
  );
  if (match?.[1]) return match[1];

  const chartMatch = /\.\/src\/components\/chart\/([^/]+)\.stories\.tsx$/.exec(
    importPath,
  );
  if (chartMatch?.[1]) return chartMatch[1];

  return "";
}

function loadStorybookIndex(indexPath: string): StorybookIndex {
  try {
    return JSON.parse(readFileSync(indexPath, "utf8")) as StorybookIndex;
  } catch {
    throw new Error(
      "storybook-static/index.json not found. Run build-storybook first.",
    );
  }
}

function buildStoryMap(
  entries: Record<string, StoryEntry>,
): Map<string, StoryMapEntry> {
  const storyMap = new Map<string, StoryMapEntry>();

  Object.values(entries).reduce((map, entry) => {
    const componentName = extractComponentName(entry.importPath);
    if (!componentName) return map;

    const existing = map.get(componentName);
    if (existing) {
      existing.stories.push({ id: entry.id, name: entry.name });
      if (entry.exportName === "Default") {
        existing.defaultStoryId = entry.id;
      }
    } else {
      map.set(componentName, {
        defaultStoryId: entry.id,
        stories: [{ id: entry.id, name: entry.name }],
      });
    }
    return map;
  }, storyMap);

  return storyMap;
}

function buildMetadata(
  registry: Registry,
  storyMap: Map<string, StoryMapEntry>,
): Record<string, ComponentMetadata> {
  return registry.items
    .filter((item) => item.type === "registry:component")
    .reduce<Record<string, ComponentMetadata>>((accumulator, item) => {
      const storyData = storyMap.get(item.name);
      accumulator[item.name] = {
        category: item.category ?? "utility",
        defaultStoryId: storyData?.defaultStoryId ?? "",
        description: item.description ?? "",
        name: item.name,
        stories: storyData?.stories ?? [],
        title: item.title ?? item.name,
      };
      return accumulator;
    }, {});
}

const storybookIndexPath = join(
  scriptDirectory,
  "..",
  "..",
  "..",
  "packages",
  "ui",
  "storybook-static",
  "index.json",
);
const registryPath = join(scriptDirectory, "..", "registry.json");
const outputPath = join(
  scriptDirectory,
  "..",
  "lib",
  "component-metadata.json",
);

const storybookIndex = loadStorybookIndex(storybookIndexPath);
const registry = JSON.parse(readFileSync(registryPath, "utf8")) as Registry;
const storyMap = buildStoryMap(storybookIndex.entries);
const metadata = buildMetadata(registry, storyMap);

writeFileSync(outputPath, JSON.stringify(metadata, undefined, 2));

const withStories = Object.values(metadata).filter(
  (m) => m.defaultStoryId,
).length;
const total = Object.keys(metadata).length;

console.info(`Synced ${total} components (${withStories} with stories)`);
console.info(`Output: ${outputPath}`);
