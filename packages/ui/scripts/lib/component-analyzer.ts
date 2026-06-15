/**
 * Shared source-analysis kernel for the generator scripts
 * (generate-docs, generate-stories, generate-tests, fix-stories,
 * verify-stories).
 *
 * These are intentionally regex/scanner heuristics — not a full TS parser —
 * tuned for the component conventions in packages/ui/src/components.
 * Fix a heuristic here and every generator picks it up.
 */

export type PropInfo = {
  description: string;
  name: string;
  required: boolean;
  type: string;
};

export type VariantInfo = {
  defaultValue?: string;
  name: string;
  values: string[];
};

export type TypeDefinition = {
  fields: PropInfo[];
  name: string;
  source: string;
};

/** Converts a kebab-case name to PascalCase (`data-table` → `DataTable`). */
export function toPascalCase(value: string): string {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

/** Converts a PascalCase name to kebab-case (`DataTable` → `data-table`). */
export function toKebabCase(value: string): string {
  return value.replaceAll(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Extracts CVA variant groups (names, values, defaults) from component
 * source using a brace-depth scanner over the `variants:` object.
 */
export function extractVariants(source: string): VariantInfo[] {
  const variants: VariantInfo[] = [];
  if (!source.includes("cva(")) return variants;

  const defaultsMatch = source.match(/defaultVariants\s*:\s*\{([^}]+)\}/s);
  const defaults: Record<string, string> = {};
  if (defaultsMatch?.[1]) {
    const defaultPairs = defaultsMatch[1].matchAll(
      /(\w+)\s*:\s*['"](\w+)['"]/g,
    );
    for (const match of defaultPairs) {
      if (match[1] && match[2]) {
        defaults[match[1]] = match[2];
      }
    }
  }

  const variantsStartMatch = source.match(/variants\s*:\s*\{/);
  if (!variantsStartMatch || variantsStartMatch.index === undefined) {
    return variants;
  }

  const variantsStartPos =
    variantsStartMatch.index + variantsStartMatch[0].length;
  let depth = 1;
  let variantsEndPos = variantsStartPos;

  for (let i = variantsStartPos; i < source.length; i++) {
    if (source[i] === "{") depth++;
    if (source[i] === "}") {
      depth--;
      if (depth === 0) {
        variantsEndPos = i;
        break;
      }
    }
  }

  const variantsBlock = source.slice(variantsStartPos, variantsEndPos);
  const variantTypeRegex = /(\w+)\s*:\s*\{/g;
  let typeMatch;

  while ((typeMatch = variantTypeRegex.exec(variantsBlock)) !== null) {
    const variantName = typeMatch[1];
    const typeStartPos = typeMatch.index + typeMatch[0].length;
    let typeDepth = 1;
    let typeEndPos = typeStartPos;

    for (let i = typeStartPos; i < variantsBlock.length; i++) {
      if (variantsBlock[i] === "{") typeDepth++;
      if (variantsBlock[i] === "}") {
        typeDepth--;
        if (typeDepth === 0) {
          typeEndPos = i;
          break;
        }
      }
    }

    const typeContent = variantsBlock.slice(typeStartPos, typeEndPos);
    const values: string[] = [];
    const keyRegex = /(\w+)\s*:\s*['"`,]/g;
    let keyMatch;

    while ((keyMatch = keyRegex.exec(typeContent)) !== null) {
      if (keyMatch[1]) values.push(keyMatch[1]);
    }

    if (values.length > 0 && variantName) {
      variants.push({
        defaultValue: defaults[variantName],
        name: variantName,
        values,
      });
    }
  }

  return variants;
}

/**
 * Extracts PascalCase component export names from `export { ... }` lists
 * (skipping `type` re-exports, honoring `as` aliases), `export const` /
 * `export function` declarations, and `export default`.
 */
export function extractExports(source: string): string[] {
  const exports: string[] = [];

  const namedExports = source.matchAll(/export\s*\{\s*([^}]+)\s*\}/g);
  for (const match of namedExports) {
    if (!match[1]) continue;
    for (const rawName of match[1].split(",")) {
      const trimmed = rawName.trim();
      if (trimmed.startsWith("type ")) continue;
      const name = trimmed.split(/\s+as\s+/)[0]?.trim() ?? "";
      if (name.length > 0 && /^[A-Z]/.test(name)) {
        exports.push(name);
      }
    }
  }

  const constExports = source.matchAll(
    /export\s+(?:const|function)\s+([A-Z]\w+)/g,
  );
  for (const match of constExports) {
    if (match[1]) exports.push(match[1]);
  }

  const defaultExport = source.match(/export\s+default\s+([A-Z]\w+)/);
  if (defaultExport?.[1]) {
    exports.push(defaultExport[1]);
  }

  return [...new Set(exports)];
}

/**
 * Returns the brace-delimited block starting at the first `{` at or after
 * `startIndex`, with nesting handled by depth counting.
 */
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

/**
 * Parses `name?: Type` members out of a type/interface body, one per line.
 * Comment lines are skipped; trailing separators are stripped from types.
 */
export function parsePropsFromBlock(block: string): PropInfo[] {
  const props: PropInfo[] = [];

  for (const line of block.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*")) {
      continue;
    }

    const match = trimmed.match(/^(\w+)(\??)\s*:\s*(.+?)\s*;?\s*$/);
    if (!match) continue;

    const name = match[1] ?? "";
    const required = match[2] !== "?";
    const type = (match[3] ?? "").trim().replace(/[;,]$/, "");

    if (name && type) {
      props.push({ description: "", name, required, type });
    }
  }

  return props;
}

/**
 * Extracts every object-literal `type X = { ... }` and `interface X { ... }`
 * definition with its parsed fields.
 */
export function extractAllTypes(source: string): TypeDefinition[] {
  const types: TypeDefinition[] = [];

  const typeRegex = /(?:export\s+)?type\s+(\w+)\s*=\s*\{/g;
  let match;
  while ((match = typeRegex.exec(source)) !== null) {
    const name = match[1];
    if (!name) continue;
    const block = extractTypeBlock(source, match.index + match[0].length - 1);
    if (block) {
      types.push({ fields: parsePropsFromBlock(block), name, source: block });
    }
  }

  const interfaceRegex =
    /(?:export\s+)?interface\s+(\w+)\s*(?:extends\s+[^{]+)?\{/g;
  while ((match = interfaceRegex.exec(source)) !== null) {
    const name = match[1];
    if (!name) continue;
    const block = extractTypeBlock(source, match.index + match[0].length - 1);
    if (block) {
      types.push({ fields: parsePropsFromBlock(block), name, source: block });
    }
  }

  return types;
}
