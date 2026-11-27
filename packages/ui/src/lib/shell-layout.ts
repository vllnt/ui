/**
 * The layout classes the site shell shares between its parts. They read the
 * page tokens (`--spacing-page-gutter*`, `--size-page-max`) and the control
 * size token, so a theme changes them in one place.
 */

/**
 * The page column: centred, as wide as `--size-page-max`, with the page gutter
 * on both sides. The gutter grows from the phone value to the tablet value at
 * 768 px and to the desktop value at 1200 px.
 */
export const PAGE_COLUMN =
  "mx-auto w-full max-w-[var(--size-page-max)] px-[var(--spacing-page-gutter)] md:px-[var(--spacing-page-gutter-tablet)] min-[1200px]:px-[var(--spacing-page-gutter-desktop)]";

/**
 * The `left` of a positioned box that starts where the text of the page
 * column starts: the centring margin of a page wider than `--size-page-max`,
 * plus the gutter. The box needs a full-width positioned parent, such as the
 * header.
 */
export const PAGE_COLUMN_START =
  "left-[calc(max(0px,(100%_-_var(--size-page-max))/2)_+_var(--spacing-page-gutter))] md:left-[calc(max(0px,(100%_-_var(--size-page-max))/2)_+_var(--spacing-page-gutter-tablet))] min-[1200px]:left-[calc(max(0px,(100%_-_var(--size-page-max))/2)_+_var(--spacing-page-gutter-desktop))]";

/**
 * The hit area of a shell control: `--size-control-xs`, which is 32 px with a
 * fine pointer and the 44 px target size with a coarse one.
 */
export const SHELL_HIT_AREA =
  "min-h-[var(--size-control-xs)] min-w-[var(--size-control-xs)]";

/** The width from which the shell shows its tablet layout, in CSS px. */
export const SHELL_TABLET_MIN_WIDTH = 768;

/** The width from which the shell shows its desktop layout, in CSS px. */
export const SHELL_DESKTOP_MIN_WIDTH = 1200;
