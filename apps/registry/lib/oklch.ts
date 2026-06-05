/**
 * Dependency-free conversions between OKLCH channel strings ("L C H") and sRGB
 * hex. Used by the theme editor to drive native color inputs and by exports to
 * emit full `oklch(...)` values. The matrices are Björn Ottosson's OKLab
 * transforms.
 */

const SRGB_TO_LINEAR_THRESHOLD = 0.040_45;
const LINEAR_TO_SRGB_THRESHOLD = 0.003_130_8;
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
  const lPrime = (l + 0.396_337_777_4 * a + 0.215_803_757_3 * b) ** 3;
  const mPrime = (l - 0.105_561_345_8 * a - 0.063_854_172_8 * b) ** 3;
  const sPrime = (l - 0.089_484_177_5 * a - 1.291_485_548 * b) ** 3;
  return [
    linearToSrgb(
      4.076_741_662_1 * lPrime -
        3.307_711_591_3 * mPrime +
        0.230_969_929_2 * sPrime,
    ),
    linearToSrgb(
      -1.268_438_004_6 * lPrime +
        2.609_757_401_1 * mPrime -
        0.341_319_396_5 * sPrime,
    ),
    linearToSrgb(
      -0.004_196_086_3 * lPrime -
        0.703_418_614_7 * mPrime +
        1.707_614_701 * sPrime,
    ),
  ];
}

function linearSrgbToOklch(red: number, green: number, blue: number): string {
  const longRoot = Math.cbrt(
    0.412_221_470_8 * red + 0.536_332_536_3 * green + 0.051_445_992_9 * blue,
  );
  const mediumRoot = Math.cbrt(
    0.211_903_498_2 * red + 0.680_699_545_1 * green + 0.107_396_956_6 * blue,
  );
  const shortRoot = Math.cbrt(
    0.088_302_461_9 * red + 0.281_718_837_6 * green + 0.629_978_700_5 * blue,
  );
  const lightness =
    0.210_454_255_3 * longRoot +
    0.793_617_785 * mediumRoot -
    0.004_072_046_8 * shortRoot;
  const a =
    1.977_998_495_1 * longRoot -
    2.428_592_205 * mediumRoot +
    0.450_593_709_9 * shortRoot;
  const b =
    0.025_904_037_1 * longRoot +
    0.782_771_766_2 * mediumRoot -
    0.808_675_766 * shortRoot;
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

/** Convert an "L C H" channel string to an sRGB `#rrggbb` hex string. */
export function oklchChannelsToHex(value: string): string {
  const [l, c, h] = parseOklchChannels(value);
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
