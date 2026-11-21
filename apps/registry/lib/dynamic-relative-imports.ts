const DYNAMIC_RELATIVE_IMPORT =
  /\bimport\(\s*["'`](\.{1,2}\/[^"'`]*)["'`]\s*\)/g;

/**
 * Relative specifiers of the `import("./x")` and `import("../x")` calls in a
 * component source.
 *
 * @param source - component source text.
 * @returns each relative specifier, in source order.
 */
export const findDynamicRelativeImports = (source: string): string[] =>
  [...source.matchAll(DYNAMIC_RELATIVE_IMPORT)].map(
    ([, specifier]) => specifier ?? "",
  );

/**
 * Fail when a component source lazy-loads a relative path. The shim rewrite
 * turns such a path into `import("@vllnt/ui")`, so the lazy chunk becomes the
 * whole package and the names it reads must be public exports. Lazy-load a
 * package specifier instead.
 *
 * @param source - component source text.
 * @param file - file shown in the error.
 * @param allowed - relative specifiers this component may lazy-load.
 * @throws when `source` has a dynamic relative import that is not allowed.
 */
export const assertNoDynamicRelativeImports = (
  source: string,
  file: string,
  allowed: ReadonlySet<string> = new Set(),
): void => {
  const found = findDynamicRelativeImports(source).filter(
    (specifier) => !allowed.has(specifier),
  );
  if (found.length > 0) {
    throw new Error(
      `dynamic relative import in ${file}: shims rewrite it to @vllnt/ui; ` +
        `import a package specifier instead (found: ${found.join(", ")})`,
    );
  }
};
