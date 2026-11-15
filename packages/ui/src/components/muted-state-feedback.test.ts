import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

const COMPONENTS_ROOT = __dirname;
const SKIPPED_SUFFIXES = [
  ".stories.tsx",
  ".test.tsx",
  ".visual.tsx",
  ".visual.fixture.tsx",
  ".spec.tsx",
] as const;

/**
 * Still on the old pattern in a separate change. Remove this exemption when
 * the accordion moves to the accent token.
 */
const PENDING_MIGRATION = join("atoms", "accordion", "accordion.tsx");

const MUTED_FILL =
  /((?:[^\s"'`{}]+:)*)bg-muted(?:\/[^\s"'`{}]+)?(?=[\s"'`}]|$)/g;

const STATE_VARIANT =
  /(?:^|:)(?:hover|focus|focus-visible|focus-within|active|group-hover|group-focus|peer-[\w-]+|aria-[\w-]+|data-\[[^\]]+]|open|checked|selected)(?=:)/;

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      return listSourceFiles(path);
    }
    const isSource =
      path.endsWith(".tsx") &&
      !SKIPPED_SUFFIXES.some((suffix) => path.endsWith(suffix));
    return isSource ? [path] : [];
  });
}

function mutedStateFills(source: string): string[] {
  return [...source.matchAll(MUTED_FILL)]
    .filter(([, variants = ""]) => STATE_VARIANT.test(variants))
    .map(([fill]) => fill);
}

describe("muted fill as state feedback", () => {
  it("is found behind a state variant and ignored when static", () => {
    expect(
      mutedStateFills(
        '"hover:bg-muted/50 data-[state=inactive]:hover:bg-muted bg-muted [&_code]:bg-muted"',
      ),
    ).toEqual(["hover:bg-muted/50", "data-[state=inactive]:hover:bg-muted"]);
  });

  it("is not used for hover, focus, active, selected or data-state styles", () => {
    const offenders = listSourceFiles(COMPONENTS_ROOT)
      .map((path) => relative(COMPONENTS_ROOT, path))
      .filter((file) => file !== PENDING_MIGRATION)
      .flatMap((file) =>
        mutedStateFills(readFileSync(join(COMPONENTS_ROOT, file), "utf8")).map(
          (fill) => `${file}: ${fill}`,
        ),
      );
    expect(offenders).toEqual([]);
  });
});
