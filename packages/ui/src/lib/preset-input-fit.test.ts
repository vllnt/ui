import {
  fitInput,
  type Palette,
  worstContrast,
} from "./__tests__/theme-colors";

/*
 * The solver behind __tests__/fit-preset-inputs.ts, on small palettes written
 * out here, so the checks do not move when a preset's colors do.
 * theme-contrast.test.ts holds the shipped presets to 3:1.
 */

const LIGHT_SURFACES = {
  background: "0.97 0.03 150",
  card: "0.99 0.02 150",
  muted: "0.93 0.03 150",
  popover: "0.99 0.02 150",
};

const DARK_SURFACES = {
  background: "0.14 0.025 150",
  card: "0.17 0.03 150",
  muted: "0.22 0.035 150",
  popover: "0.17 0.03 150",
};

function withInput(surfaces: Palette, input: string): Palette {
  return { ...surfaces, input };
}

function lightnessOf(value: string): number {
  return Number(value.split(" ")[0]);
}

function shifted(value: string, thousandths: number): string {
  const [lightness = "", ...rest] = value.split(" ");
  const next = Math.round(Number(lightness) * 1000) + thousandths;
  return [String(next / 1000), ...rest].join(" ");
}

describe("fitInput", () => {
  it("darkens a light input by the smallest step that reaches 3:1", () => {
    const colors = withInput(LIGHT_SURFACES, "0.8 0.05 150");
    const fit = fitInput(colors);

    expect(fit.before.surface).toBe("muted");
    expect(fit.before.ratio).toBeLessThan(3);
    expect(fit.after.ratio).toBeGreaterThanOrEqual(3);
    expect(lightnessOf(fit.value)).toBeLessThan(0.8);
    expect(worstContrast(colors, shifted(fit.value, 1)).ratio).toBeLessThan(3);
  });

  it("lightens a dark input by the smallest step that reaches 3:1", () => {
    const colors = withInput(DARK_SURFACES, "0.4 0.06 150");
    const fit = fitInput(colors);

    expect(fit.before.ratio).toBeLessThan(3);
    expect(fit.after.ratio).toBeGreaterThanOrEqual(3);
    expect(lightnessOf(fit.value)).toBeGreaterThan(0.4);
    expect(worstContrast(colors, shifted(fit.value, -1)).ratio).toBeLessThan(3);
  });

  it("keeps chroma and hue as written", () => {
    const fit = fitInput(withInput(LIGHT_SURFACES, "0.8 0.050 150"));

    expect(fit.value.split(" ").slice(1)).toEqual(["0.050", "150"]);
  });

  it("returns an input that already passes as it is", () => {
    const fit = fitInput(withInput(LIGHT_SURFACES, "0.3 0.05 150"));

    expect(fit.value).toBe("0.3 0.05 150");
    expect(fit.after).toEqual(fit.before);
  });

  it("refuses an input that sits between the surfaces", () => {
    const colors = withInput(LIGHT_SURFACES, "0.95 0.03 150");

    expect(() => fitInput(colors)).toThrow(/between the surfaces/);
  });

  it("refuses a value that would render outside sRGB", () => {
    const colors = withInput(LIGHT_SURFACES, "0.7 0.3 145");

    expect(() => fitInput(colors)).toThrow(/outside sRGB/);
  });
});
