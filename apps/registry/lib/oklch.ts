/**
 * Dependency-free conversions between OKLCH channel strings ("L C H") and sRGB
 * hex. Used by the theme editor to drive native color inputs and by exports to
 * emit full `oklch(...)` values. The matrices are Björn Ottosson's OKLab
 * transforms.
 */

const SRGB_TO_LINEAR_THRESHOLD = 0.04045;
const LINEAR_TO_SRGB_THRESHOLD = 0.0031308;
const ACHROMATIC_THRESHOLD = 0.0005;

function srgbToLinear(channel: number): number {
  return channel <= SRGB_TO_LINEAR_THRESHOLD
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(channel: number): number {
  const value =
    channel <= LINEAR_TO_SRGB_THRESHOLD
      ? channel * 12.92
      : 1.055 * channel ** (1 / 2.4) - 0.055;
  return Math.min(1, Math.max(0, value));
}

function round(value: number, places: number): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function oklchToSrgb(
  l: number,
  c: number,
  h: number,
): [number, number, number] {
  const hueRadians = (h * Math.PI) / 180;
  const a = c * Math.cos(hueRadians);
  const b = c * Math.sin(hueRadians);
  const lPrime = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mPrime = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const sPrime = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    linearToSrgb(
      4.0767416621 * lPrime - 3.3077115913 * mPrime + 0.2309699292 * sPrime,
    ),
    linearToSrgb(
      -1.2684380046 * lPrime + 2.6097574011 * mPrime - 0.3413193965 * sPrime,
    ),
    linearToSrgb(
      -0.0041960863 * lPrime - 0.7034186147 * mPrime + 1.707614701 * sPrime,
    ),
  ];
}

function linearSrgbToOklch(red: number, green: number, blue: number): string {
  const longRoot = Math.cbrt(
    0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue,
  );
  const mediumRoot = Math.cbrt(
    0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue,
  );
  const shortRoot = Math.cbrt(
    0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue,
  );
  const lightness =
    0.2104542553 * longRoot +
    0.793617785 * mediumRoot -
    0.0040720468 * shortRoot;
  const a =
    1.9779984951 * longRoot -
    2.428592205 * mediumRoot +
    0.4505937099 * shortRoot;
  const b =
    0.0259040371 * longRoot +
    0.7827717662 * mediumRoot -
    0.808675766 * shortRoot;
  const chroma = Math.hypot(a, b);
  if (chroma < ACHROMATIC_THRESHOLD) {
    return `${round(lightness, 4)} 0 0`;
  }
  const hue = ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
  return `${round(lightness, 4)} ${round(chroma, 4)} ${round(hue, 3)}`;
}

/** Parse an "L C H" channel string into a numeric tuple. */
export function parseOklchChannels(value: string): [number, number, number] {
  const [l = 0, c = 0, h = 0] = value.trim().split(/\s+/).map(Number);
  return [l, c, h];
}

/** Format an "L C H" channel string as a full CSS `oklch(...)` color. */
export function oklchToCss(value: string): string {
  const [l, c, h] = parseOklchChannels(value);
  return `oklch(${l} ${c} ${h})`;
}

/**
 * Convert an "L C H" channel string to an sRGB `#rrggbb` hex string. Returns
 * black for non-numeric input so a partly-typed value never yields an invalid
 * `<input type="color">` value.
 */
export function oklchChannelsToHex(value: string): string {
  const [l, c, h] = parseOklchChannels(value);
  if (!Number.isFinite(l) || !Number.isFinite(c) || !Number.isFinite(h)) {
    return "#000000";
  }
  return `#${oklchToSrgb(l, c, h)
    .map((channel) =>
      Math.round(channel * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

/** Convert an sRGB `#rrggbb` hex string to an "L C H" channel string. */
export function hexToOklchChannels(hex: string): string {
  const normalized = hex.replace("#", "");
  return linearSrgbToOklch(
    srgbToLinear(Number.parseInt(normalized.slice(0, 2), 16) / 255),
    srgbToLinear(Number.parseInt(normalized.slice(2, 4), 16) / 255),
    srgbToLinear(Number.parseInt(normalized.slice(4, 6), 16) / 255),
  );
}
