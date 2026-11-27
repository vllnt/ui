/**
 * Surface material of a glass-capable component. Mirrors the web `Material`.
 *
 * - `"glass"` (default): a translucent surface. It draws Apple Liquid Glass on
 *   iOS 26+ when `expo-glass-effect` is present, else a backdrop blur
 *   (`expo-blur`) under the token tint, with a hairline border and a shadow.
 * - `"solid"`: the opaque `theme.glass.solid` values (card tint, border-colour
 *   hairline, no blur). A solid surface makes its whole subtree solid.
 *
 * A surface also falls back to solid, whatever its `material`, when Reduce
 * Transparency, Increase Contrast (iOS) or High Text Contrast (Android) is on,
 * when `ThemeProvider` sets `glass={false}` (the native twin of web
 * `html[data-glass="off"]`), or when neither `expo-glass-effect` nor
 * `expo-blur` is present.
 */
export type Material = "glass" | "solid";

/** The `material` prop every glass-capable component accepts. */
export type MaterialProps = {
  /** Surface material. Defaults to `"glass"`; `"solid"` opts out of glass. */
  readonly material?: Material;
};
