import { PAGE_COLUMN, PAGE_COLUMN_START } from "../../../lib/shell-layout";
import { SHELL_SURFACE, type ShellMaterial } from "../../../lib/shell-material";

/**
 * The classes of the lists of `SiteHeaderStatic`. Each list is a native
 * popover: the browser opens it from its button, closes it on Esc and on a press
 * outside, hands focus back to the button and exposes the open state, all with
 * no script. Tailwind reads whole literals, so every class stays spelled out in
 * full.
 *
 * A browser that has the Popover API draws a panel in the top layer, which
 * ignores the ancestors of the box: `top` and `left` name a place in the page.
 * `absolute` keeps the panel in the page, so it scrolls with the header like the
 * panel of `SiteHeader` does. The page starts with the header, and `top` counts
 * the bar: 52 px of row, plus the 1 px hairline for the menu.
 *
 * A browser without it ignores `popover` and `popovertarget`. The panels then
 * stay in the flow, under the bar, and the menu button hides: the lists show in
 * full and nothing covers the page. The base classes make that layout, and the
 * `supports-[selector(:popover-open)]` classes turn it into the overlay, so a
 * browser that cannot tell keeps the safe one.
 */

/** The widths where the menu shows, as `menuReach` says. */
export type PopoverMenuReach = "desktop" | "tablet";

/**
 * A panel stays open while focus moves on, and it could hide the element that
 * has focus. While a key has put focus outside the header, the open panel
 * hides. It shows again when focus comes back, and Esc closes it from anywhere.
 */
const FOCUS_OUTSIDE =
  "[:root:has(:focus-visible)_header:not(:has(:focus-visible))_&:popover-open]:hidden";

/**
 * The browser gives a popover `margin: auto`, `inset: 0`, `overflow: auto`, a
 * border and the canvas colours: each one resets here, and each panel sets its
 * own sides (`right-auto` for the card, `inset-x-0` for the menu, which spans
 * the page like the header). In the flow, `order-last` and `basis-full` put the
 * panel on a line of its own under the bar.
 */
const PANEL =
  "order-last m-0 basis-full overflow-visible bottom-auto text-foreground supports-[selector(:popover-open)]:absolute";

/**
 * The classes of the bar row: the row of `SiteHeader`, which may wrap while the
 * panels sit in the flow. With the Popover API the row is 52 px tall and never
 * wraps, as in `SiteHeader`.
 */
export const POPOVER_ROW = `${PAGE_COLUMN} flex min-h-[52px] flex-wrap items-center gap-4 supports-[selector(:popover-open)]:h-[52px] supports-[selector(:popover-open)]:flex-nowrap`;

/** The fill of the title button while its list is open. */
export const TITLE_OPEN =
  "[&:has(+_[popover]:popover-open)]:bg-accent [&:has(+_[popover]:popover-open)]:text-accent-foreground";

/**
 * The turn of the chevron while the list is open. A browser without the Popover
 * API opens nothing, so the chevron hides there.
 */
export const CHEVRON_OPEN =
  "[button:has(+_[popover]:popover-open)_&]:rotate-180 [@supports_not_selector(:popover-open)]:hidden";

/** The menu glyph, until the menu opens. */
export const GLYPH_SHUT = "[button:has(+_[popover]:popover-open)_&]:hidden";

/** The cross, while the menu stays open. */
export const GLYPH_OPEN =
  "hidden [button:has(+_[popover]:popover-open)_&]:block";

const BUTTON = {
  desktop:
    "size-11 ml-auto min-[1200px]:hidden [@supports_not_selector(:popover-open)]:hidden",
  tablet:
    "size-11 ml-auto md:hidden [@supports_not_selector(:popover-open)]:hidden",
} as const;

const MENU = {
  desktop: "inset-x-0 top-[53px] w-auto border-0 p-0 min-[1200px]:hidden",
  tablet: "inset-x-0 top-[53px] w-auto border-0 p-0 md:hidden",
} as const;

/**
 * The classes of the menu button: at the end of the bar, hidden from the width
 * where the menu hides, and hidden in a browser where it opens nothing.
 */
export function menuButtonClass(reach: PopoverMenuReach): string {
  return BUTTON[reach];
}

/**
 * The classes of the list of sites: a card under the title of the bar, with its
 * left edge on the text of the title. On a phone the card keeps 16 px to the
 * screen edge: it starts at the 20 px page column, so its width stops at the
 * page less 36 px.
 */
export function networkPopoverClass(material: ShellMaterial): string {
  return `${PANEL} ${PAGE_COLUMN_START} right-auto top-[56px] w-72 max-w-[calc(100%-2.25rem)] p-2 ${FOCUS_OUTSIDE} ${SHELL_SURFACE[material].popover}`;
}

/**
 * The classes of the menu panel: under the bar, at the full width of the page,
 * with the hairline of the bar above it. It hides at the widths where the menu
 * button hides.
 */
export function menuPopoverClass(
  material: ShellMaterial,
  reach: PopoverMenuReach,
): string {
  return `${PANEL} ${MENU[reach]} ${FOCUS_OUTSIDE} ${SHELL_SURFACE[material].panel}`;
}
