import {
  contrast,
  type Mode,
  oklchToRgb,
  type Palette,
  palette,
  PRODUCT_THEMES,
  readTheme,
  token,
} from "./__tests__/theme-colors";
import { THEME_PRESETS } from "./theme-presets";

/*
 * WCAG 2.2 AA on the glass material, from the shipped theme CSS, by the method
 * of the glass-default r8 recipe: relative luminance, an sRGB alpha blend with
 * each alpha taken as its stored byte over 255, every point from the top to
 * the bottom of the part (0 to 1 in 0.01 steps), over a white, a mid-grey
 * (#808080) and a black backdrop. Text needs 4.5:1 (WCAG 1.4.3), a control
 * boundary 3:1 (WCAG 1.4.11). The hairline edge is decorative and not tested.
 *
 * Two stacks per class, and a part has to pass both:
 * - gradient: the tint drawn top to bottom (colour and alpha interpolated
 *   separately) with the white specular sheen over it, as the CSS draws it.
 * - flat: the tint at its top stop, with the sheen scaled by sheen-opacity, as
 *   the Penpot libraries draw it (a token cannot bind a gradient there).
 */

type Rgb = readonly number[];

type Tint = { readonly bottom: string; readonly top: string };

const WHITE: Rgb = [255, 255, 255];

const BACKDROPS: readonly Rgb[] = [WHITE, [128, 128, 128], [0, 0, 0]];

const STEPS: readonly number[] = Array.from(
  { length: 101 },
  (_, index) => index / 100,
);

const TEXT_MINIMUM = 4.5;
const BOUNDARY_MINIMUM = 3;

/** The CSS specular gradient: alpha 0.70 at 0, 0 at 0.45 and 0.12 at 1, times sheen-opacity. */
const SPECULAR_START = 0.7;
const SPECULAR_END = 0.12;
const SPECULAR_BREAK = 0.45;

/** The recipe's gradient stack uses these specular stops per tone, the dark ones as in the recipe scripts. */
const RECIPE_SPECULAR: Readonly<Record<Mode, readonly [number, number]>> = {
  dark: [0.12, 0.03],
  light: [SPECULAR_START, SPECULAR_END],
};

const RECIPE_SHEEN: Readonly<Record<Mode, number>> = { dark: 0.17, light: 1 };

const MODES: readonly Mode[] = ["light", "dark"];

const DEFAULT_THEME = "default";

const THEME_NAMES = [
  ...THEME_PRESETS.map(({ name }) => name),
  ...PRODUCT_THEMES,
];

/** `#RRGGBBAA` as 8-bit channels and an alpha between 0 and 1. */
function hexAlpha(value: string): { alpha: number; rgb: number[] } {
  const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})([\da-f]{2})?$/i.exec(
    value,
  );
  if (!match) throw new Error(`Not a #RRGGBB[AA] colour: ${value}`);
  const [red = "", green = "", blue = "", alpha = "ff"] = match.slice(1);
  return {
    alpha: Number.parseInt(alpha, 16) / 255,
    rgb: [red, green, blue].map((channel) => Number.parseInt(channel, 16)),
  };
}

/** `color` at `alpha` over `backdrop`, unrounded like the recipe scripts. */
function blend(backdrop: Rgb, color: Rgb, alpha: number): number[] {
  return backdrop.map(
    (channel, index) => channel * (1 - alpha) + (color[index] ?? 0) * alpha,
  );
}

function specular(step: number, start: number, end: number): number {
  return step <= SPECULAR_BREAK
    ? start * (1 - step / SPECULAR_BREAK)
    : (end * (step - SPECULAR_BREAK)) / (1 - SPECULAR_BREAK);
}

type Stack = (backdrop: Rgb, step: number) => number[];

function gradientStack(
  tint: Tint,
  [specularStart, specularEnd]: readonly [number, number],
): Stack {
  const top = hexAlpha(tint.top);
  const bottom = hexAlpha(tint.bottom);
  return (backdrop, step) => {
    const alpha = top.alpha + (bottom.alpha - top.alpha) * step;
    const rgb = top.rgb.map(
      (channel, index) => channel + ((bottom.rgb[index] ?? 0) - channel) * step,
    );
    return blend(
      blend(backdrop, rgb, alpha),
      WHITE,
      specular(step, specularStart, specularEnd),
    );
  };
}

function flatStack(tint: Tint, sheen: number): Stack {
  const top = hexAlpha(tint.top);
  return (backdrop, step) =>
    blend(
      blend(backdrop, top.rgb, top.alpha),
      WHITE,
      sheen * specular(step, SPECULAR_START, SPECULAR_END),
    );
}

/** The two stacks of the recipe scripts. */
function recipeStacks(tone: Mode, tint: Tint): readonly Stack[] {
  return [
    gradientStack(tint, RECIPE_SPECULAR[tone]),
    flatStack(tint, RECIPE_SHEEN[tone]),
  ];
}

/** The two stacks of the shipped CSS, with the specular stops scaled by the shipped sheen-opacity. */
function shippedStacks(tint: Tint, sheen: number): readonly Stack[] {
  return [
    gradientStack(tint, [SPECULAR_START * sheen, SPECULAR_END * sheen]),
    flatStack(tint, sheen),
  ];
}

/** Lowest contrast of `foreground` over every stack, backdrop and step. */
function worst(stacks: readonly Stack[], foreground: Rgb): number {
  return Math.min(
    ...stacks.flatMap((stack) =>
      BACKDROPS.flatMap((backdrop) =>
        STEPS.map((step) => contrast(foreground, stack(backdrop, step))),
      ),
    ),
  );
}

type Surface = { readonly default: Tint; readonly dense: Tint; sheen: number };

function surface(colors: Palette): Surface {
  return {
    default: {
      bottom: token(colors, "material-glass-tint-bottom"),
      top: token(colors, "material-glass-tint-top"),
    },
    dense: {
      bottom: token(colors, "material-glass-tint-dense-bottom"),
      top: token(colors, "material-glass-tint-dense-top"),
    },
    sheen: Number(token(colors, "material-glass-sheen-opacity")),
  };
}

function role(colors: Palette, name: string): number[] {
  return oklchToRgb(token(colors, name));
}

describe("the recipe's AA method, with the code foreground", () => {
  const foreground: Record<Mode, Rgb> = {
    dark: [250, 250, 250],
    light: [10, 10, 10],
  };

  it.each(MODES)(
    "reads the %s foreground token as the recipe's rgb",
    (mode) => {
      expect(role(palette("default", mode), "foreground")).toEqual(
        foreground[mode],
      );
    },
  );

  type Fixture = {
    expected: number;
    mode: Mode;
    name: string;
    tint: Tint;
  };

  const fixtures: readonly Fixture[] = [
    {
      expected: 6.14,
      mode: "light",
      name: "light default",
      tint: { bottom: "#FFFFFF80", top: "#FFFFFFA3" },
    },
    {
      expected: 14.29,
      mode: "light",
      name: "light dense",
      tint: { bottom: "#FFFFFFD6", top: "#FFFFFFE6" },
    },
    {
      expected: 8.79,
      mode: "dark",
      name: "dark dense",
      tint: { bottom: "#121212D1", top: "#121212E0" },
    },
    {
      expected: 4.34,
      mode: "dark",
      name: "dark default at the first recipe draft values",
      tint: { bottom: "#14141499", top: "#1C1C1CAF" },
    },
    {
      expected: 4.51,
      mode: "dark",
      name: "dark default raised for AA",
      tint: { bottom: "#1414149C", top: "#1C1C1CB2" },
    },
    {
      expected: 3.39,
      mode: "dark",
      name: "dark default at the prototype 62% to 52%",
      tint: { bottom: "#14141485", top: "#1C1C1C9E" },
    },
  ];

  it.each(fixtures)("$name measures $expected:1 worst", (fixture) => {
    expect(
      worst(recipeStacks(fixture.mode, fixture.tint), foreground[fixture.mode]),
    ).toBeCloseTo(fixture.expected, 2);
  });

  it("fails the first recipe draft's dark default tint and passes the settled one", () => {
    const recipe = worst(
      recipeStacks("dark", { bottom: "#14141499", top: "#1C1C1CAF" }),
      foreground.dark,
    );
    const raised = worst(
      recipeStacks("dark", { bottom: "#1414149C", top: "#1C1C1CB2" }),
      foreground.dark,
    );
    expect(recipe).toBeLessThan(TEXT_MINIMUM);
    expect(raised).toBeGreaterThanOrEqual(TEXT_MINIMUM);
  });
});

describe("the shipped specular sheen", () => {
  it("draws the recipe's stops in styles.css", () => {
    const css = readTheme("../styles.css");
    expect(css).toContain(
      `rgb(255 255 255 / calc(${SPECULAR_START} * var(--material-glass-sheen-opacity))) 0%`,
    );
    expect(css).toContain(`rgb(255 255 255 / 0) ${SPECULAR_BREAK * 100}%`);
    expect(css).toContain(
      `rgb(255 255 255 / calc(${SPECULAR_END} * var(--material-glass-sheen-opacity))) 100%`,
    );
  });
});

describe("the default tint of a theme preset", () => {
  it("is the dense tint, for every theme but the default and the product themes", () => {
    const css = readTheme("../styles.css");
    const selector = /html\[data-theme]:not\(([^)]*)\)\s*:is\(/.exec(css)?.[1];
    expect(selector).toBeDefined();
    const excluded = [...(selector ?? "").matchAll(/\[data-theme="([\w-]+)"]/g)]
      .map(([, name]) => name)
      .sort();
    expect(excluded).toEqual([DEFAULT_THEME, ...PRODUCT_THEMES].sort());
  });
});

describe.each(
  THEME_NAMES.flatMap((name) =>
    MODES.map((mode): [string, Mode] => [name, mode]),
  ),
)("%s theme (%s): text on glass", (theme, mode) => {
  const colors = palette(theme, mode);
  const { default: ownDefault, dense, sheen } = surface(colors);
  const standard = [DEFAULT_THEME, ...PRODUCT_THEMES].includes(theme)
    ? ownDefault
    : dense;
  const foreground = role(colors, "foreground");
  const both = (tint: Tint): readonly Stack[] => [
    ...recipeStacks(mode, tint),
    ...shippedStacks(tint, sheen),
  ];

  it("keeps foreground at 4.5:1 on the default tint", () => {
    expect(worst(both(standard), foreground)).toBeGreaterThanOrEqual(
      TEXT_MINIMUM,
    );
  });

  it("keeps foreground at 4.5:1 on the dense tint", () => {
    expect(worst(both(dense), foreground)).toBeGreaterThanOrEqual(TEXT_MINIMUM);
  });

  it("keeps the glass muted-foreground at 4.5:1 on the dense tint", () => {
    expect(
      worst(both(dense), role(colors, "color-glass-muted-foreground")),
    ).toBeGreaterThanOrEqual(TEXT_MINIMUM);
  });

  it("keeps the glass input boundary at 3:1 on the dense tint", () => {
    expect(
      worst(both(dense), role(colors, "color-glass-input")),
    ).toBeGreaterThanOrEqual(BOUNDARY_MINIMUM);
  });
});

describe("why glass has a dense tint and its own muted and input colours", () => {
  it.each(MODES)(
    "fails the glass muted-foreground on the default tint in %s mode",
    (mode) => {
      const colors = palette("default", mode);
      const { default: standard, sheen } = surface(colors);
      expect(
        worst(
          shippedStacks(standard, sheen),
          role(colors, "color-glass-muted-foreground"),
        ),
      ).toBeLessThan(TEXT_MINIMUM);
    },
  );

  it("fails the plain dark muted-foreground on the dense tint", () => {
    const colors = palette("default", "dark");
    const { dense, sheen } = surface(colors);
    expect(
      worst(shippedStacks(dense, sheen), role(colors, "muted-foreground")),
    ).toBeLessThan(TEXT_MINIMUM);
  });

  it("fails the plain light muted-foreground on the default tint", () => {
    const colors = palette("default", "light");
    const { default: standard, sheen } = surface(colors);
    expect(
      worst(shippedStacks(standard, sheen), role(colors, "muted-foreground")),
    ).toBeLessThan(TEXT_MINIMUM);
  });
});
