import { readFileSync } from "node:fs";
import { join } from "node:path";

import { THEME_PRESETS } from "./theme-presets";

/*
 * Contrast contract from DESIGN.md §3, measured on the shipped CSS: the
 * generated default theme plus every preset in themes/presets.css. Text pairs
 * need 4.5:1 (WCAG 1.4.3); control boundaries and the focus ring need 3:1
 * (WCAG 1.4.11). Colors are OKLCH channels converted to clipped sRGB, the way
 * browsers render them on an sRGB display.
 */

type Mode = "dark" | "light";
type Palette = Readonly<Record<string, string>>;
type Pair = readonly [string, string];

const THEMES_DIR = join(__dirname, "..", "..", "themes");

const PRODUCT_THEMES: readonly string[] = ["maia", "paas"];

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
  ["ring", "background"],
];

function readTheme(file: string): string {
  return readFileSync(join(THEMES_DIR, file), "utf8");
}

function declarations(body: string): Palette {
  return Object.fromEntries(
    [...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(
      ([, name = "", value = ""]) => [name, value.trim()],
    ),
  );
}

function block(css: string, selector: string): Palette {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`Missing CSS block ${selector}`);
  return declarations(css.slice(start, css.indexOf("}", start)));
}

/** CodeBlock `--vllnt-code-*` defaults from the shipped styles.css. */
function codeDefaults(mode: Mode): Palette {
  const css = readFileSync(join(THEMES_DIR, "..", "styles.css"), "utf8");
  const selector = mode === "light" ? ":root" : ".dark";
  const start = css.indexOf(`\n${selector} {\n  --vllnt-code-`);
  if (start === -1) throw new Error(`Missing CodeBlock tokens for ${mode}`);
  return declarations(css.slice(start, css.indexOf("}", start)));
}

/**
 * Resolve the cascade: base mode, then the theme, then the theme's `.dark`.
 * Presets live in presets.css, product themes in the generated products.css.
 */
function palette(theme: string, mode: Mode): Palette {
  const base = readTheme("default.css");
  const own = {
    ...codeDefaults(mode),
    ...block(base, mode === "light" ? ":root" : ".dark"),
  };
  if (theme === "default") return own;
  const css = readTheme(
    PRODUCT_THEMES.includes(theme) ? "products.css" : "presets.css",
  );
  const selector = `html[data-theme="${theme}"]`;
  return {
    ...own,
    ...block(css, selector),
    ...(mode === "dark" ? block(css, `${selector}.dark`) : {}),
  };
}

function linearToSrgb(channel: number): number {
  const encoded =
    channel <= 0.003_130_8
      ? 12.92 * channel
      : 1.055 * channel ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, encoded)) * 255);
}

/** OKLCH channels ("L C H") to 8-bit sRGB, clipped to gamut. */
function oklchToRgb(value: string): number[] {
  const [lightness = 0, chroma = 0, hue = 0] = value.split(/\s+/).map(Number);
  const a = chroma * Math.cos((hue * Math.PI) / 180);
  const b = chroma * Math.sin((hue * Math.PI) / 180);
  const l = (lightness + 0.396_337_777_4 * a + 0.215_803_757_3 * b) ** 3;
  const m = (lightness - 0.105_561_345_8 * a - 0.063_854_172_8 * b) ** 3;
  const s = (lightness - 0.089_484_177_5 * a - 1.291_485_548 * b) ** 3;
  return [
    4.076_741_662_1 * l - 3.307_711_591_3 * m + 0.230_969_929_2 * s,
    -1.268_438_004_6 * l + 2.609_757_401_1 * m - 0.341_319_396_5 * s,
    -0.004_196_086_3 * l - 0.703_418_614_7 * m + 1.707_614_701 * s,
  ].map((channel) => linearToSrgb(channel));
}

function luminance(rgb: readonly number[]): number {
  const [red = 0, green = 0, blue = 0] = rgb.map((channel) => {
    const value = channel / 255;
    return value <= 0.040_45 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(first: readonly number[], second: readonly number[]): number {
  const [light, dark] = [luminance(first), luminance(second)].sort(
    (x, y) => y - x,
  );
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

/** A token's value; throws so a missing token cannot pass as black. */
function token(colors: Palette, name: string): string {
  const value = colors[name];
  if (!value) throw new Error(`Missing --${name}`);
  return value;
}

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
