/**
 * Checks that every bare deep import in the built `dist/` (an import of a file
 * inside a dependency, such as `react-syntax-highlighter/dist/esm/prism.js`)
 * resolves to a file under Node ESM.
 *
 * Bundlers add missing `.js` extensions and resolve directory indexes; Node
 * ESM does neither for packages without an `exports` map. tsup.config.ts
 * rewrites the deep specifiers it knows to full paths, and this check fails
 * when a new deep import is missing from that list, before Node-based
 * consumers (SSR, test runners) hit ERR_MODULE_NOT_FOUND.
 *
 * Only packages in `dependencies` count: optional peers such as `next` may be
 * absent where the package gets built.
 *
 * Usage: pnpm -F @vllnt/ui check:dist-imports   (run `pnpm -F @vllnt/ui build` first)
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDirectory = resolve(import.meta.dirname, "..");
const distributionDirectory = join(packageDirectory, "dist");
const { dependencies = {} } = JSON.parse(
  readFileSync(join(packageDirectory, "package.json"), "utf8"),
);
const specifierPattern = /\b(?:from|import)\s*(?:\(\s*)?(["'])([^"']+)\1/g;

function deepDependencyImport(specifier) {
  if (/^(?:\.|\/|node:)/.test(specifier)) return undefined;
  const segments = specifier.split("/");
  const nameLength = specifier.startsWith("@") ? 2 : 1;
  const packageName = segments.slice(0, nameLength).join("/");
  const isDeep = segments.length > nameLength;
  return isDeep && packageName in dependencies ? packageName : undefined;
}

function resolvesToFile(specifier) {
  try {
    const path = fileURLToPath(import.meta.resolve(specifier));
    return existsSync(path) && statSync(path).isFile();
  } catch {
    return false;
  }
}

if (!existsSync(distributionDirectory)) {
  console.error(
    `Missing ${distributionDirectory}. Run \`pnpm -F @vllnt/ui build\` first.`,
  );
  process.exit(1);
}

const importers = new Map();
for (const entry of readdirSync(distributionDirectory, { recursive: true })) {
  const file = join(distributionDirectory, String(entry));
  if (!file.endsWith(".js")) continue;
  for (const [, , specifier] of readFileSync(file, "utf8").matchAll(
    specifierPattern,
  )) {
    if (deepDependencyImport(specifier) && !importers.has(specifier)) {
      importers.set(specifier, relative(packageDirectory, file));
    }
  }
}

const results = [...importers]
  .map(([specifier, file]) => ({
    file,
    ok: resolvesToFile(specifier),
    specifier,
  }))
  .sort((a, b) => a.specifier.localeCompare(b.specifier));

for (const { ok, specifier } of results) {
  console.log(`${ok ? "ok  " : "FAIL"}  ${specifier}`);
}

const unresolved = results.filter((result) => !result.ok);
if (unresolved.length > 0) {
  for (const { file, specifier } of unresolved) {
    console.error(
      `${file}: "${specifier}" does not resolve to a file under Node ESM.`,
    );
  }
  console.error(
    "Add the fully specified path (e.g. with .js) to dependencyDeepSpecifiers in tsup.config.ts.",
  );
  process.exit(1);
}

console.log(`All ${importers.size} deep dependency imports resolve.`);
