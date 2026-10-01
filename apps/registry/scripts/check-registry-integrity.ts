/**
 * Registry integrity check.
 *
 * Guards regressions surfaced in the 0.3.0 review, plus shim portability:
 *   1. Coverage — a component with a story AND a test must appear in
 *      registry.json (or be an explicitly documented exclusion). New components
 *      were shipped without a registry entry, so shadcn users could not install
 *      them.
 *   2. Item completeness — every item needs a `version`, `stability`, and an
 *      `@vllnt/ui` dependency (area/bar/line-chart shipped missing all three).
 *   3. No prerelease leak — the published install target must be a real release,
 *      never the in-development `0.3.0-canary.<sha>` version. The registry build
 *      pins it via PUBLISHED_VERSION; this asserts the committed result is sane.
 *   4. Shim portability — generated shims must not keep relative imports
 *      (static or dynamic); they are installed as standalone files.
 *   5. Shim imports resolve — every name a shim imports from "@vllnt/ui" must
 *      be a public export of the package (packages/ui/src/index.ts), otherwise
 *      the installed file fails to type-check (TS2305).
 *
 * Usage: pnpm -F @vllnt/ui-registry registry:integrity
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { listComponentDirectories } from "../lib/component-directory";
import { collectPublicExports, importedNames } from "../lib/public-exports";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(scriptDir, "../../..");
const componentsRoot = join(repoRoot, "packages/ui/src/components");
const registryJsonPath = join(repoRoot, "apps/registry/registry.json");
const packageEntry = join(repoRoot, "packages/ui/src/index.ts");
const nativeRegistryPath = join(repoRoot, "packages/ui-native/registry.json");

/**
 * Components that legitimately have a story + test but are NOT registry items.
 * Keep this list small and documented. When the single-file-shim limitation is
 * lifted, move social-fab / static-code into registry.json and drop them here.
 */
const EXCLUDED = new Set<string>([
  "chart", // meta directory — shipped as area-chart / bar-chart / line-chart
  "social-fab", // multi-file (imports ./use-social-fab) — single-file shim cannot inline it yet
  "static-code", // multi-file (imports ./static-code-copy) — single-file shim cannot inline it yet
]);

type RegistryItem = {
  dependencies?: string[];
  files?: { path: string }[];
  name: string;
  native?: {
    availability?: string;
    channel?: string;
    compatibility?: string;
    package?: string;
    source?: string;
    status?: string;
  };
  platforms?: string[];
  stability?: string;
  version?: string;
};

type Registry = { items: RegistryItem[] };
type NativeRegistry = {
  availability: "package" | "source";
  components: {
    compatibility: "native-adapted" | "portable-options";
    name: string;
    source: string;
  }[];
  installation: { available: boolean };
};

const registry = JSON.parse(readFileSync(registryJsonPath, "utf8")) as Registry;
const nativeRegistry = JSON.parse(
  readFileSync(nativeRegistryPath, "utf8"),
) as NativeRegistry;
const itemNames = new Set(registry.items.map((item) => item.name));
const errors: string[] = [];

for (const { directory, name } of listComponentDirectories(componentsRoot)) {
  const files = readdirSync(directory);
  const hasStory = files.some((file) => file.endsWith(".stories.tsx"));
  const hasTest = files.some((file) => file.endsWith(".test.tsx"));
  if (hasStory && hasTest && !itemNames.has(name) && !EXCLUDED.has(name)) {
    errors.push(
      `Component "${name}" has a story + test but is missing from registry.json. ` +
        `Add it to items[] (or to EXCLUDED in this script if intentional).`,
    );
  }
}

const depVersions = new Set<string>();
for (const item of registry.items) {
  if (!item.version) errors.push(`Item "${item.name}" is missing "version".`);
  if (!item.stability) {
    errors.push(`Item "${item.name}" is missing "stability".`);
  }
  const platforms = item.platforms ?? [];
  const platformSet = new Set(platforms);
  if (platforms.length === 0) {
    errors.push(`Item "${item.name}" is missing "platforms".`);
  }
  if (platformSet.size !== platforms.length) {
    errors.push(`Item "${item.name}" has duplicate platforms.`);
  }
  if (platforms.some((platform) => platform !== "web" && platform !== "native")) {
    errors.push(`Item "${item.name}" has an unsupported platform.`);
  }
  if (platforms[0] !== "web") {
    errors.push(`Item "${item.name}" must list "web" first.`);
  }
  if (platformSet.has("native") !== Boolean(item.native)) {
    errors.push(
      `Item "${item.name}" must include native metadata exactly when native is supported.`,
    );
  }
  if (
    item.native &&
    (item.native.package !== "@vllnt/ui-native" ||
      item.native.channel !== "canary" ||
      item.native.status !== "experimental" ||
      item.native.availability !== nativeRegistry.availability ||
      !["native-adapted", "portable-options"].includes(
        item.native.compatibility ?? "",
      ) ||
      !item.native.source)
  ) {
    errors.push(`Item "${item.name}" has invalid native renderer metadata.`);
  }
  const uiDep = (item.dependencies ?? []).find((dep) =>
    dep.startsWith("@vllnt/ui@"),
  );
  if (!uiDep) {
    errors.push(`Item "${item.name}" is missing an "@vllnt/ui" dependency.`);
    continue;
  }
  const range = uiDep.slice("@vllnt/ui@".length);
  depVersions.add(range);
  if (range.includes("-")) {
    errors.push(
      `Item "${item.name}" pins a prerelease "${uiDep}". The registry must ` +
        `advertise a published release, never a canary.`,
    );
  }
}

// Shims are installed standalone by shadcn: any relative specifier left after
// the @vllnt/ui rewrite would point at a file the consumer does not have.
const RELATIVE_SPECIFIER = /(?:\bfrom\s+|\bimport\s*\(\s*)["']\.{1,2}\//;
const publicExports = collectPublicExports(packageEntry);
for (const item of registry.items) {
  for (const file of item.files ?? []) {
    const shimPath = join(repoRoot, "apps/registry", file.path);
    if (!existsSync(shimPath)) {
      errors.push(
        `Shim "${file.path}" is missing. Run \`pnpm -F @vllnt/ui-registry registry:build\` first.`,
      );
      continue;
    }
    const shimSource = readFileSync(shimPath, "utf8");
    if (RELATIVE_SPECIFIER.test(shimSource)) {
      errors.push(
        `Shim "${file.path}" still imports a relative path; shadcn installs would break.`,
      );
    }
    const missing = importedNames(shimSource, "@vllnt/ui").filter(
      (name) => !publicExports.has(name),
    );
    if (missing.length > 0) {
      errors.push(
        `Shim "${file.path}" imports ${missing.join(", ")} from "@vllnt/ui", ` +
          `which the package does not export. Export them from packages/ui/src/index.ts.`,
      );
    }
  }
}

const nativeManifest = new Map(
  nativeRegistry.components.map((component) => [component.name, component]),
);
if (nativeManifest.size !== nativeRegistry.components.length) {
  errors.push("Native manifest contains duplicate component names.");
}
if (
  (nativeRegistry.availability === "package") !==
  nativeRegistry.installation.available
) {
  errors.push("Native availability and installation status disagree.");
}

const nativeItems = registry.items.filter((item) =>
  item.platforms?.includes("native"),
);
for (const item of nativeItems) {
  const nativeComponent = nativeManifest.get(item.name);
  if (
    nativeComponent?.compatibility !== item.native?.compatibility ||
    nativeComponent?.source !== item.native?.source
  ) {
    errors.push(
      `Item "${item.name}" has drifted from packages/ui-native/registry.json.`,
    );
  }
  if (
    nativeComponent &&
    !existsSync(join(repoRoot, "packages/ui-native", nativeComponent.source))
  ) {
    errors.push(`Native source for "${item.name}" does not exist.`);
  }
}
for (const name of nativeManifest.keys()) {
  if (!nativeItems.some((item) => item.name === name)) {
    errors.push(`Native manifest component "${name}" is absent from registry metadata.`);
  }
}

if (depVersions.size > 1) {
  errors.push(
    `Inconsistent @vllnt/ui dependency versions across items: ${[...depVersions].join(", ")}.`,
  );
}

if (!existsSync(registryJsonPath)) {
  errors.push("registry.json not found.");
}

if (errors.length > 0) {
  console.error(`Registry integrity check failed (${errors.length}):\n`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `Registry integrity OK: ${registry.items.length} items, install target ${[...depVersions][0]}.`,
);
