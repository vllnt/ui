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
 * Rewrites applied to each component source:
 *   - `from "../../lib/utils"`           → `from "@vllnt/ui"`
 *   - `from "../../lib/types"`           → `from "@vllnt/ui"`
 *   - `from "../../lib/use-X"`           → `from "@vllnt/ui"`
 *   - `from "../<sibling>/<sibling>"`    → `from "@vllnt/ui"`
 *   - `from "../<sibling>"`              → `from "@vllnt/ui"`
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

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(scriptDir, "../../..");
const registryJsonPath = join(repoRoot, "apps/registry/registry.json");
const componentsRoot = join(repoRoot, "packages/ui/src/components");
const shimsRoot = join(repoRoot, "apps/registry/registry/default");
const packageJsonPath = join(repoRoot, "packages/ui/package.json");

const PACKAGE_NAME = "@vllnt/ui";
const RESERVED_REGISTRY_NAMES = new Set([
  "utils",
  "types",
  "use-debounce",
  "use-horizontal-scroll",
  "use-mounted",
]);

type RegistryFile = {
  path: string;
  type: string;
};

type Stability = "stable" | "beta" | "experimental" | "deprecated";

type A11yKeyboardBinding = {
  keys: string;
  action: string;
};

type A11ySchema = {
  role?: string;
  keyboard?: A11yKeyboardBinding[];
  aria?: string[];
  focusManagement?: "auto" | "manual";
  notes?: string;
};

type UsageExample = {
  title: string;
  description?: string;
  code: string;
  framework?: "react" | "next";
  storyId?: string;
};

type PropDefinition = {
  name: string;
  type: string;
  required?: boolean;
  defaultValue?: string;
  description?: string;
  deprecated?: boolean;
};

type ComponentMeta = {
  stability?: Stability;
  replacedBy?: string;
  a11y?: A11ySchema;
};

type RegistryItem = {
  a11y?: A11ySchema;
  category?: string;
  dependencies?: string[];
  description?: string;
  examples?: UsageExample[];
  files: RegistryFile[];
  name: string;
  props?: PropDefinition[];
  registryDependencies?: string[];
  replacedBy?: string;
  stability?: Stability;
  title?: string;
  type: string;
  version?: string;
};

type Registry = {
  $schema?: string;
  generatedAt?: string;
  homepage?: string;
  items: RegistryItem[];
  name?: string;
  version?: string;
};

const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
  version: string;
};
const PACKAGE_VERSION = packageJson.version;
const PACKAGE_VERSION_RANGE = `^${PACKAGE_VERSION}`;
const PACKAGE_DEP = `${PACKAGE_NAME}@${PACKAGE_VERSION_RANGE}`;

const readComponentMeta = (name: string): ComponentMeta => {
  const metaPath = join(componentsRoot, name, "meta.json");
  if (!existsSync(metaPath)) return {};
  try {
    return JSON.parse(readFileSync(metaPath, "utf8")) as ComponentMeta;
  } catch {
    return {};
  }
};

const readComponentExamples = (name: string): UsageExample[] => {
  const examplesPath = join(componentsRoot, name, "examples.json");
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

const readComponentProps = (name: string): PropDefinition[] => {
  const propsPath = join(componentsRoot, name, "props.json");
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

const rewriteImports = (source: string): string => {
  // Collect import lines that target lib utilities or sibling components
  // and replace each with a single deduped `import ... from "@vllnt/ui"` block.
  let code = source;

  // `../../lib/(format|utils|types|use-X)` → `@vllnt/ui`
  code = code.replace(
    /from\s+["'](?:\.\.\/)+lib\/(?:format|utils|types|use-[a-z-]+)["']/g,
    `from "${PACKAGE_NAME}"`,
  );

  // `../<sibling>/<file>` → `@vllnt/ui`
  code = code.replace(
    /from\s+["']\.\.\/[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*["']/g,
    `from "${PACKAGE_NAME}"`,
  );

  // `../<sibling>` → `@vllnt/ui`
  code = code.replace(
    /from\s+["']\.\.\/[a-z][a-z0-9-]*["']/g,
    `from "${PACKAGE_NAME}"`,
  );

  return code;
};

const registry = JSON.parse(readFileSync(registryJsonPath, "utf8")) as Registry;

let processed = 0;
let skipped = 0;

for (const item of registry.items) {
  if (RESERVED_REGISTRY_NAMES.has(item.name)) {
    // Lib/hook entries from a previous run — drop them (now redundant with @vllnt/ui)
    continue;
  }

  const sourcePath = join(componentsRoot, item.name, `${item.name}.tsx`);
  if (!existsSync(sourcePath)) {
    skipped += 1;
    continue;
  }

  const sourceCode = readFileSync(sourcePath, "utf8");
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
  // overrides come from packages/ui/src/components/<name>/meta.json if present.
  const meta = readComponentMeta(item.name);
  item.version = PACKAGE_VERSION;
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
  // packages/ui/src/components/<name>/examples.json. Schema:
  // [{ title, description?, code, framework?, storyId? }].
  const examples = readComponentExamples(item.name);
  if (examples.length > 0) {
    item.examples = examples;
  } else {
    delete item.examples;
  }

  // Stamp prop definitions (see #242) — agents reading /r/<name>.json
  // see the public API surface in TSDoc-shaped JSON. Source: optional
  // packages/ui/src/components/<name>/props.json. Schema:
  // [{ name, type, required?, defaultValue?, description?, deprecated? }].
  // Auto-extraction from TS source is a future follow-up; props.json is
  // the contract for now.
  const props = readComponentProps(item.name);
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

// Sort items alphabetically for deterministic output
registry.items.sort((a, b) => a.name.localeCompare(b.name));

// Stamp top-level version + generatedAt so agents can detect schema/library changes.
registry.version = PACKAGE_VERSION;
registry.generatedAt = new Date().toISOString();

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
console.log(`Stamped version=${PACKAGE_VERSION} on ${processed} items.`);
