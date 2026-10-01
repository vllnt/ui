import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const EXPORT_LIST = /export\s+(?:type\s+)?{([^}]*)}/g;
const EXPORT_STAR = /export\s+\*\s+from\s+["'](\.{1,2}\/[^"']+)["']/g;

const listNames = (list: string, pick: "imported" | "local"): string[] =>
  list
    .split(",")
    .map((entry) => entry.replace(/^\s*type\s+/, "").trim())
    .filter(Boolean)
    .map((binding) => {
      const parts = binding.split(/\s+as\s+/);
      return (pick === "imported" ? parts[0] : parts.at(-1))?.trim() ?? "";
    })
    .filter(Boolean);

const resolveModule = (from: string, specifier: string): string | undefined => {
  const base = join(dirname(from), specifier);
  return [`${base}.ts`, `${base}.tsx`, join(base, "index.ts")].find(
    (candidate) => existsSync(candidate),
  );
};

/**
 * Public `@vllnt/ui` export names, read from the package's re-export chain
 * (`export { … }` lists and `export * from "./…"` re-exports).
 *
 * @param file - entry file to start from, e.g. `packages/ui/src/index.ts`.
 * @returns every exported binding name.
 */
export const collectPublicExports = (file: string): Set<string> => {
  const source = readFileSync(file, "utf8");
  const listed = [...source.matchAll(EXPORT_LIST)].flatMap(([, list]) =>
    listNames(list ?? "", "local"),
  );
  const reexported = [...source.matchAll(EXPORT_STAR)].flatMap(
    ([, specifier]) => {
      const target = resolveModule(file, specifier ?? "");
      return target ? [...collectPublicExports(target)] : [];
    },
  );
  return new Set([...listed, ...reexported]);
};

/**
 * Named bindings a module imports from `packageName` (static
 * `import { … } from "<packageName>"` statements, `import type` included).
 *
 * @param source - module source text.
 * @param packageName - import specifier to match, e.g. `@vllnt/ui`.
 * @returns the imported (not local) binding names.
 */
export const importedNames = (
  source: string,
  packageName: string,
): string[] => {
  const escaped = packageName.replaceAll(/[$()*+./?[\\\]^{|}]/g, "\\$&");
  const pattern = new RegExp(
    `import\\s+(?:type\\s+)?\\{([^}]*)\\}\\s+from\\s+["']${escaped}["']`,
    "g",
  );
  return [...source.matchAll(pattern)].flatMap(([, list]) =>
    listNames(list ?? "", "imported"),
  );
};
