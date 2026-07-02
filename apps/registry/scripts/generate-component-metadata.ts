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

const NAMED_EXPORT_PATTERN = /^export\s+const\s+([A-Z][\w$]*)\s*[:=]/gm;
const TITLE_KEY_PATTERN = /^["']?title["']?\s*:\s*["'`]([^"'`]*)["'`]/;
const META_OBJECT_PATTERN = /\b(?:const|let|var)\s+meta\b[^=]*=\s*\{/;

/**
 * Mirror of Storybook's `sanitize` (from @storybook/csf): lowercase, collapse
 * every run of non-alphanumerics to a single "-", trim leading/trailing "-".
 * Storybook derives story IDs from the title + story name with this exact rule,
 * so the metadata IDs must be produced the same way or the preview iframe 404s
 * ("Couldn't find story matching …"). verify-preview-stories.ts cross-checks the
 * result against the real built index.json — the authoritative guard for any
 * exotic title Storybook happens to slug differently.
 */
function sanitize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/**
 * Split a PascalCase story export into words the way Storybook's
 * `storyNameFromExport` (lodash startCase) does, then sanitize — so
 * `WithLongText` → `with-long-text` matches the built story id.
 */
function exportNameToStorySlug(exportName: string): string {
  const spaced = exportName
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
  return sanitize(spaced);
}

function skipStringLiteral(source: string, start: number): number {
  const quote = source[start];
  let index = start + 1;
  while (index < source.length) {
    const char = source[index];
    if (char === "\\") {
      index += 2;
      continue;
    }
    if (char === quote) return index + 1;
    index += 1;
  }
  return source.length;
}

function isWordBoundaryBefore(source: string, index: number): boolean {
  return index === 0 || !/[\w$]/.test(source[index - 1]!);
}

/**
 * Extract the Storybook meta `title` — the object's OWN top-level property.
 * A naive `title:` regex matches the first occurrence, which is frequently a
 * nested `args.title` (sample content), producing a bogus story id such as
 * `designingreadableaiconversations--default`. This walks the `const meta = {}`
 * object literal and only reads `title:` at brace depth 1, skipping strings and
 * comments so nested braces/quotes never confuse the depth count.
 */
function extractMetaTitle(source: string): string | undefined {
  const declaration = META_OBJECT_PATTERN.exec(source);
  const openBraceIndex = declaration
    ? declaration.index + declaration[0].length - 1
    : source.indexOf("{", source.indexOf("export default"));
  if (openBraceIndex < 0) return undefined;

  let depth = 0;
  let index = openBraceIndex;
  while (index < source.length) {
    const char = source[index];

    if (char === "/" && source[index + 1] === "/") {
      const newline = source.indexOf("\n", index);
      index = newline === -1 ? source.length : newline;
      continue;
    }
    if (char === "/" && source[index + 1] === "*") {
      const end = source.indexOf("*/", index + 2);
      index = end === -1 ? source.length : end + 2;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      index = skipStringLiteral(source, index);
      continue;
    }
    if (char === "{") {
      depth += 1;
      index += 1;
      continue;
    }
    if (char === "}") {
      depth -= 1;
      index += 1;
      if (depth === 0) break;
      continue;
    }
    if (depth === 1 && isWordBoundaryBefore(source, index)) {
      const keyValue = TITLE_KEY_PATTERN.exec(source.slice(index));
      if (keyValue?.[1] !== undefined) return keyValue[1];
    }
    index += 1;
  }

  return undefined;
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
  const title = extractMetaTitle(source);
  if (!title) return;

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
  const prefix = sanitize(parsed.title);

  const stories: StoryEntry[] = parsed.exportNames.map((exportName) => ({
    id: `${prefix}--${exportNameToStorySlug(exportName)}`,
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
