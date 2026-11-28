import {
  contrast,
  type Mode,
  oklchToRgb,
  type Palette,
  palette,
  PRODUCT_THEMES,
  token,
} from "./__tests__/theme-colors";
import { THEME_PRESETS } from "./theme-presets";

/*
 * Contrast contract from DESIGN.md §3, measured on the shipped CSS: the
 * generated default theme plus every preset in themes/presets.css. Text pairs
 * need 4.5:1 (WCAG 1.4.3); control boundaries and the focus ring need 3:1
 * (WCAG 1.4.11). Colors are OKLCH channels converted to clipped sRGB, the way
 * browsers render them on an sRGB display.
 */

type Pair = readonly [string, string];

const TEXT_PAIRS: readonly Pair[] = [
  ["foreground", "background"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["primary-foreground", "primary"],
  ["secondary-foreground", "secondary"],
  ["accent-foreground", "accent"],
  ["destructive-foreground", "destructive"],
  ["muted-foreground", "background"],
  ["muted-foreground", "card"],
  ["muted-foreground", "popover"],
  ["muted-foreground", "muted"],
  ["destructive", "background"],
  ["destructive", "card"],
  ["destructive", "popover"],
  ["destructive", "muted"],
];

const STATUS_PAIRS: readonly Pair[] = [
  ["foreground", "diff-added"],
  ["foreground", "diff-removed"],
  ...(["info", "success", "warning"] as const).flatMap((role): Pair[] => [
    [`${role}-foreground`, role],
    ...(["background", "card", "popover", "muted"] as const).map(
      (surface): Pair => [role, surface],
    ),
  ]),
];

const CODE_TOKENS = [
  "text",
  "comment",
  "keyword",
  "string",
  "function",
  "number",
  "class",
  "variable",
  "operator",
] as const;

const BOUNDARY_PAIRS: readonly Pair[] = [
  ["input", "background"],
  ["input", "card"],
  ["input", "popover"],
  ["input", "muted"],
  ["ring", "background"],
];

function failures(colors: Palette, pairs: readonly Pair[], minimum: number) {
  return pairs
    .map(([foreground, surface]) => ({
      ratio: contrast(
        oklchToRgb(token(colors, foreground)),
        oklchToRgb(token(colors, surface)),
      ),
      where: `${foreground} on ${surface}`,
    }))
    .filter(({ ratio }) => ratio < minimum)
    .map(({ ratio, where }) => `${where}: ${ratio.toFixed(2)}:1`);
}

/** `color` at 10% over `surface`, blended per sRGB channel like `bg-x/10`. */
function tenPercentTint(color: string, surface: string): number[] {
  const over = oklchToRgb(surface);
  return oklchToRgb(color).map((channel, index) =>
    Math.round(channel * 0.1 + (over[index] ?? 0) * 0.9),
  );
}

/**
 * Presets inherit the success, warning and info roles from the core theme. These
 * five miss 4.5:1 on one of their own surfaces in the listed modes. Tracked in
 * https://github.com/vllnt/ui/issues/579. Each gap runs under `it.fails`, so a
 * preset that passes again has to leave this list.
 */
const KNOWN_STATUS_GAPS: Readonly<Record<string, readonly Mode[]>> = {
  claude: ["light"],
  dracula: ["dark", "light"],
  dusk: ["light"],
  nord: ["dark", "light"],
  synthwave: ["light"],
};

function illegibleOnTint(colors: Palette, roles: readonly string[]): string[] {
  return roles.filter((role) => {
    const color = token(colors, role);
    return (
      contrast(
        oklchToRgb(color),
        tenPercentTint(color, token(colors, "background")),
      ) < 4.5
    );
  });
}

const THEME_NAMES = [
  ...THEME_PRESETS.map(({ name }) => name),
  ...PRODUCT_THEMES,
];

const CASES = THEME_NAMES.flatMap((name) =>
  (["light", "dark"] as const).map((mode) => [name, mode] as const),
);

describe.each(CASES)("%s theme (%s) contrast contract", (preset, mode) => {
  const colors = palette(preset, mode);

  it("keeps every text pair at 4.5:1", () => {
    expect(failures(colors, TEXT_PAIRS, 4.5)).toEqual([]);
  });

  it("keeps destructive text legible on its 10% tint", () => {
    expect(illegibleOnTint(colors, ["destructive"])).toEqual([]);
  });

  const statusIt = KNOWN_STATUS_GAPS[preset]?.includes(mode) ? it.fails : it;

  statusIt("keeps the status and diff colors legible", () => {
    expect([
      ...failures(colors, STATUS_PAIRS, 4.5),
      ...illegibleOnTint(colors, ["info", "success", "warning"]).map(
        (role) => `${role} on its 10% tint`,
      ),
    ]).toEqual([]);
  });

  it("keeps CodeBlock syntax tokens at 4.5:1 on the background", () => {
    const pairs = CODE_TOKENS.map(
      (name) => [`vllnt-code-${name}`, "background"] as const,
    );
    expect(failures(colors, pairs, 4.5)).toEqual([]);
  });

  it("keeps control boundaries and the focus ring at 3:1", () => {
    expect(failures(colors, BOUNDARY_PAIRS, 3)).toEqual([]);
  });
});

/** What each default dark token renders as: Maia's flat monochrome column (issue #768), as 8-bit sRGB. */
const DARK_RENDERED: Readonly<Record<string, readonly number[]>> = {
  accent: [24, 24, 24],
  background: [0, 0, 0],
  border: [30, 30, 30],
  card: [0, 0, 0],
  muted: [20, 20, 20],
  popover: [10, 10, 10],
  secondary: [20, 20, 20],
};

/** Rendered sRGB of every named token that is not what `expected` says. */
function offColor(
  colors: Palette,
  expected: Readonly<Record<string, readonly number[]>>,
): string[] {
  return Object.entries(expected)
    .filter(
      ([name, rgb]) =>
        oklchToRgb(token(colors, name)).join(",") !== rgb.join(","),
    )
    .map(([name]) => `${name}: ${oklchToRgb(token(colors, name)).join(",")}`);
}

describe("default dark theme is flat black with hairline borders", () => {
  const colors = palette("default", "dark");

  it("renders background and card as #000000, the popover as #0A0A0A", () => {
    expect(
      offColor(colors, {
        background: DARK_RENDERED.background ?? [],
        card: DARK_RENDERED.card ?? [],
        popover: DARK_RENDERED.popover ?? [],
      }),
    ).toEqual([]);
  });

  it("renders muted and secondary as #141414, accent as #181818 and the border as #1E1E1E", () => {
    expect(
      offColor(colors, {
        accent: DARK_RENDERED.accent ?? [],
        border: DARK_RENDERED.border ?? [],
        muted: DARK_RENDERED.muted ?? [],
        secondary: DARK_RENDERED.secondary ?? [],
      }),
    ).toEqual([]);
  });

  it("matches PaaS, which has no color overrides of its own", () => {
    const paas = palette("paas", "dark");
    const different = [...Object.keys(DARK_RENDERED), "input"].filter(
      (name) => token(paas, name) !== token(colors, name),
    );
    expect(different).toEqual([]);
  });

  it("matches Maia, which is the default", () => {
    const maia = palette("maia", "dark");
    const different = Object.keys(colors).filter(
      (name) => token(maia, name) !== token(colors, name),
    );
    expect(different).toEqual([]);
  });
});

/*
 * The roles the flat workbench default adds (issue #768). `sidebar` and `pill`
 * are surfaces; the status colours are marks (WCAG 1.4.11, 3:1), never text.
 * The border roles are hairlines, not control boundaries: a control uses
 * `input`. Presets do not set these roles. The tests cover the default and the
 * product themes, which equal it.
 */
const WORKBENCH_TEXT_PAIRS: readonly Pair[] = [
  ["foreground", "sidebar"],
  ["muted-foreground", "sidebar"],
  ["foreground", "pill"],
  ["muted-foreground", "pill"],
];

const WORKBENCH_MARKS = [
  "status-needs-you",
  "status-unread",
  "status-failed",
  "status-done",
  "status-ring",
] as const;

const WORKBENCH_MARK_SURFACES = [
  "background",
  "card",
  "popover",
  "sidebar",
  "pill",
] as const;

describe.each(
  ["default", ...PRODUCT_THEMES].flatMap((name) =>
    (["light", "dark"] as const).map((mode) => [name, mode] as const),
  ),
)("%s theme (%s): workbench roles", (theme, mode) => {
  const colors = palette(theme, mode);

  it("keeps text on the sidebar and the pill at 4.5:1", () => {
    expect(failures(colors, WORKBENCH_TEXT_PAIRS, 4.5)).toEqual([]);
  });

  it("keeps the status marks at 3:1 on every workbench surface", () => {
    const pairs = WORKBENCH_MARKS.flatMap((mark): Pair[] =>
      WORKBENCH_MARK_SURFACES.map((surface): Pair => [mark, surface]),
    );
    expect(failures(colors, pairs, 3)).toEqual([]);
  });
});

/*
 * The pairs of the site shell (header, switcher panel, footer, theme control)
 * that the table above does not hold. The bar and the footer sit on the page
 * background, the switcher panel is a popover, a hovered row pairs `accent`
 * with `accent-foreground`, and the current site's row is `secondary` (the dark
 * theme's `muted` is black like the page, so it cannot mark a row). Link rows
 * in the panel read `foreground` on the popover.
 */
const SHELL_TEXT_PAIRS: readonly Pair[] = [
  ["foreground", "popover"],
  ["foreground", "secondary"],
];

describe.each(CASES)("%s theme (%s): site shell", (preset, mode) => {
  const colors = palette(preset, mode);

  it("keeps the shell text at 4.5:1 on its panel and current row", () => {
    expect(failures(colors, SHELL_TEXT_PAIRS, 4.5)).toEqual([]);
  });
});
