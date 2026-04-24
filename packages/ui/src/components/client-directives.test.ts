import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const COMPONENTS_ROOT = join(__dirname);
const CLIENT_HOOKS = [
  "useActionState",
  "useCallback",
  "useContext",
  "useDeferredValue",
  "useEffect",
  "useId",
  "useImperativeHandle",
  "useInsertionEffect",
  "useLayoutEffect",
  "useMemo",
  "useOptimistic",
  "useReducer",
  "useRef",
  "useState",
  "useSyncExternalStore",
  "useTransition",
] as const;
const SKIPPED_SUFFIXES = [".stories.tsx", ".test.tsx", ".visual.tsx"] as const;

function listTypeScriptFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      return listTypeScriptFiles(path);
    }

    return path.endsWith(".tsx") ? [path] : [];
  });
}

function usesClientHooks(source: string): boolean {
  return CLIENT_HOOKS.some((hook) =>
    new RegExp(`\\b${hook}\\b`, "u").test(source),
  );
}

function hasUseClientDirective(source: string): boolean {
  const firstNonEmptyLine = source
    .split(/\r?\n/u)
    .find((line) => line.trim().length > 0)
    ?.trim();

  return (
    firstNonEmptyLine === '"use client";' ||
    firstNonEmptyLine === "'use client';"
  );
}

describe("client directives", () => {
  it("marks hook-based shipped components as client components", () => {
    const missingDirectiveFiles = listTypeScriptFiles(COMPONENTS_ROOT)
      .filter((filePath) =>
        SKIPPED_SUFFIXES.every((suffix) => !filePath.endsWith(suffix)),
      )
      .filter((filePath) => {
        const source = readFileSync(filePath, "utf8");
        return usesClientHooks(source) && !hasUseClientDirective(source);
      })
      .map((filePath) =>
        filePath.replace(`${COMPONENTS_ROOT}/`, "components/"),
      );

    expect(missingDirectiveFiles).toEqual([]);
  });
});
