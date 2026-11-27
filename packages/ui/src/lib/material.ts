/**
 * Surface material of a glass-capable component.
 *
 * The default theme is solid. Glass is opt-in: it applies inside a
 * `data-glass="on"` scope, either on the root (`<html data-glass="on">`) or on
 * one surface. GlassCard, GlassPanel, GlassProgress and LiquidGlass set that
 * attribute on their own root when `material` is `"glass"`, so they stay glass
 * on any page.
 *
 * - `"glass"` (default): inside a glass scope, the page background at the glass
 *   opacity, a backdrop blur, a hairline border and a top highlight
 *   (`vllnt-glass*` classes). Outside a scope the same classes draw the solid
 *   material.
 * - `"solid"`: the `vllnt/material/solid` values (opaque card tint, border
 *   colour hairline, no blur). A solid element makes its whole subtree solid.
 *
 * The browser and the app also switch glass to solid without this prop:
 * `prefers-reduced-transparency`, `prefers-contrast: more`, `forced-colors`,
 * no `backdrop-filter` support and `html[data-glass="off"]`.
 */
export type Material = "glass" | "solid";

/** The `material` prop every glass-capable component accepts. */
export type MaterialProps = {
  /** Surface material. Defaults to `"glass"`, which is glass inside a glass scope and solid elsewhere; `"solid"` opts out of glass. */
  material?: Material;
};
