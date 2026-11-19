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

const BLACK_SURFACES = ["background", "muted", "card", "popover"] as const;
const GREY_FILLS = ["secondary", "accent", "border"] as const;

/** Rendered sRGB of every named token that is not `expected`. */
function offColor(
  colors: Palette,
  names: readonly string[],
  expected: readonly number[],
): string[] {
  return names
    .filter(
      (name) =>
        oklchToRgb(token(colors, name)).join(",") !== expected.join(","),
    )
    .map((name) => `${name}: ${oklchToRgb(token(colors, name)).join(",")}`);
}

describe("default dark theme is pure black with hairline borders", () => {
  const colors = palette("default", "dark");

  it("renders background, muted, card and popover as #000000", () => {
    expect(offColor(colors, BLACK_SURFACES, [0, 0, 0])).toEqual([]);
  });

  it("renders hover, selected and active fills and the border as #262626", () => {
    expect(offColor(colors, GREY_FILLS, [38, 38, 38])).toEqual([]);
  });

  it("matches PaaS, which has no color overrides of its own", () => {
    const paas = palette("paas", "dark");
    const different = [...BLACK_SURFACES, ...GREY_FILLS, "input"].filter(
      (name) => token(paas, name) !== token(colors, name),
    );
    expect(different).toEqual([]);
  });
});
