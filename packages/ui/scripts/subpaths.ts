/**
 * Per-component subpath exports (`@vllnt/ui/button`, `@vllnt/ui/toggle-group`).
 *
 * The root `@vllnt/ui` entry is a barrel. A Next.js server component that
 * imports it makes every `"use client"` module the barrel reaches a client
 * reference, so a route ships client JS for components it never renders.
 * A subpath reaches only its own component's modules.
 *
 * The subpaths are derived from the barrel, so they cannot drift from it:
 * one subpath per component directory named in `src/components/index.ts`,
 * re-exporting exactly the names the root exports from that directory, plus
 * `utils` for `cn`. `scripts/write-subpaths.ts` calls `writeSubpaths` after
 * tsup; `package.json` maps `./*` to `dist/subpaths/*.js` and `*.d.ts`.
 *
 * Each `.js` file re-exports from the directory's own modules and carries no
 * client directive of its own, so it reaches the client modules of that
 * directory only: `button` is server-safe, while `spinner` and `chart` mix a
 * server-safe module with a client one and bring both.
 * Each `.d.ts` file re-exports the same names from the root declarations.
 */

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import ts from "typescript";

type ExportName = { exported: string; local: string };

/** One `@vllnt/ui/<name>` subpath. */
export type Subpath = {
  /** Runtime exports, grouped by the module they come from (relative to `src`). */
  modules: { names: ExportName[]; specifier: string }[];
  name: string;
  /** Type-only exports. */
  types: string[];
};

type Entry = ExportName & { isTypeOnly: boolean; specifier: string };

/** A barrel specifier inside `src/components`. */
const COMPONENT_SPECIFIER = /^\.\/[a-z]+\/[a-z0-9-]+(?:\/[a-z0-9-]+)?$/;

/** Root-index modules outside the barrel that get a subpath of their own. */
const LIBRARY_SUBPATHS: Record<string, string> = {
  "./lib/cx": "utils",
  "./lib/utils": "utils",
};

/** The `export { … } from "…"` statements of a file. */
function exportStatements(
  source: string,
  fileName: string,
): { elements: Entry[]; specifier: string; text: string }[] {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest);
  return file.statements.flatMap((statement) => {
    if (!ts.isExportDeclaration(statement)) return [];
    const specifier = statement.moduleSpecifier;
    const clause = statement.exportClause;
    const text = statement.getText(file);
    if (!specifier || !ts.isStringLiteral(specifier)) {
      throw new Error(`${fileName}: unsupported export: ${text}`);
    }
    const elements =
      clause && ts.isNamedExports(clause)
        ? clause.elements.map((element) => ({
            exported: element.name.text,
            isTypeOnly: statement.isTypeOnly || element.isTypeOnly,
            local: (element.propertyName ?? element.name).text,
            specifier: specifier.text,
          }))
        : [];
    return [{ elements, specifier: specifier.text, text }];
  });
}

function addEntry(
  subpaths: Map<string, Subpath>,
  name: string,
  entry: Entry,
): void {
  const subpath = subpaths.get(name) ?? { modules: [], name, types: [] };
  subpaths.set(name, subpath);
  if (entry.isTypeOnly) {
    if (!subpath.types.includes(entry.exported)) {
      subpath.types.push(entry.exported);
    }
    return;
  }
  let module = subpath.modules.find(
    (candidate) => candidate.specifier === entry.specifier,
  );
  if (!module) {
    module = { names: [], specifier: entry.specifier };
    subpath.modules.push(module);
  }
  if (!module.names.some((known) => known.exported === entry.exported)) {
    module.names.push({ exported: entry.exported, local: entry.local });
  }
}

/**
 * Builds the subpath list from the barrel (`src/components/index.ts`) and the
 * root index (`src/index.ts`). Throws on any export shape it cannot mirror, so
 * a barrel change can never drop a name silently.
 */
export function collectSubpaths(
  componentsIndex: string,
  rootIndex: string,
): Subpath[] {
  const subpaths = new Map<string, Subpath>();

  const barrel = ts.createSourceFile(
    "components/index.ts",
    componentsIndex,
    ts.ScriptTarget.Latest,
  );
  for (const statement of barrel.statements) {
    if (!ts.isExportDeclaration(statement)) {
      throw new Error(
        `components/index.ts: unsupported statement: ${statement.getText(barrel)}`,
      );
    }
  }

  for (const statement of exportStatements(
    componentsIndex,
    "components/index.ts",
  )) {
    // `./<level>/<directory>` or `./<level>/<directory>/<module>`.
    const path = statement.specifier.replace(/^\.\//, "");
    const directory = COMPONENT_SPECIFIER.test(statement.specifier)
      ? path.split("/")[1]
      : undefined;
    if (!directory || statement.elements.length === 0) {
      throw new Error(
        `components/index.ts: unsupported export: ${statement.text}`,
      );
    }
    for (const entry of statement.elements) {
      addEntry(subpaths, directory, {
        ...entry,
        specifier: `./components/${path}`,
      });
    }
  }

  for (const name of Object.values(LIBRARY_SUBPATHS)) {
    if (subpaths.has(name)) {
      throw new Error(`Subpath "${name}" is both a component and a library.`);
    }
  }
  for (const statement of exportStatements(rootIndex, "index.ts")) {
    const name = LIBRARY_SUBPATHS[statement.specifier];
    if (!name) continue;
    for (const entry of statement.elements) addEntry(subpaths, name, entry);
  }
  for (const [specifier, name] of Object.entries(LIBRARY_SUBPATHS)) {
    if (!subpaths.has(name)) {
      throw new Error(`src/index.ts no longer exports ${specifier}.`);
    }
  }

  return [...subpaths.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Renders the `.js` and `.d.ts` files of one subpath. */
export function renderSubpath(
  subpath: Subpath,
  resolveModule: (specifier: string) => string,
): { declarations: string; module: string } {
  const header =
    "// Generated by scripts/subpaths.ts from the @vllnt/ui barrel. Do not edit.\n";
  const moduleLines = subpath.modules.map(
    ({ names, specifier }) =>
      `export { ${names
        .map(({ exported, local }) =>
          local === exported ? local : `${local} as ${exported}`,
        )
        .join(", ")} } from "${resolveModule(specifier)}";`,
  );
  const declarationNames = [
    ...subpath.modules.flatMap(({ names }) =>
      names.map(({ exported }) => exported),
    ),
    ...subpath.types.map((name) => `type ${name}`),
  ];

  return {
    declarations: `${header}export { ${declarationNames.join(", ")} } from "../index.js";\n`,
    // A type-only subpath still needs a module to resolve at runtime.
    module: `${header}${moduleLines.length > 0 ? moduleLines.join("\n") : "export {};"}\n`,
  };
}

function builtModule(distribution: string, specifier: string): string {
  const path = specifier.slice(2);
  const target = resolve(distribution, path);
  if (existsSync(`${target}.js`)) return `../${path}.js`;
  if (existsSync(join(target, "index.js"))) return `../${path}/index.js`;
  throw new Error(`No built module for ${specifier} in ${distribution}.`);
}

/** Writes `dist/subpaths/<name>.js` and `.d.ts` for every subpath. */
export async function writeSubpaths(packageDirectory: string): Promise<number> {
  const source = join(packageDirectory, "src");
  const distribution = join(packageDirectory, "dist");
  const subpaths = collectSubpaths(
    await readFile(join(source, "components/index.ts"), "utf8"),
    await readFile(join(source, "index.ts"), "utf8"),
  );
  const output = join(distribution, "subpaths");
  await mkdir(output, { recursive: true });

  await Promise.all(
    subpaths.map(async (subpath) => {
      const files = renderSubpath(subpath, (specifier) =>
        builtModule(distribution, specifier),
      );
      await writeFile(join(output, `${subpath.name}.js`), files.module);
      await writeFile(join(output, `${subpath.name}.d.ts`), files.declarations);
    }),
  );

  return subpaths.length;
}
