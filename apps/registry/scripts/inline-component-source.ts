/**
 * Inline real component source from `@vllnt/ui` package into registry shim files.
 *
 * Why: shadcn-CLI installs (`pnpm dlx shadcn@latest add https://<host>/r/<x>.json`)
 * must produce working standalone code in any React codebase. The previous shim
 * pattern (`export * from "@vllnt/ui"`) re-exported everything but stripped the
 * leaf component's source, so consumers couldn't customize. Pure copy-paste with
 * sibling components inlined would bloat the consumer project across 200+ files.
 *
 * Hybrid approach:
 *   - Leaf component source is inlined (consumers can customize the actual file)
 *   - Sibling primitives, lib utilities, and hooks resolve through `@vllnt/ui`
 *     as a single npm peer dep — `import { Dialog, cn } from "@vllnt/ui"` etc.
 *
 * Rewrites applied to each component source (at any `../` depth):
 *   - `from "../../../lib/utils"`                 → `from "@vllnt/ui"`
 *   - `from "../../../lib/use-X"`                 → `from "@vllnt/ui"`
 *   - `from "../<sibling>/<sibling>"`             → `from "@vllnt/ui"`
 *   - `from "../../<level>/<sibling>/<sibling>"`  → `from "@vllnt/ui"`
 *   - `from "../<sibling>"`                       → `from "@vllnt/ui"`
 *   - `import("../<sibling>")` (same sibling paths) → `import("@vllnt/ui")`
 *   - `import { A } from "./<helper>"`            → `from "@vllnt/ui"` when every
 *     binding is a public export
 *
 * Component folders are found by name through `lib/component-directory.ts`
 * (`packages/ui/src/components/<level>/<name>/`).
 *
 * `registryDependencies` is set to `[]` for each component (no transitive registry
 * pulls — `@vllnt/ui` covers all internals). The npm `dependencies` field gets
 * `@vllnt/ui` so the shadcn CLI installs the package automatically.
 *
 * Wire into the build: `pnpm registry:build` runs this before `shadcn build`.
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  COMPONENT_LEVELS,
  findComponentDirectory,
} from "../lib/component-directory";
import { collectPublicExports } from "../lib/public-exports";
import type {
  A11ySchema,
  NativeRegistry,
  PropDefinition,
  Registry,
  Stability,
  UsageExample,
} from "./registry-types";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(scriptDir, "../../..");
const registryJsonPath = join(repoRoot, "apps/registry/registry.json");
const nativeRegistryPath = join(repoRoot, "packages/ui-native/registry.json");
const componentsRoot = join(repoRoot, "packages/ui/src/components");
const shimsRoot = join(repoRoot, "apps/registry/registry/default");

const PACKAGE_NAME = "@vllnt/ui";
const RESERVED_REGISTRY_NAMES = new Set([
  "utils",
  "types",
  "use-debounce",
  "use-horizontal-scroll",
  "use-mounted",
]);

type ComponentMeta = {
  stability?: Stability;
  replacedBy?: string;
  a11y?: A11ySchema;
};

// The npm `latest` version external consumers install via shadcn. The registry
// advertises this everywhere (item `dependencies` range + `version` stamps) so
// `npx shadcn add` always resolves to a published release. Intentionally
// decoupled from packages/ui/package.json, which runs ahead as the in-development
// canary (e.g. 0.3.0-canary.<sha>, published on every merge to main — see
// .github/workflows/publish.yml). Deriving the range from the canary version
// would point installs at an unpublished version. Bump this only when a release
// is published (see the release checklist in ROADMAP.md).
const PUBLISHED_VERSION = "0.3.0";
const PACKAGE_VERSION_RANGE = `^${PUBLISHED_VERSION}`;
const PACKAGE_DEP = `${PACKAGE_NAME}@${PACKAGE_VERSION_RANGE}`;

const readComponentMeta = (directory: string): ComponentMeta => {
  const metaPath = join(directory, "meta.json");
  if (!existsSync(metaPath)) return {};
  try {
    return JSON.parse(readFileSync(metaPath, "utf8")) as ComponentMeta;
  } catch {
    return {};
  }
};

const readComponentExamples = (directory: string): UsageExample[] => {
  const examplesPath = join(directory, "examples.json");
  if (!existsSync(examplesPath)) return [];
  try {
    const raw = JSON.parse(readFileSync(examplesPath, "utf8")) as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.filter(
      (entry): entry is UsageExample =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as UsageExample).title === "string" &&
        typeof (entry as UsageExample).code === "string",
    );
  } catch {
    return [];
  }
};

const readComponentProps = (directory: string): PropDefinition[] => {
  const propsPath = join(directory, "props.json");
  if (!existsSync(propsPath)) return [];
  try {
    const raw = JSON.parse(readFileSync(propsPath, "utf8")) as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.filter(
      (entry): entry is PropDefinition =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as PropDefinition).name === "string" &&
        typeof (entry as PropDefinition).type === "string",
    );
  } catch {
    return [];
  }
};

/** The component's folder and its canonical `<name>.tsx`, when both exist. */
const findComponentSource = (
  name: string,
): { directory: string; path: string } | undefined => {
  const directory = findComponentDirectory(componentsRoot, name);
  if (!directory) return undefined;
  const path = join(directory, `${name}.tsx`);
  return existsSync(path) ? { directory, path } : undefined;
};

/**
 * A sibling component path at any depth: `../<name>[/<file>]` within a level
 * folder, `../../<level>/<name>[/<file>]` across levels.
 */
const SIBLING_PATH =
  `(?:\\.\\.\\/)+(?:(?:${COMPONENT_LEVELS.join("|")})\\/)?` +
  `[a-z][a-z0-9-]*(?:\\/[a-z][a-z0-9-]*)?`;
const SIBLING_IMPORT_PATTERN = new RegExp(
  `from\\s+["']${SIBLING_PATH}["']`,
  "g",
);
const DYNAMIC_SIBLING_IMPORT_PATTERN = new RegExp(
  `import\\(\\s*["']${SIBLING_PATH}["']\\s*\\)`,
  "g",
);

const packageEntry = join(repoRoot, "packages/ui/src/index.ts");

const publicExports = collectPublicExports(packageEntry);

/**
 * Same-folder helpers (`./x`) are not shipped with a single-file shim, so an
 * import from one only works when every binding is public API.
 */
const rewriteSameFolderImports = (source: string): string =>
  source.replace(
    /import\s+(type\s+)?\{([^}]*)\}\s+from\s+["']\.\/[a-z][a-z0-9-]*["']/g,
    (statement, typeOnly: string | undefined, list: string) => {
      const imported = list
        .split(",")
        .map((entry) => entry.replace(/^\s*type\s+/, "").trim())
        .filter(Boolean)
        .map((binding) => binding.split(/\s+as\s+/)[0]?.trim() ?? "");
      return imported.every((name) => publicExports.has(name))
        ? `import ${typeOnly ?? ""}{${list}} from "${PACKAGE_NAME}"`
        : statement;
    },
  );

const rewriteImports = (source: string): string => {
  // Collect import lines that target lib utilities or sibling components
  // and replace each with a single deduped `import ... from "@vllnt/ui"` block.
  let code = source;

  // `../../../lib/<module>` → `@vllnt/ui`. Matches any single-segment kebab-case
  // lib module (utils, types, theme-presets, use-*, …) at any depth. The rewrite
  // is only safe for bindings the public barrel (packages/ui/src/index.ts)
  // exports; `registry:integrity` fails when a shim imports anything else.
  code = code.replace(
    /from\s+["'](?:\.\.\/)+lib\/[a-z][a-z0-9-]*["']/g,
    `from "${PACKAGE_NAME}"`,
  );

  // `../<sibling>/<file>`, `../../<level>/<sibling>/<file>`, `../<sibling>`
  // → `@vllnt/ui`
  code = code.replace(SIBLING_IMPORT_PATTERN, `from "${PACKAGE_NAME}"`);

  // Dynamic `import("<sibling path>")` → `import("@vllnt/ui")`
  code = code.replace(DYNAMIC_SIBLING_IMPORT_PATTERN, `import("${PACKAGE_NAME}")`);

  return rewriteSameFolderImports(code);
};

const registry = JSON.parse(readFileSync(registryJsonPath, "utf8")) as Registry;
const nativeRegistry = JSON.parse(
  readFileSync(nativeRegistryPath, "utf8"),
) as NativeRegistry;
const nativeComponents = new Map(
  nativeRegistry.components.map((component) => [component.name, component]),
);

let processed = 0;
let skipped = 0;

for (const item of registry.items) {
  if (RESERVED_REGISTRY_NAMES.has(item.name)) {
    // Lib/hook entries from a previous run — drop them (now redundant with @vllnt/ui)
    continue;
  }

  const nativeComponent = nativeComponents.get(item.name);
  item.platforms = nativeComponent ? ["web", "native"] : ["web"];
  if (nativeComponent) {
    item.native = {
      availability: nativeRegistry.availability,
      channel: nativeRegistry.channel,
      compatibility: nativeComponent.compatibility,
      package: nativeRegistry.package,
      source: nativeComponent.source,
      status: nativeRegistry.status,
    };
  } else {
    delete item.native;
  }

  const source = findComponentSource(item.name);
  if (!source) {
    // No canonical `<name>/<name>.tsx` to inline (e.g. bar/line/area-chart are
    // exported from a shared chart module with a hand-maintained shim). Still
    // stamp the published-version range + version so the registry-integrity
    // invariant — one uniform @vllnt/ui range across every item — survives a
    // version bump; otherwise these frozen items drift behind the rest.
    const skippedOtherDeps = (item.dependencies ?? []).filter(
      (dep) => !dep.startsWith(`${PACKAGE_NAME}@`) && dep !== PACKAGE_NAME,
    );
    item.dependencies = [PACKAGE_DEP, ...skippedOtherDeps];
    item.version = PUBLISHED_VERSION;
    skipped += 1;
    continue;
  }

  const sourceCode = readFileSync(source.path, "utf8");
  const code = rewriteImports(sourceCode);

  // Write rewritten source to shim path
  const shimDir = join(shimsRoot, item.name);
  if (!existsSync(shimDir)) {
    mkdirSync(shimDir, { recursive: true });
  }
  writeFileSync(join(shimDir, `${item.name}.tsx`), code);

  // No transitive registry pulls — @vllnt/ui covers all internals
  item.registryDependencies = [];

  // Ensure @vllnt/ui is in npm dependencies (preserve any other declared deps)
  const otherDeps = (item.dependencies ?? []).filter(
    (dep) => !dep.startsWith(`${PACKAGE_NAME}@`) && dep !== PACKAGE_NAME,
  );
  item.dependencies = [PACKAGE_DEP, ...otherDeps];

  // Stamp version + stability per the registry item schema (see #253).
  // Defaults to the published @vllnt/ui version + "stable"; per-component
  // overrides come from packages/ui/src/components/<level>/<name>/meta.json if present.
  const meta = readComponentMeta(source.directory);
  item.version = PUBLISHED_VERSION;
  item.stability = meta.stability ?? "stable";
  if (item.stability === "deprecated") {
    if (meta.replacedBy) {
      item.replacedBy = meta.replacedBy;
    }
  } else {
    delete item.replacedBy;
  }

  // Stamp a11y schema (see #255) — agents generating UI need to know the
  // keyboard model, ARIA roles, and focus expectations of each component.
  if (meta.a11y) {
    item.a11y = meta.a11y;
  } else {
    delete item.a11y;
  }

  // Stamp inline usage examples (see #254) — agents see how to use the
  // component without scraping Storybook iframes. Source: optional
  // packages/ui/src/components/<level>/<name>/examples.json. Schema:
  // [{ title, description?, code, framework?, storyId? }].
  const examples = readComponentExamples(source.directory);
  if (examples.length > 0) {
    item.examples = examples;
  } else {
    delete item.examples;
  }

  // Stamp prop definitions (see #242) — agents reading /r/<name>.json
  // see the public API surface in TSDoc-shaped JSON. Source: optional
  // packages/ui/src/components/<level>/<name>/props.json. Schema:
  // [{ name, type, required?, defaultValue?, description?, deprecated? }].
  // Auto-extraction from TS source is a future follow-up; props.json is
  // the contract for now.
  const props = readComponentProps(source.directory);
  if (props.length > 0) {
    item.props = props;
  } else {
    delete item.props;
  }

  processed += 1;
}

// Drop reserved entries that any earlier sync run may have added
registry.items = registry.items.filter(
  (item) => !RESERVED_REGISTRY_NAMES.has(item.name),
);

// Clean up any lingering shim directories for the dropped names
for (const name of RESERVED_REGISTRY_NAMES) {
  const dir = join(shimsRoot, name);
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

const registryNames = new Set(registry.items.map((item) => item.name));
const missingNativeComponents = nativeRegistry.components.filter(
  (component) => !registryNames.has(component.name),
);
if (missingNativeComponents.length > 0) {
  console.error(
    `Native components missing from the web registry: ${missingNativeComponents
      .map((component) => component.name)
      .join(", ")}`,
  );
  process.exitCode = 1;
}

// Sort items alphabetically for deterministic output
registry.items.sort((a, b) => a.name.localeCompare(b.name));

// Refresh generatedAt only when the published registry version changes; normal
// deterministic rebuilds must not dirty the tree.
if (registry.version !== PUBLISHED_VERSION) {
  registry.generatedAt = new Date().toISOString();
}
registry.version = PUBLISHED_VERSION;
registry.generatedAt ??= new Date().toISOString();

// Validate: any deprecated component must declare replacedBy.
const deprecatedWithoutReplacement = registry.items.filter(
  (item) => item.stability === "deprecated" && !item.replacedBy,
);
if (deprecatedWithoutReplacement.length > 0) {
  console.error(
    `Deprecated components missing replacedBy: ${deprecatedWithoutReplacement
      .map((item) => item.name)
      .join(", ")}`,
  );
  process.exitCode = 1;
}

writeFileSync(registryJsonPath, `${JSON.stringify(registry, null, 2)}\n`);

console.log(
  `Inlined ${processed} component source files (skipped ${skipped} with no matching source).`,
);
console.log(
  `All siblings/utilities now resolve through ${PACKAGE_NAME}@${PACKAGE_VERSION_RANGE}.`,
);
console.log(`Stamped version=${PUBLISHED_VERSION} on ${processed} items.`);
