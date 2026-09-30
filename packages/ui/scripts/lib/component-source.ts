/**
 * Regex-based helpers shared by the Storybook scripts (generate-stories,
 * generate-docs, verify-stories) to read component source files.
 */

import { existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

/** Atomic Design level folders under `src/components`, lowest level first. */
export const COMPONENT_LEVELS = ["atoms", "molecules", "organisms", "templates"] as const;

export interface ComponentDirectory {
  name: string;
  path: string;
}

const listDirectories = (directory: string): string[] =>
  readdirSync(directory).filter((entry) => statSync(join(directory, entry)).isDirectory());

/**
 * Every component folder (`<componentsDir>/<level>/<name>/`), sorted by name.
 */
export function listComponentDirectories(componentsDir: string): ComponentDirectory[] {
  return COMPONENT_LEVELS.map((level) => join(componentsDir, level))
    .filter((levelDirectory) => existsSync(levelDirectory))
    .flatMap((levelDirectory) =>
      listDirectories(levelDirectory).map((name) => ({ name, path: join(levelDirectory, name) })),
    )
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

export interface VariantInfo {
  name: string;
  values: string[];
  defaultValue?: string;
}

export interface PropInfo {
  name: string;
  type: string;
  required: boolean;
}

export function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

/** Returns the body between `startIndex`'s first `{` and its matching `}`. */
export function extractTypeBlock(source: string, startIndex: number): string {
  let depth = 0;
  let blockStart = -1;

  for (let i = startIndex; i < source.length; i++) {
    if (source[i] === "{") {
      if (depth === 0) blockStart = i + 1;
      depth++;
    }

    if (source[i] === "}") {
      depth--;
      if (depth === 0) return source.slice(blockStart, i);
    }
  }

  return "";
}

/** Parses one-line `name?: type;` members of a type/interface body. */
export function parsePropsFromBlock(block: string): PropInfo[] {
  const props: PropInfo[] = [];

  for (const line of block.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*")) continue;

    const match = trimmed.match(/^(\w+)(\??)\s*:\s*(.+?)\s*;?\s*$/);
    if (!match) continue;

    const name = match[1] ?? "";
    const required = match[2] !== "?";
    const type = (match[3] ?? "").trim().replace(/[;,]$/, "");

    if (name && type) {
      props.push({ name, required, type });
    }
  }

  return props;
}

function findClosingBrace(source: string, openPos: number): number {
  let depth = 1;

  for (let i = openPos; i < source.length; i++) {
    if (source[i] === "{") depth++;
    if (source[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }

  return openPos;
}

/**
 * Extracts CVA variant names and values. `valueKeyPattern` decides which
 * `key: …` entries count as variant values (callers differ on `key,`).
 */
export function extractVariants(
  source: string,
  valueKeyPattern = /(\w+)\s*:\s*['"`]/g,
): VariantInfo[] {
  const variants: VariantInfo[] = [];
  if (!source.includes("cva(")) return variants;

  const defaultsMatch = source.match(/defaultVariants\s*:\s*\{([^}]+)\}/s);
  const defaults: Record<string, string> = {};
  if (defaultsMatch?.[1]) {
    for (const match of defaultsMatch[1].matchAll(/(\w+)\s*:\s*['"](\w+)['"]/g)) {
      if (match[1] && match[2]) defaults[match[1]] = match[2];
    }
  }

  const variantsStartMatch = source.match(/variants\s*:\s*\{/);
  if (!variantsStartMatch || variantsStartMatch.index === undefined) return variants;

  const variantsStartPos = variantsStartMatch.index + variantsStartMatch[0].length;
  const variantsBlock = source.slice(
    variantsStartPos,
    findClosingBrace(source, variantsStartPos),
  );

  for (const typeMatch of variantsBlock.matchAll(/(\w+)\s*:\s*\{/g)) {
    const variantName = typeMatch[1];
    const typeStartPos = (typeMatch.index ?? 0) + typeMatch[0].length;
    const typeContent = variantsBlock.slice(
      typeStartPos,
      findClosingBrace(variantsBlock, typeStartPos),
    );
    const values: string[] = [];

    for (const keyMatch of typeContent.matchAll(valueKeyPattern)) {
      if (keyMatch[1]) values.push(keyMatch[1]);
    }

    if (values.length > 0 && variantName) {
      variants.push({ defaultValue: defaults[variantName], name: variantName, values });
    }
  }

  return variants;
}

/** PascalCase value exports (`export { A, B as C }`, `export const|function A`). */
export function extractExports(
  source: string,
  { includeDefault = false }: { includeDefault?: boolean } = {},
): string[] {
  const exports: string[] = [];

  for (const match of source.matchAll(/export\s*\{\s*([^}]+)\s*\}/g)) {
    if (!match[1]) continue;
    for (const rawName of match[1].split(",")) {
      const trimmed = rawName.trim();
      if (trimmed.startsWith("type ")) continue;
      const name = trimmed.split(/\s+as\s+/)[0]?.trim() ?? "";
      if (name.length > 0 && /^[A-Z]/.test(name)) exports.push(name);
    }
  }

  for (const match of source.matchAll(/export\s+(?:const|function)\s+([A-Z]\w+)/g)) {
    if (match[1]) exports.push(match[1]);
  }

  if (includeDefault) {
    const defaultExport = source.match(/export\s+default\s+([A-Z]\w+)/);
    if (defaultExport?.[1]) exports.push(defaultExport[1]);
  }

  return [...new Set(exports)];
}
