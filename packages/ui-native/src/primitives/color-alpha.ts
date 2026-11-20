const HEX_COLOR = /^#[\da-f]{6}$/i;

/**
 * Applies an opacity to a theme colour, the way the web tokens write
 * `bg-primary/5`. Theme colours are `#rrggbb` strings, so the result is
 * `#rrggbbaa`. A colour in any other form (a custom theme override such as
 * `rgb(...)`) comes back unchanged, which keeps it fully opaque rather than
 * guessing.
 *
 * @param color - A theme colour.
 * @param alpha - Opacity from 0 to 1; values outside the range clamp.
 * @returns The colour with its opacity applied.
 * @example
 * withAlpha("#fa6961", 0.1); // "#fa69611a"
 */
export function withAlpha(color: string, alpha: number): string {
  if (!HEX_COLOR.test(color)) return color;
  const channel = Math.round(Math.min(Math.max(alpha, 0), 1) * 255);
  return `${color}${channel.toString(16).padStart(2, "0")}`;
}
