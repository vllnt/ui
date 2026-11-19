import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const FIX =
  "bg-muted is #000000 in dark, so a skeleton, track or placeholder drawn only with this fill disappears. Use bg-secondary (DESIGN.md, Dark surfaces are pure black).";
const SOURCE_DIRECTORIES = ["app", "components"] as const;
const CLASS_DELIMITERS = /[\s"'`{}]+/;

const MUTED_FILL = /^bg-muted(?:\/\d+)?$/;
const SECONDARY_FILL = /^bg-secondary(?:\/\d+)?$/;
/** A skeleton pulses; a track or handle is a bar at most 0.5rem tall. */
const SKELETON_OR_BAR = /^(?:animate-pulse|h-(?:0\.5|1|1\.5|2))$/;

/**
 * Placeholders drawn with a fill alone, with no animate-pulse or bar height,
 * so SKELETON_OR_BAR cannot see them. Each file with the number of static
 * `bg-secondary` fills it must keep, counting the ones SKELETON_OR_BAR also
 * finds.
 */
const SECONDARY_STRUCTURAL_FILLS: readonly (readonly [string, number])[] = [
  ["components/component-preview/component-preview.tsx", 4], // two skeletons, a mock block, the aspect-ratio box
  ["components/storybook-embed/storybook-embed.tsx", 2], // loading overlay and placeholder
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

function classNames(text: string): string[] {
  return text
    .split(CLASS_DELIMITERS)
    .map((name) => name.slice(name.lastIndexOf(":") + 1));
}

/** Lines that fill a skeleton, track or handle with bg-muted. */
function mutedStructuralFills(source: string): string[] {
  return source.split("\n").filter((line) => {
    const classes = classNames(line);
    return (
      classes.some((name) => SKELETON_OR_BAR.test(name)) &&
      classes.some((name) => MUTED_FILL.test(name))
    );
  });
}

function secondaryFills(source: string): number {
  return source
    .split(CLASS_DELIMITERS)
    .filter((name) => SECONDARY_FILL.test(name)).length;
}

describe("registry skeletons, tracks and placeholders", () => {
  it("flags a muted skeleton or bar and passes a secondary one", () => {
    expect(
      mutedStructuralFills('"size-full animate-pulse bg-muted"'),
    ).toHaveLength(1);
    expect(mutedStructuralFills('"h-1 rounded-full bg-muted/40"')).toHaveLength(
      1,
    );
    expect(
      mutedStructuralFills('"size-full animate-pulse bg-secondary"'),
    ).toEqual([]);
    expect(
      mutedStructuralFills('"rounded-md border bg-muted px-3 py-2"'),
    ).toEqual([]);
  });

  it("are filled with bg-secondary", () => {
    const offenders = SOURCE_DIRECTORIES.flatMap((directory) =>
      listSources(path.join(process.cwd(), directory)),
    ).flatMap((file) =>
      mutedStructuralFills(readFileSync(file, "utf8")).map(
        (line) => `${path.relative(process.cwd(), file)}: ${line.trim()}`,
      ),
    );
    expect(offenders, FIX).toEqual([]);
  });

  it("keeps the placeholder fills on bg-secondary", () => {
    const regressions = SECONDARY_STRUCTURAL_FILLS.flatMap(
      ([file, expected]) => {
        const found = secondaryFills(
          readFileSync(path.join(process.cwd(), file), "utf8"),
        );
        return found < expected
          ? [`${file}: expected ${expected}, found ${found}`]
          : [];
      },
    );
    expect(regressions, FIX).toEqual([]);
  });
});
