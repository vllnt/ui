/**
 * Generate apps/registry/lib/component-metadata.json from registry.json +
 * the story files themselves — no Storybook build required.
 *
 * Why: sync-from-storybook.ts depends on packages/ui/storybook-static/index.json,
 * which only exists after a full Storybook build. CI doesn't run that on every
 * push, so the metadata file goes stale every time a new component lands.
 *
 * This script walks packages/ui/src/components/<name>/<name>.stories.tsx,
 * extracts the title via regex, and derives Storybook story IDs from the
 * Storybook convention:
 *
 *   title "Core/Button"      → story id "core-button--default"
 *   title "AI/AISidebar"     → story id "ai-aisidebar--default"
 *   title "Form/Combobox"    → story id "form-combobox--default"
 *
 * Storybook's slug rule: lowercase, alphanumerics kept, "/" → "-".
 *
 * Output is best-effort — if a component has no .stories.tsx the metadata
 * entry has empty defaultStoryId (preview hidden, same as today).
 *
 * Run via: pnpm sync-storybook (replaces the previous storybook-static reader)
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));

type RegistryItem = {
  category?: string;
  description?: string;
  descriptions?: Partial<Record<string, string>>;
  files: { path: string; type: string }[];
  name: string;
  title?: string;
  type: string;
};

type Registry = {
  items: RegistryItem[];
};

type StoryEntry = {
  id: string;
  name: string;
};

type ComponentMetadata = {
  category: string;
  defaultStoryId: string;
  description: string;
  descriptions?: Partial<Record<string, string>>;
  name: string;
  stories: StoryEntry[];
  title: string;
};

const repoRoot = join(scriptDirectory, "..", "..", "..");
const componentsRoot = join(repoRoot, "packages", "ui", "src", "components");
const registryPath = join(repoRoot, "apps", "registry", "registry.json");
const outputPath = join(
  repoRoot,
  "apps",
  "registry",
  "lib",
  "component-metadata.json",
);

const TITLE_PATTERN = /title\s*:\s*["'`]([^"'`]+)["'`]/;
const NAMED_EXPORT_PATTERN = /^export\s+const\s+([A-Z][\w$]*)\s*[:=]/gm;

function slugifyTitleSegment(segment: string): string {
  return segment
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^-+|-+$/g, "");
}

function titleToStoryIdPrefix(title: string): string {
  return title
    .split("/")
    .map((segment) => slugifyTitleSegment(segment))
    .filter(Boolean)
    .join("-");
}

function exportNameToSlug(exportName: string): string {
  return exportName
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function findStoryFile(componentName: string): string | undefined {
  const componentDirectory = join(componentsRoot, componentName);
  if (!existsSync(componentDirectory)) return;

  const candidates = readdirSync(componentDirectory).filter((file) =>
    file.endsWith(".stories.tsx"),
  );
  if (candidates.length === 0) return;

  return join(componentDirectory, candidates[0]!);
}

function parseStoriesFromFile(
  filePath: string,
): { title: string; exportNames: string[] } | undefined {
  const source = readFileSync(filePath, "utf8");
  const titleMatch = TITLE_PATTERN.exec(source);
  if (!titleMatch?.[1]) return;

  const title = titleMatch[1];
  const exportNames: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = NAMED_EXPORT_PATTERN.exec(source)) !== null) {
    const name = match[1];
    if (!name) continue;
    if (name === "default") continue;
    if (name.startsWith("_")) continue;
    exportNames.push(name);
  }

  return { title, exportNames };
}

function buildEntries(
  componentName: string,
  parsed: { title: string; exportNames: string[] },
): { defaultStoryId: string; stories: StoryEntry[] } {
  const prefix = titleToStoryIdPrefix(parsed.title);

  const stories: StoryEntry[] = parsed.exportNames.map((exportName) => ({
    id: `${prefix}--${exportNameToSlug(exportName)}`,
    name: exportName.replace(/([a-z])([A-Z])/g, "$1 $2"),
  }));

  if (stories.length === 0) {
    return { defaultStoryId: "", stories: [] };
  }

  const defaultEntry =
    stories.find((entry) => entry.id.endsWith("--default")) ?? stories[0]!;

  return {
    defaultStoryId: defaultEntry.id,
    stories,
  };
}

const registry = JSON.parse(readFileSync(registryPath, "utf8")) as Registry;
const metadata: Record<string, ComponentMetadata> = {};

let withStories = 0;
let withoutStories = 0;

for (const item of registry.items) {
  if (item.type !== "registry:component") continue;

  const storyFile = findStoryFile(item.name);
  let entries: { defaultStoryId: string; stories: StoryEntry[] } = {
    defaultStoryId: "",
    stories: [],
  };

  if (storyFile) {
    const parsed = parseStoriesFromFile(storyFile);
    if (parsed) {
      entries = buildEntries(item.name, parsed);
    }
  }

  metadata[item.name] = {
    category: item.category ?? "utility",
    defaultStoryId: entries.defaultStoryId,
    description: item.description ?? "",
    descriptions: item.descriptions,
    name: item.name,
    stories: entries.stories,
    title: item.title ?? item.name,
  };

  if (entries.defaultStoryId) withStories += 1;
  else withoutStories += 1;
}

writeFileSync(outputPath, `${JSON.stringify(metadata, undefined, 2)}\n`);

console.info(
  `Generated metadata for ${Object.keys(metadata).length} components (${withStories} with stories, ${withoutStories} without).`,
);
console.info(`Output: ${outputPath}`);
