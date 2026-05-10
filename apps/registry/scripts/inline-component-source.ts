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

type RegistryItem = {
  category?: string;
  dependencies?: string[];
  description?: string;
  files: RegistryFile[];
  name: string;
  registryDependencies?: string[];
  title?: string;
  type: string;
};

type Registry = {
  items: RegistryItem[];
};

const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
  version: string;
};
const PACKAGE_VERSION_RANGE = `^${packageJson.version}`;
const PACKAGE_DEP = `${PACKAGE_NAME}@${PACKAGE_VERSION_RANGE}`;

const rewriteImports = (source: string): string => {
  // Collect import lines that target lib utilities or sibling components
  // and replace each with a single deduped `import ... from "@vllnt/ui"` block.
  let code = source;

  // `../../lib/(utils|types|use-X)` → `@vllnt/ui`
  code = code.replace(
    /from\s+["'](?:\.\.\/)+lib\/(?:utils|types|use-[a-z-]+)["']/g,
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

writeFileSync(registryJsonPath, `${JSON.stringify(registry, null, 2)}\n`);

console.log(
  `Inlined ${processed} component source files (skipped ${skipped} with no matching source).`,
);
console.log(
  `All siblings/utilities now resolve through ${PACKAGE_NAME}@${PACKAGE_VERSION_RANGE}.`,
);
