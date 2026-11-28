/**
 * The material of the site shell's surfaces: the header bar, the menu panel and
 * the switcher panel.
 *
 * The shell is flat. Both values draw the same opaque surface on the page
 * colour, with a hairline border, no shadow and no blur. `"glass"` stays in the
 * type, and every shell part still takes a `material` prop, so a site written
 * against an older shell keeps compiling; it changes nothing. Glass is for
 * media and HUD surfaces, and those opt in with `data-glass="on"`.
 */
export type ShellMaterial = "glass" | "solid";

/** The material of a shell with no setting. */
export const SHELL_MATERIAL: ShellMaterial = "solid";

/** The classes of each surface of the shell. */
export type ShellSurface = {
  /** The header, across the page. */
  bar: string;
  /** The menu, under the header. */
  panel: string;
  /** A panel that floats over the page: the switcher. */
  popover: string;
};

const FLAT: ShellSurface = {
  bar: "border-b border-border bg-background",
  panel: "border-b border-border bg-background",
  popover: "rounded-lg border border-border bg-popover text-popover-foreground",
};

/** The surfaces by material. Both values are the flat surface. */
export const SHELL_SURFACE: Record<ShellMaterial, ShellSurface> = {
  glass: FLAT,
  solid: FLAT,
};
