/**
 * Surface material of a glass-capable component.
 *
 * - `"glass"` (default): the page background at the glass opacity, a backdrop
 *   blur, a hairline border and a top highlight (`vllnt-glass*` classes).
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
  /** Surface material. Defaults to `"glass"`; `"solid"` opts out of glass. */
  material?: Material;
};
