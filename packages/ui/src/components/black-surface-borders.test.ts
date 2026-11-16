import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

/*
 * Dark surfaces are pure black (DESIGN.md, "Dark surfaces are pure black"):
 * --background, --muted, --card and --popover all render #000000, so a
 * hairline border is what gives a raised surface or a divider its edge.
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
const HAIRLINE_SIZE = /^[hw]-px$/;

const SURFACE_FIX =
  "A bg-card or bg-popover fill is #000000 in dark, the page color. Draw its edge with border (the --border hairline).";
const DIVIDER_FIX =
  "bg-muted is #000000 in dark, so this divider disappears. Use bg-border.";

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

/** Lines that give a one-pixel divider a muted fill. */
function mutedDividers(source: string): string[] {
  return source.split("\n").filter((line) => {
    const classes = classesOf(line).map((name) => baseClass(name));
    return (
      classes.some((name) => HAIRLINE_SIZE.test(name)) &&
      classes.some((name) => MUTED_FILL.test(name))
    );
  });
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
