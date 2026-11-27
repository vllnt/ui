import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

/*
 * Dark surfaces are flat and near black (DESIGN.md, "Dark surfaces are flat and near black"):
 * --background and --card render #000000 and --popover #0a0a0a, so a
 * hairline border is what gives a raised surface or a divider its edge. A
 * preset can keep --muted at #000000 as well.
 */

const COMPONENTS_ROOT = __dirname;
const SKIPPED_SUFFIXES = [
  ".stories.tsx",
  ".test.tsx",
  ".visual.tsx",
  ".visual.fixture.tsx",
  ".spec.tsx",
] as const;

const CLASS_DELIMITERS = /[\s"'`{}]+/;
const SURFACE_FILL = /^bg-(?:card|popover)(?:\/\d+)?$/;
const BORDER_WIDTH = /^border(?:-[belr-txy])?(?:-\d+)?$/;
const MUTED_FILL = /^bg-muted(?:\/\d+)?$/;
const SECONDARY_FILL = /^bg-secondary(?:\/\d+)?$/;
const MUTED_STROKE = /^stroke-muted(?:\/\d+)?$/;
const HAIRLINE_SIZE = /^[hw]-px$/;
/** A skeleton pulses; a track or handle is a bar at most 0.5rem tall. */
const SKELETON_OR_BAR = /^(?:animate-pulse|h-(?:0\.5|1|1\.5|2))$/;

/**
 * Structural fills whose class is not beside the size classes (a tone map or a
 * list), so SKELETON_OR_BAR cannot see them. Each file with the number of
 * static `bg-secondary` fills it must keep, counting the ones SKELETON_OR_BAR
 * also finds.
 */
const SECONDARY_STRUCTURAL_FILLS: readonly (readonly [string, number])[] = [
  ["atoms/avatar/avatar.tsx", 1], // fallback disc
  ["atoms/meter/meter.tsx", 2], // track and empty segment
  ["atoms/presence-stack/presence-stack.tsx", 1], // overflow disc
  ["atoms/progress-bar/progress-bar.tsx", 3], // track variants and two skeletons
  ["atoms/tldr-section/tldr-section.tsx", 4], // skeleton lines
  ["organisms/activity-heatmap/activity-heatmap.tsx", 1], // empty cell
  ["organisms/gantt-chart/gantt-chart.tsx", 1], // neutral bar
  ["organisms/historic-timeline/historic-timeline.tsx", 1], // neutral era band
];

const SURFACE_FIX =
  "A bg-card or bg-popover fill is #000000 or #0a0a0a in dark, next to the page color. Draw its edge with border (the --border hairline).";
const DIVIDER_FIX =
  "bg-muted can be the page color in dark, so this divider disappears. Use bg-border.";
const STRUCTURAL_FIX =
  "bg-muted can be the page color in dark, so a skeleton, track or handle drawn only with this fill disappears. Use bg-secondary (#141414) at the same opacity.";

const STROKE_FIX =
  "stroke-muted can be the page color in dark, so an SVG ring, arc or track drawn with it disappears. Use stroke-secondary (#141414).";

/** The class name without its variant prefix: `data-[x]:hover:bg-card` is `bg-card`. */
function baseClass(name: string): string {
  return name.slice(name.lastIndexOf(":") + 1);
}

function classesOf(text: string): string[] {
  return text.split(CLASS_DELIMITERS);
}

/** True when a card or popover fill has no border width class in the same source. */
function lacksBorder(source: string): boolean {
  const classes = classesOf(source).map((name) => baseClass(name));
  return (
    classes.some((name) => SURFACE_FILL.test(name)) &&
    !classes.some((name) => BORDER_WIDTH.test(name))
  );
}

/** Lines that fill a shape (matched by `shape`) with bg-muted. */
function mutedFills(source: string, shape: RegExp): string[] {
  return source.split("\n").filter((line) => {
    const classes = classesOf(line).map((name) => baseClass(name));
    return (
      classes.some((name) => shape.test(name)) &&
      classes.some((name) => MUTED_FILL.test(name))
    );
  });
}

/** Lines that stroke an SVG shape with stroke-muted. */
function mutedStrokes(source: string): string[] {
  return source
    .split("\n")
    .filter((line) =>
      classesOf(line).some((name) => MUTED_STROKE.test(baseClass(name))),
    );
}

/** Lines that give a one-pixel divider a muted fill. */
function mutedDividers(source: string): string[] {
  return mutedFills(source, HAIRLINE_SIZE);
}

/** Lines that fill a skeleton, track or handle with bg-muted. */
function mutedStructuralFills(source: string): string[] {
  return mutedFills(source, SKELETON_OR_BAR);
}

/** Missing static bg-secondary fills in a source, as `expected N, found M`. */
function missingSecondaryFills(
  source: string,
  expected: number,
): string | undefined {
  const found = classesOf(source).filter((name) =>
    SECONDARY_FILL.test(name),
  ).length;
  return found < expected ? `expected ${expected}, found ${found}` : undefined;
}

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

const sources = listSourceFiles(COMPONENTS_ROOT).map((path) => ({
  file: relative(COMPONENTS_ROOT, path),
  source: readFileSync(path, "utf8"),
}));

describe("card and popover fills on a black page", () => {
  it("flags a fill with no border and passes one that draws a border", () => {
    expect(lacksBorder('"rounded-md bg-popover p-2"')).toBe(true);
    expect(lacksBorder('"rounded-md bg-card/80"')).toBe(true);
    expect(lacksBorder('"rounded-md border bg-popover"')).toBe(false);
    expect(lacksBorder('"border-b bg-card"')).toBe(false);
    expect(lacksBorder('"rounded-md bg-background"')).toBe(false);
  });

  it("is drawn with a border in every component file", () => {
    const offenders = sources
      .filter(({ source }) => lacksBorder(source))
      .map(({ file }) => file);
    expect(offenders, SURFACE_FIX).toEqual([]);
  });
});

describe("one-pixel dividers on a black page", () => {
  it("flags a muted divider and passes a border one", () => {
    expect(mutedDividers('"-m-1 h-px bg-muted"')).toHaveLength(1);
    expect(mutedDividers('"w-px bg-muted/50"')).toHaveLength(1);
    expect(mutedDividers('"-m-1 h-px bg-border"')).toEqual([]);
    expect(mutedDividers('"h-2 rounded-full bg-muted"')).toEqual([]);
  });

  it("are drawn with bg-border in every component file", () => {
    const offenders = sources.flatMap(({ file, source }) =>
      mutedDividers(source).map((line) => `${file}: ${line.trim()}`),
    );
    expect(offenders, DIVIDER_FIX).toEqual([]);
  });
});

describe("SVG rings, arcs and tracks on a black page", () => {
  it("flags a muted stroke and passes a secondary one", () => {
    expect(mutedStrokes('className="stroke-muted"')).toHaveLength(1);
    expect(mutedStrokes('"dark:stroke-muted/50 fill-none"')).toHaveLength(1);
    expect(mutedStrokes('className="stroke-secondary"')).toEqual([]);
    expect(mutedStrokes('"stroke-muted-foreground"')).toEqual([]);
  });

  it("are stroked with stroke-secondary in every component file", () => {
    const offenders = sources.flatMap(({ file, source }) =>
      mutedStrokes(source).map((line) => `${file}: ${line.trim()}`),
    );
    expect(offenders, STROKE_FIX).toEqual([]);
  });
});

describe("skeletons, tracks and handles on a black page", () => {
  it("flags a muted skeleton or bar and passes a secondary one", () => {
    expect(
      mutedStructuralFills('"animate-pulse rounded-md bg-muted"'),
    ).toHaveLength(1);
    expect(
      mutedStructuralFills('"h-2 overflow-hidden rounded-full bg-muted"'),
    ).toHaveLength(1);
    expect(mutedStructuralFills('"h-1 w-full bg-muted/40"')).toHaveLength(1);
    expect(
      mutedStructuralFills('"animate-pulse rounded-md bg-secondary"'),
    ).toEqual([]);
    expect(
      mutedStructuralFills('"h-2 overflow-hidden rounded-full bg-secondary"'),
    ).toEqual([]);
    expect(
      mutedStructuralFills('"h-5 rounded border bg-muted px-1.5"'),
    ).toEqual([]);
  });

  it("are filled with bg-secondary in every component file", () => {
    const offenders = sources.flatMap(({ file, source }) =>
      mutedStructuralFills(source).map((line) => `${file}: ${line.trim()}`),
    );
    expect(offenders, STRUCTURAL_FIX).toEqual([]);
  });

  it("reports a pinned fill that went back to bg-muted", () => {
    expect(missingSecondaryFills('"bg-secondary/50"', 1)).toBeUndefined();
    expect(missingSecondaryFills('"bg-muted/50"', 1)).toBe(
      "expected 1, found 0",
    );
    expect(missingSecondaryFills('"hover:bg-secondary/50"', 1)).toBe(
      "expected 1, found 0",
    );
  });

  it("keeps the fills in tone maps and lists on bg-secondary", () => {
    const regressions = SECONDARY_STRUCTURAL_FILLS.flatMap(
      ([file, expected]) => {
        const message = missingSecondaryFills(
          readFileSync(join(COMPONENTS_ROOT, file), "utf8"),
          expected,
        );
        return message ? [`${file}: ${message}`] : [];
      },
    );
    expect(regressions, STRUCTURAL_FIX).toEqual([]);
  });
});
