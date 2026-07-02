/**
 * Verify every component preview resolves to a real Storybook story.
 *
 * The registry site embeds a Storybook iframe using the story IDs recorded in
 * apps/registry/lib/component-metadata.json (`defaultStoryId` + `stories[].id`).
 * If any of those IDs is absent from the actual Storybook build, the iframe
 * renders "Couldn't find story matching '<id>'" and the preview is blank.
 *
 * This loads the authoritative story index produced by `pnpm build-storybook`
 * (packages/ui/storybook-static/index.json) and asserts that:
 *
 *   1. BROKEN — every metadata story ID exists as a real `story` entry, and
 *   2. MISSING — every component that has a real story also has a non-empty
 *      `defaultStoryId` (otherwise its preview is silently hidden).
 *
 * Exits non-zero on any mismatch. This is the authoritative guard: it holds
 * regardless of how the metadata is generated, so it catches the args.title
 * regex bug, slug-algorithm drift, renamed stories, and stale metadata alike.
 *
 * Run: pnpm -F @vllnt/ui-registry registry:verify-previews
 * Requires a fresh Storybook build first (CI builds it in the same job).
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(scriptDirectory, "..", "..", "..");

const metadataPath = join(
  repoRoot,
  "apps",
  "registry",
  "lib",
  "component-metadata.json",
);
const storybookIndexPath = join(
  repoRoot,
  "packages",
  "ui",
  "storybook-static",
  "index.json",
);

type ComponentMetadata = {
  defaultStoryId: string;
  name: string;
  stories: { id: string; name: string }[];
};

type StorybookIndexEntry = {
  importPath: string;
  type: string;
};

type StorybookIndex = {
  entries: Record<string, StorybookIndexEntry>;
};

type Failure = {
  component: string;
  detail: string;
  kind: "broken" | "missing";
};

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

if (!existsSync(storybookIndexPath)) {
  fail(
    `Storybook index not found at ${storybookIndexPath}.\n` +
      `  Build it first: pnpm -F @vllnt/ui build-storybook`,
  );
}

const metadata = JSON.parse(readFileSync(metadataPath, "utf8")) as Record<
  string,
  ComponentMetadata
>;
const storybookIndex = JSON.parse(
  readFileSync(storybookIndexPath, "utf8"),
) as StorybookIndex;

const storyEntries = Object.entries(storybookIndex.entries).filter(
  ([, entry]) => entry.type === "story",
);
const validStoryIds = new Set(storyEntries.map(([id]) => id));

/** Story IDs that belong to a given component folder, for actionable hints. */
function storyIdsForComponent(componentName: string): string[] {
  const marker = `/components/${componentName}/`;
  return storyEntries
    .filter(([, entry]) => entry.importPath.includes(marker))
    .map(([id]) => id);
}

const failures: Failure[] = [];

for (const component of Object.values(metadata)) {
  const referencedIds = new Set<string>();
  if (component.defaultStoryId) referencedIds.add(component.defaultStoryId);
  for (const story of component.stories) referencedIds.add(story.id);

  for (const id of referencedIds) {
    if (!validStoryIds.has(id)) {
      const available = storyIdsForComponent(component.name);
      const hint =
        available.length > 0
          ? `available: ${available.join(", ")}`
          : "no stories found for this component in the Storybook build";
      failures.push({
        component: component.name,
        detail: `references "${id}" which is not a built story (${hint})`,
        kind: "broken",
      });
    }
  }

  if (!component.defaultStoryId) {
    const available = storyIdsForComponent(component.name);
    if (available.length > 0) {
      failures.push({
        component: component.name,
        detail: `has no defaultStoryId but Storybook has ${available.join(", ")} — preview is hidden`,
        kind: "missing",
      });
    }
  }
}

const componentCount = Object.keys(metadata).length;

if (failures.length === 0) {
  console.info(
    `✓ All ${componentCount} component previews resolve to real Storybook stories ` +
      `(${validStoryIds.size} stories indexed).`,
  );
  process.exit(0);
}

console.error(
  `✗ ${failures.length} component preview(s) reference stories that do not exist:\n`,
);
for (const failure of failures) {
  const label = failure.kind === "broken" ? "BROKEN" : "MISSING";
  console.error(`  [${label}] ${failure.component}: ${failure.detail}`);
}
console.error(
  `\nRegenerate metadata (pnpm -F @vllnt/ui-registry sync-storybook) and rebuild ` +
    `Storybook so preview IDs match, then re-run this check.`,
);
process.exit(1);
