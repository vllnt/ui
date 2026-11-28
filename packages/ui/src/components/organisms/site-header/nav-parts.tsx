import type {
  ComponentPropsWithRef,
  MouseEventHandler,
  ReactNode,
} from "react";

import { PAGE_COLUMN, SHELL_HIT_AREA } from "../../../lib/shell-layout";
import { SHELL_SURFACE, type ShellMaterial } from "../../../lib/shell-material";
import { Link as UiLink } from "../../atoms/link/link";

import type { SiteNetwork } from "./network-list";

/** One link of the header. */
export type SiteNavItem = {
  /**
   * Where the link joins the bar: from 768 px (`tablet`) or from 1200 px
   * (`desktop`). Without it the link stays in the menu, which hides from
   * 1200 px: give a `bar` to every link a desktop visitor needs.
   */
  bar?: "desktop" | "tablet";
  /**
   * Marks a link to another site: it opens in a new tab, gets a ↗ and the
   * `labels.external` text, and is never the current link.
   */
  external?: boolean;
  href: string;
  label: string;
};

/** The link to the same page in the other language. */
export type SiteLocaleLink = {
  /** Names the link in the bar, e.g. `FR, Read this page in French`. */
  ariaLabel: string;
  href: string;
  /** The language of the target page, e.g. `fr`. */
  hrefLang: string;
  /** The short label, e.g. `FR`. */
  label: string;
  /** The language's own name, shown in the menu, e.g. `Français`. */
  name: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

/** Props for {@link SiteHeader}. */
export type SiteHeaderProps = {
  /**
   * A slot for site-specific controls: search, a source link, a sidebar
   * toggle. It sits in the bar before the language link, inside the primary
   * navigation, at every width. Nothing renders without it. `SiteHeader`
   * has it; `SiteHeaderStatic` runs no script and has none.
   */
  actions?: ReactNode;
  /**
   * The title of the bar: a wordmark, or any lockup. Required: the header has
   * no default brand. Without `network` the title links home, named by
   * `labels.home`. With `network` the title opens the list of sites, and the
   * list holds the link home; `labels.home` then names the link home of a page
   * that runs no script.
   */
  brand: ReactNode;
  /** The button at the right. Without it the bar and the menu have none. */
  cta?: { href: string; label: string };
  /**
   * The path of the page, in the same form as the hrefs. It defaults to the
   * browser path, which suits an app whose hrefs are its URLs. An app that
   * rewrites its URLs (a locale prefix) passes its own.
   */
  currentHref?: string;
  homeHref: string;
  /**
   * The links, in order. The menu lists every one the bar hides at the current
   * width.
   */
  items: readonly SiteNavItem[];
  labels: {
    close: string;
    /** Read after the text of an external link, e.g. `opens in a new tab`. */
    external?: string;
    /**
     * Names the brand link. A header with a `network` ignores it: its title is
     * a button, named by its own text and `network.label`.
     */
    home: string;
    /** Names the menu's navigation. */
    menu: string;
    open: string;
    /**
     * Names the bar's navigation. It holds the menu button, so it stays at
     * every width. Its link list hides below 768 px.
     */
    primary: string;
  };
  /** The link to the same page in the other language. */
  locale?: SiteLocaleLink;
  /**
   * Kept so a site written against an older header keeps compiling. Both
   * values render the flat header: a hairline under the bar, an opaque page
   * colour, no shadow and no blur.
   */
  material?: ShellMaterial;
  /**
   * The sites to switch between. The title of the bar becomes the button that
   * opens them, at every width: the current site first, linked home, then the
   * others. The menu never repeats them. Without it the title is a plain link
   * home.
   */
  network?: SiteNetwork;
};

/**
 * The library `Link` bar size gives the height from `--size-control-xs`; the
 * bar keeps its width at the same size.
 */
const BAR_LINK =
  "h-[var(--size-control-xs)] min-w-[var(--size-control-xs)] justify-center px-1 text-sm font-normal hover:no-underline aria-[current=page]:text-foreground";

/** The classes of the bar, which both headers share so they look the same. */
export const BAR = {
  actions: "ml-auto flex items-center gap-2 md:gap-4",
  brand: `${SHELL_HIT_AREA} inline-flex items-center rounded-sm text-xl font-semibold`,
  cta: "hidden md:inline-flex [@media(pointer:coarse)]:h-11",
  links: "hidden items-center gap-2 md:flex",
  locale: "hidden min-[1200px]:inline-flex [@media(pointer:coarse)]:h-11",
  nav: "flex flex-1 items-center gap-4",
  row: `${PAGE_COLUMN} flex h-[52px] items-center gap-4`,
} as const;

/** The classes of the menu, which both headers share so they look the same. */
export const MENU = {
  cta: "mt-4 w-full",
  link: "min-h-[var(--size-control-xs)] w-full rounded-md px-2 text-sm font-normal text-foreground hover:bg-accent hover:text-accent-foreground hover:no-underline aria-[current=page]:font-medium",
  nav: `${PAGE_COLUMN} flex flex-col gap-1 pb-8 pt-4`,
} as const;

/**
 * The classes of a link in the bar: a `tablet` link shows from 768 px (its row
 * shows then), a `desktop` link from 1200 px.
 */
export function barLinkClass(item: SiteNavItem): string {
  return `${BAR_LINK} ${item.bar === "tablet" ? "" : "hidden min-[1200px]:inline-flex"}`;
}

/**
 * The classes of the menu panel. It sits under the header and over the page, so
 * opening it moves nothing. `mt-px` leaves the header's own hairline above it.
 */
export function menuPanelClass(material: ShellMaterial): string {
  return `absolute inset-x-0 top-full mt-px ${SHELL_SURFACE[material].panel}`;
}

/**
 * The widths where the menu button shows: below 1200 px (`desktop`), below
 * 768 px (`tablet`: from 768 px the bar holds every link and the button), or
 * nowhere (`never`: the menu would list nothing). Both headers read it, so no
 * width has a control that opens an empty panel.
 */
export function menuReach({
  cta,
  items,
  locale,
}: {
  cta: SiteHeaderProps["cta"];
  items: SiteHeaderProps["items"];
  locale: SiteHeaderProps["locale"];
}): "desktop" | "never" | "tablet" {
  if (locale || items.some((item) => item.bar !== "tablet")) return "desktop";
  return items.length > 0 || cta ? "tablet" : "never";
}

/**
 * A link is current on its own page and on the pages below it. A home link (`/`
 * or a locale root such as `/fr`) matches its own page alone. A query or a hash
 * on the link does not count, so an app that adds a query to its links keeps
 * the current mark.
 */
export function isCurrent(
  path: string,
  href: string,
  homeHref: string,
): boolean {
  const target = href.split(/[#?]/, 1)[0] ?? href;
  if (path === target) return true;
  return (
    target !== homeHref.split(/[#?]/, 1)[0] &&
    target !== "/" &&
    path.startsWith(`${target}/`)
  );
}

const ICON = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: 2,
  viewBox: "0 0 24 24",
} as const;

/** The glyph of the menu button: three lines, or a cross while the menu is open. */
export function MenuGlyph({ open }: { open: boolean }): React.ReactElement {
  return (
    <svg aria-hidden="true" className="size-5" {...ICON}>
      {open ? (
        <path d="M18 6 6 18M6 6l12 12" />
      ) : (
        <path d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  );
}

function GlobeGlyph(): React.ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="size-6 shrink-0 text-muted-foreground"
      {...ICON}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

/**
 * The library wraps these two links with `asChild`: its Slot hands the class,
 * the ref and the state attributes to the child, so each one passes the rest of
 * its props on to the anchor.
 */
type SlotProps = { link: SiteLocaleLink } & Omit<
  ComponentPropsWithRef<"a">,
  "children" | "href"
>;

/** The locale link in the bar: the short label, named by `ariaLabel`. */
export function LocaleBarLink({
  link: { ariaLabel, href, hrefLang, label, onClick },
  ...rest
}: SlotProps): React.ReactElement {
  return (
    <a
      {...rest}
      aria-label={ariaLabel}
      href={href}
      hrefLang={hrefLang}
      onClick={onClick}
    >
      {label}
    </a>
  );
}

/**
 * The locale link in the menu: the globe, the short label and the name of the
 * language.
 */
export function LocaleMenuLink({
  link: { href, hrefLang, label, name, onClick },
  ...rest
}: SlotProps): React.ReactElement {
  return (
    <a
      {...rest}
      href={href}
      hrefLang={hrefLang}
      lang={hrefLang}
      onClick={onClick}
    >
      <GlobeGlyph />
      <span>
        {label} · {name}
      </span>
    </a>
  );
}

/**
 * The link to another site, in the bar or in the menu. A plain anchor, since
 * the router has nothing to do for another site: it opens a new tab, with a ↗
 * and the `external` label for assistive tech. It leaves the menu open, since
 * the visitor stays on this page. (`SiteFooter` marks its external links the
 * same way but keeps them in the same tab.)
 */
export function ExternalNavLink({
  className,
  external,
  item,
}: {
  className: string;
  external?: string;
  item: SiteNavItem;
}): React.ReactElement {
  return (
    <UiLink asChild className={className} variant="muted">
      <a href={item.href} rel="noopener noreferrer" target="_blank">
        {item.label}
        <span aria-hidden="true">↗</span>
        {external ? <span className="sr-only"> ({external})</span> : null}
      </a>
    </UiLink>
  );
}
