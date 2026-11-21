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

const FIX =
  "Use bg-secondary at the same opacity (DESIGN.md, Dark surfaces are pure black).";

/**
 * Fills that moved off `bg-muted`: each file with its classes, one entry per
 * occurrence. Dark `--muted` is the page color (#000000), so these use
 * `--secondary`: it matches the old muted fill in the default theme and stays
 * readable under the text in every preset, where `--accent` is a brand color.
 */
const MIGRATED_FILLS: readonly (readonly [string, readonly string[]])[] = [
  [
    "atoms/accordion/accordion.tsx",
    ["bg-secondary/30", "hover:bg-secondary/50"],
  ],
  [
    "atoms/ai-source-citation/ai-source-citation.tsx",
    ["hover:bg-secondary/40"],
  ],
  [
    "atoms/bottom-activity-strip/bottom-activity-strip.tsx",
    ["hover:bg-secondary/40"],
  ],
  ["atoms/checklist/checklist.tsx", ["hover:bg-secondary/50"]],
  [
    "atoms/command-dock/command-dock.tsx",
    ["hover:bg-secondary/40", "hover:bg-secondary/40"],
  ],
  [
    "atoms/curriculum/curriculum.tsx",
    ["bg-secondary/30", "hover:bg-secondary/40", "hover:bg-secondary/50"],
  ],
  [
    "atoms/keyboard-shortcuts-help/keyboard-shortcuts-help.tsx",
    ["hover:bg-secondary"],
  ],
  [
    "atoms/policy-delivery-panel/policy-delivery-panel.tsx",
    ["hover:bg-secondary/40"],
  ],
  ["atoms/presence-stack/presence-stack.tsx", ["hover:bg-secondary/80"]],
  ["atoms/quiz/quiz.tsx", ["hover:bg-secondary", "hover:bg-secondary/50"]],
  [
    "atoms/relationship-inspector/relationship-inspector.tsx",
    ["hover:bg-secondary/40"],
  ],
  [
    "atoms/routing-assignment-panel/routing-assignment-panel.tsx",
    ["hover:bg-secondary/40"],
  ],
  ["atoms/segmented-control/segmented-control.tsx", ["bg-secondary"]],
  ["atoms/stepper/stepper.tsx", ["hover:bg-secondary/40"]],
  [
    "atoms/table-of-contents-panel/table-of-contents-panel.tsx",
    ["hover:bg-secondary", "hover:bg-secondary", "hover:bg-secondary"],
  ],
  [
    "atoms/table/table.tsx",
    ["data-[state=selected]:bg-secondary", "hover:bg-secondary/50"],
  ],
  [
    "atoms/tabs/tabs.tsx",
    [
      "data-[state=active]:bg-secondary",
      "data-[state=inactive]:hover:bg-secondary/50",
    ],
  ],
  ["atoms/thread-bubble/thread-bubble.tsx", ["hover:bg-secondary/40"]],
  ["atoms/tldr-section/tldr-section.tsx", ["hover:bg-secondary/50"]],
  ["atoms/toggle/toggle.tsx", ["hover:bg-secondary"]],
  ["atoms/view-switcher/view-switcher.tsx", ["bg-secondary"]],
  [
    "atoms/viewport-bookmarks/viewport-bookmarks.tsx",
    ["bg-secondary/60", "hover:bg-secondary/30"],
  ],
  ["atoms/watchlist/watchlist.tsx", ["hover:bg-secondary/40"]],
  ["atoms/workspace-switcher/workspace-switcher.tsx", ["bg-secondary/50"]],
  ["molecules/content-intro/content-intro.tsx", ["hover:bg-secondary/50"]],
  [
    "molecules/conversation-thread/conversation-thread.tsx",
    [
      "hover:bg-secondary",
      "hover:bg-secondary",
      "hover:bg-secondary",
      "hover:bg-secondary",
      "hover:bg-secondary",
    ],
  ],
  [
    "molecules/filter-bar/filter-bar.tsx",
    ["hover:bg-secondary", "hover:bg-secondary"],
  ],
  ["molecules/pricing-table/pricing-table.tsx", ["bg-secondary/40"]],
  [
    "molecules/tutorial-filters/tutorial-filters.tsx",
    ["hover:bg-secondary", "hover:bg-secondary"],
  ],
  ["organisms/flow-diagram/flow-controls.tsx", ["hover:bg-secondary"]],
  ["organisms/flow-diagram/flow-fullscreen.tsx", ["hover:bg-secondary"]],
  [
    "organisms/slideshow/slideshow.tsx",
    [
      "bg-secondary",
      "hover:bg-secondary",
      "hover:bg-secondary",
      "hover:bg-secondary",
      "hover:bg-secondary",
      "hover:bg-secondary/50",
    ],
  ],
  [
    "organisms/tutorial-complete/tutorial-complete.tsx",
    ["hover:bg-secondary/50", "hover:bg-secondary/50"],
  ],
];

const CLASS_DELIMITERS = /[\s"'`{}]+/;

const MUTED_FILL =
  /((?:[^\s"':`{}]+:)*)bg-muted(?:\/[^\s"'`{}]+)?(?=[\s"'`}]|$)/g;

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

function tally(list: readonly string[], name: string): number {
  return list.filter((entry) => entry === name).length;
}

function missingFills(source: string, fills: readonly string[]): string[] {
  const classes = source.split(CLASS_DELIMITERS);
  return [...new Set(fills)].flatMap((fill) => {
    const expected = tally(fills, fill);
    const found = tally(classes, fill);
    return found < expected
      ? [`${fill}: expected ${expected}, found ${found}`]
      : [];
  });
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
      .flatMap((file) =>
        mutedStateFills(readFileSync(join(COMPONENTS_ROOT, file), "utf8")).map(
          (fill) => `${file}: ${fill}`,
        ),
      );
    expect(
      offenders,
      `bg-muted is the page color in dark and cannot show a state. ${FIX}`,
    ).toEqual([]);
  });
});

describe("migrated state fills", () => {
  it("reports a fill that went back to accent or muted", () => {
    const pinned = ["hover:bg-secondary/50"];
    expect(missingFills('"hover:bg-secondary/50"', pinned)).toEqual([]);
    expect(missingFills('"hover:bg-accent/50"', pinned)).toEqual([
      "hover:bg-secondary/50: expected 1, found 0",
    ]);
    expect(missingFills('"hover:bg-muted/50"', pinned)).toEqual([
      "hover:bg-secondary/50: expected 1, found 0",
    ]);
    expect(missingFills('"data-[x]:hover:bg-secondary/50"', pinned)).toEqual([
      "hover:bg-secondary/50: expected 1, found 0",
    ]);
  });

  it("keeps every migrated fill on secondary", () => {
    const regressions = MIGRATED_FILLS.flatMap(([file, pinned]) =>
      missingFills(
        readFileSync(join(COMPONENTS_ROOT, file), "utf8"),
        pinned,
      ).map((message) => `${file}: ${message}`),
    );
    expect(
      regressions,
      `These fills moved off bg-muted and must not go back to bg-muted or bg-accent (accent is a brand color in presets). ${FIX}`,
    ).toEqual([]);
  });
});
