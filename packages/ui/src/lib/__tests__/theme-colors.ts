import { readFileSync } from "node:fs";
import { join } from "node:path";

/*
 * Test support, never shipped. Reads the shipped theme CSS and measures colors
 * the way browsers render them, for the contrast contract test and for the
 * script that fits each preset's `--input` to the 3:1 rule.
 */

export type Mode = "dark" | "light";
export type Palette = Readonly<Record<string, string>>;

/** Themes whose tokens live in the generated products.css, not in presets.css. */
export const PRODUCT_THEMES: readonly string[] = ["maia", "paas"];

/** The surfaces a control boundary has to stand out from (DESIGN.md §3). */
export const BOUNDARY_SURFACES = [
  "background",
  "card",
  "popover",
  "muted",
] as const;

const THEMES_DIR = join(import.meta.dirname, "..", "..", "..", "themes");

/** Linear-light channels this far outside 0..1 still count as inside sRGB. */
const GAMUT_TOLERANCE = 0.0001;

/** Preset lightness has three decimals, so one step is 0.001. */
const LIGHTNESS_STEPS_PER_UNIT = 1000;

/** Absolute path of a file in packages/ui/themes. */
export function themePath(file: string): string {
  return join(THEMES_DIR, file);
}

/** Contents of a file in packages/ui/themes. */
export function readTheme(file: string): string {
  return readFileSync(themePath(file), "utf8");
}

function declarations(body: string): Palette {
  return Object.fromEntries(
    [...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(
      ([, name = "", value = ""]) => [name, value.trim()],
    ),
  );
}

/** Declarations of the first rule that opens with `selector {`. */
export function block(css: string, selector: string): Palette {
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
export function palette(theme: string, mode: Mode): Palette {
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
    channel <= 0.0031308
      ? 12.92 * channel
      : 1.055 * channel ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, encoded)) * 255);
}

/** Linear-light sRGB channels of OKLCH channels ("L C H"), not clipped. */
function linearRgb(value: string): number[] {
  const [lightness = 0, chroma = 0, hue = 0] = value.split(/\s+/).map(Number);
  const a = chroma * Math.cos((hue * Math.PI) / 180);
  const b = chroma * Math.sin((hue * Math.PI) / 180);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** OKLCH channels ("L C H") to 8-bit sRGB, clipped to gamut. */
export function oklchToRgb(value: string): number[] {
  return linearRgb(value).map((channel) => linearToSrgb(channel));
}

/** True when the color renders inside the sRGB gamut, with no clipping. */
function isInGamut(value: string): boolean {
  return linearRgb(value).every(
    (channel) => channel >= -GAMUT_TOLERANCE && channel <= 1 + GAMUT_TOLERANCE,
  );
}

function luminance(rgb: readonly number[]): number {
  const [red = 0, green = 0, blue = 0] = rgb.map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/** WCAG contrast ratio between two 8-bit sRGB colors. */
export function contrast(
  first: readonly number[],
  second: readonly number[],
): number {
  const [light, dark] = [luminance(first), luminance(second)].sort(
    (x, y) => y - x,
  );
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

/** A token's value; throws so a missing token cannot pass as black. */
export function token(colors: Palette, name: string): string {
  const value = colors[name];
  if (!value) throw new Error(`Missing --${name}`);
  return value;
}

export type WorstContrast = {
  readonly ratio: number;
  readonly surface: string;
};

/** Lowest contrast of `color` over the boundary surfaces, and the surface that sets it. */
export function worstContrast(colors: Palette, color: string): WorstContrast {
  const rgb = oklchToRgb(color);
  return BOUNDARY_SURFACES.map((surface) => ({
    ratio: contrast(rgb, oklchToRgb(token(colors, surface))),
    surface,
  })).reduce((worst, next) => (next.ratio < worst.ratio ? next : worst));
}

function stepDirection(colors: Palette, input: string): -1 | 1 {
  const own = luminance(oklchToRgb(input));
  const surfaces = BOUNDARY_SURFACES.map((name) =>
    luminance(oklchToRgb(token(colors, name))),
  );
  if (own > Math.max(...surfaces)) return 1;
  if (own < Math.min(...surfaces)) return -1;
  throw new Error(
    `--input ${input} sits between the surfaces, lightness alone cannot fit it`,
  );
}

export type InputFit = {
  /** Worst surface for `value`. */
  readonly after: WorstContrast;
  /** Worst surface for the `--input` as it stands. */
  readonly before: WorstContrast;
  /** The `--input` channels to ship ("L C H"). */
  readonly value: string;
};

/**
 * Fit a theme's own `--input` to a contrast target on every boundary surface.
 * Lightness moves in steps of 0.001, away from the surfaces, until the worst
 * ratio reaches `target`:1. Chroma and hue stay as written. An `--input` that
 * already passes comes back unchanged.
 *
 * @param colors - the resolved palette of one theme in one mode
 * @param target - the contrast ratio to reach, 3 for control boundaries
 * @returns the value to ship and the worst surface before and after
 * @throws when the input sits between surfaces, or the smallest passing value
 * would render outside sRGB (DESIGN.md asks for in-gamut values)
 */
export function fitInput(colors: Palette, target = 3): InputFit {
  const current = token(colors, "input");
  const before = worstContrast(colors, current);
  if (before.ratio >= target) return { after: before, before, value: current };

  const [lightness = "", ...rest] = current.split(/\s+/);
  const direction = stepDirection(colors, current);
  const start = Math.round(Number(lightness) * LIGHTNESS_STEPS_PER_UNIT);
  const fit = Array.from(
    { length: LIGHTNESS_STEPS_PER_UNIT },
    (_, index) => start + direction * (index + 1),
  )
    .filter((steps) => steps >= 0 && steps <= LIGHTNESS_STEPS_PER_UNIT)
    .map((steps) =>
      [String(steps / LIGHTNESS_STEPS_PER_UNIT), ...rest].join(" "),
    )
    .map((value) => ({ after: worstContrast(colors, value), before, value }))
    .find(({ after }) => after.ratio >= target);

  if (!fit) {
    throw new Error(
      `--input ${current} cannot reach ${target}:1 by changing lightness`,
    );
  }
  if (!isInGamut(fit.value)) {
    throw new Error(
      `--input ${fit.value} reaches ${target}:1 but renders outside sRGB`,
    );
  }
  return fit;
}
