import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const FIX = "Use hover:bg-secondary (DESIGN.md, Dark surface ladder).";
const SOURCE_DIRECTORIES = ["app", "components"] as const;
const CLASS_DELIMITERS = /[\s"'`{}]+/;

const MUTED_FILL =
  /((?:[^\s"':`{}]+:)*)bg-muted(?:\/[^\s"'`{}]+)?(?=[\s"'`}]|$)/g;

const STATE_VARIANT =
  /(?:^|:)(?:hover|focus|focus-visible|focus-within|active|group-hover|group-focus|peer-[\w-]+|aria-[\w-]+|data-\[[^\]]+]|open|checked|selected)(?=:)/;

/**
 * Links and buttons that moved off `hover:bg-muted`, with the number of
 * `hover:bg-secondary` classes in each file. Dark `--muted` is the darkest
 * surface, so a muted hover fill is almost the page color.
 */
const MIGRATED_HOVERS: readonly (readonly [string, number])[] = [
  ["app/[locale]/components/[slug]/page.tsx", 2],
  ["app/[locale]/components/[slug]/playground/page.tsx", 1],
  ["app/[locale]/families/[category]/page.tsx", 1],
  ["app/[locale]/not-found.tsx", 3],
  ["app/[locale]/templates/[slug]/page.tsx", 2],
  ["components/component-mdx/component-mdx.tsx", 1],
  ["components/component-mdx/storybook-link.tsx", 1],
  ["components/header/header.tsx", 1],
  ["components/landing/landing.tsx", 7],
  ["components/platform-selector/platform-selector.tsx", 1],
];

function listSources(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const entryPath = path.join(directory, entry);
    if (statSync(entryPath).isDirectory()) {
      return listSources(entryPath);
    }
    const isSource =
      entryPath.endsWith(".tsx") && !entryPath.endsWith(".test.tsx");
    return isSource ? [entryPath] : [];
  });
}

function mutedStateFills(source: string): string[] {
  return [...source.matchAll(MUTED_FILL)]
    .filter(([, variants = ""]) => STATE_VARIANT.test(variants))
    .map(([fill]) => fill);
}

describe("registry hover fills", () => {
  it("do not use bg-muted behind a state variant", () => {
    const offenders = SOURCE_DIRECTORIES.flatMap((directory) =>
      listSources(path.join(process.cwd(), directory)),
    ).flatMap((file) =>
      mutedStateFills(readFileSync(file, "utf8")).map(
        (fill) => `${path.relative(process.cwd(), file)}: ${fill}`,
      ),
    );
    expect(
      offenders,
      `bg-muted is almost the page color in dark and cannot show a hover. ${FIX}`,
    ).toEqual([]);
  });

  it("keep the migrated links on hover:bg-secondary", () => {
    const regressions = MIGRATED_HOVERS.flatMap(([file, expected]) => {
      const found = readFileSync(path.join(process.cwd(), file), "utf8")
        .split(CLASS_DELIMITERS)
        .filter((name) => name === "hover:bg-secondary").length;
      return found < expected
        ? [`${file}: expected ${expected}, found ${found}`]
        : [];
    });
    expect(
      regressions,
      `These hovers moved off bg-muted and must not go back to bg-muted or bg-accent (accent is a brand color in presets). ${FIX}`,
    ).toEqual([]);
  });
});
