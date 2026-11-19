"use client";

import {
  type ComponentPropsWithRef,
  type MouseEventHandler,
  type ReactNode,
  type RefObject,
  useCallback,
  useRef,
  useState,
} from "react";

import { Globe, Menu as MenuIcon, X } from "lucide-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

import {
  SITE_COLUMN,
  SITE_DESKTOP_MIN_WIDTH,
  SITE_TABLET_MIN_WIDTH,
  SITE_TARGET,
  useDisclosurePanel,
  useMinWidth,
} from "../../../lib/site-shell";
import { cn } from "../../../lib/utils";
import { Button } from "../../atoms/button/button";
import { Link } from "../../atoms/link/link";
import { Separator } from "../../atoms/separator/separator";
import {
  NetworkMenuList,
  type SiteNetwork,
} from "../../molecules/network-menu-list/network-menu-list";
import { NetworkSwitcher } from "../network-switcher/network-switcher";

/** One link of the site bar or its menu. */
export type SiteNavItem = {
  /** Where the link joins the bar: from 768 px (`tablet`) or from 1200 px
   * (`desktop`). Without it the link stays in the menu. */
  bar?: "desktop" | "tablet";
  /** Marks a link to another site: it opens in a new tab, gets a ↗ and the
   * `labels.external` text, and is never the current link. */
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

/** Props for the {@link SiteHeader} component. */
export type SiteHeaderProps = {
  /** What the home link shows: a wordmark, or any lockup. Defaults to `vllnt`.
   * `labels.home` still names the link. */
  brand?: ReactNode;
  className?: string;
  /** The button at the right. Without it the bar and the menu have none. */
  cta?: { href: string; label: string };
  /** The path of the page, in the same form as the hrefs. It defaults to the
   * browser path, which suits an app whose hrefs are its URLs. An app that
   * rewrites its URLs (a locale prefix) passes its own. */
  currentHref?: string;
  homeHref: string;
  /** The links, in order. The menu lists every one the bar hides at the
   * current width. */
  items: readonly SiteNavItem[];
  labels: {
    close: string;
    /** Read after the text of an external link, e.g. `opens in a new tab`. */
    external?: string;
    /** Names the brand link. */
    home: string;
    /** Names the menu's navigation. */
    menu: string;
    open: string;
    /** Names the bar's navigation. It holds the menu button, so it stays at
     * every width. Its link list hides below 768 px. */
    primary: string;
  };
  /** The link to the same page in the other language. */
  locale?: SiteLocaleLink;
  /** The sites of the network. From 768 px the bar has one button that opens
   * them; a phone lists them in the menu. Without it the header has none. */
  network?: SiteNetwork;
};

const MENU_ID = "site-menu";

/** A link is current on its own page and on the pages below it. A home link
 * (`/` or a locale root such as `/fr`) matches its own page alone. */
function isCurrent(path: string, href: string, homeHref: string): boolean {
  if (path === href) return true;
  return href !== homeHref && href !== "/" && path.startsWith(`${href}/`);
}

/* The current link takes the foreground colour and a heavier weight, so it
 * never relies on colour alone. */
const BAR_LINK = `${SITE_TARGET} justify-center px-1 text-sm font-normal hover:no-underline aria-[current=page]:font-medium aria-[current=page]:text-foreground`;
const MENU_LINK =
  "min-h-11 w-full rounded-md px-2 text-sm font-normal text-foreground hover:bg-secondary hover:no-underline motion-safe:active:scale-[0.98] aria-[current=page]:bg-secondary aria-[current=page]:font-medium";

/* Link wraps these with `asChild`: its Slot hands the class and ref to the
 * child, so each passes the rest of its props on to the anchor. */
type SlotProps = { link: SiteLocaleLink } & Omit<
  ComponentPropsWithRef<"a">,
  "children" | "href"
>;

function LocaleBarLink({
  link: { ariaLabel, href, hrefLang, label, onClick },
  ...rest
}: SlotProps) {
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

function LocaleMenuLink({
  link: { href, hrefLang, label, name, onClick },
  ...rest
}: SlotProps) {
  return (
    <a
      {...rest}
      href={href}
      hrefLang={hrefLang}
      lang={hrefLang}
      onClick={onClick}
    >
      <Globe
        aria-hidden="true"
        className="size-6 shrink-0 text-muted-foreground"
      />
      <span>
        {label} · {name}
      </span>
    </a>
  );
}

/* An external link is a plain anchor (the router has nothing to do for
 * another site) that opens a new tab, with a ↗ and the `external` label for
 * assistive tech. It leaves the menu open, since the visitor stays here. */
function NavLink({
  className,
  current,
  external,
  item,
  onClick,
}: {
  className: string;
  current: boolean;
  external?: string;
  item: SiteNavItem;
  onClick?: () => void;
}) {
  if (item.external) {
    return (
      <Link asChild className={className} variant="muted">
        <a href={item.href} rel="noopener noreferrer" target="_blank">
          {item.label}
          <span aria-hidden="true">↗</span>
          {external ? <span className="sr-only"> ({external})</span> : null}
        </a>
      </Link>
    );
  }
  return (
    <Link asChild className={className} variant="muted">
      <NextLink
        aria-current={current ? "page" : undefined}
        href={item.href}
        {...(onClick === undefined ? {} : { onClick })}
      >
        {item.label}
      </NextLink>
    </Link>
  );
}

function BarLinks({
  external,
  homeHref,
  items,
  path,
}: {
  external?: string;
  homeHref: string;
  items: readonly SiteNavItem[];
  path: string;
}) {
  const barItems = items.filter((item) => item.bar !== undefined);
  if (barItems.length === 0) return null;
  return (
    <div className="hidden items-center gap-2 min-[768px]:flex">
      {barItems.map((item) => (
        <NavLink
          className={cn(
            BAR_LINK,
            item.bar === "desktop" && "hidden min-[1200px]:inline-flex",
          )}
          current={isCurrent(path, item.href, homeHref)}
          item={item}
          key={item.href}
          {...(external === undefined ? {} : { external })}
        />
      ))}
    </div>
  );
}

type BarProps = Pick<
  SiteHeaderProps,
  "brand" | "cta" | "homeHref" | "items" | "labels" | "locale" | "network"
> & {
  buttonReference: RefObject<HTMLButtonElement | null>;
  onToggle: () => void;
  open: boolean;
  path: string;
};

function Bar({
  brand,
  buttonReference,
  cta,
  homeHref,
  items,
  labels,
  locale,
  network,
  onToggle,
  open,
  path,
}: BarProps) {
  return (
    <div className={cn(SITE_COLUMN, "flex h-[52px] items-center gap-4")}>
      <NextLink
        aria-label={labels.home}
        className={cn(
          SITE_TARGET,
          "inline-flex items-center rounded-sm text-xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
        href={homeHref}
      >
        {brand}
      </NextLink>
      {network ? <NetworkSwitcher network={network} /> : null}
      {/* The navigation holds the menu button, so the landmark stays at every
       * width. Its link list hides below 768 px. */}
      <nav
        aria-label={labels.primary}
        className="flex flex-1 items-center gap-4"
      >
        <BarLinks
          {...(labels.external === undefined
            ? {}
            : { external: labels.external })}
          homeHref={homeHref}
          items={items}
          path={path}
        />
        <BarActions
          buttonReference={buttonReference}
          cta={cta}
          labels={labels}
          locale={locale}
          onToggle={onToggle}
          open={open}
        />
      </nav>
    </div>
  );
}

/* The right of the bar: the locale link from 1200 px, the call to action from
 * 768 px, and the menu button below 1200 px. */
function BarActions({
  buttonReference,
  cta,
  labels,
  locale,
  onToggle,
  open,
}: Pick<
  BarProps,
  "buttonReference" | "cta" | "labels" | "locale" | "onToggle" | "open"
>) {
  return (
    <div className="ml-auto flex items-center gap-2 min-[768px]:gap-4">
      {locale ? (
        <Button
          asChild
          className="hidden h-11 min-[1200px]:inline-flex min-[1200px]:[@media(pointer:fine)]:h-9"
          size="sm"
          variant="ghost"
        >
          <LocaleBarLink link={locale} />
        </Button>
      ) : null}
      {cta ? (
        <Button
          asChild
          className="hidden h-11 motion-safe:active:scale-[0.98] min-[768px]:inline-flex min-[1200px]:[@media(pointer:fine)]:h-9"
          size="sm"
        >
          <NextLink href={cta.href}>{cta.label}</NextLink>
        </Button>
      ) : null}
      <Button
        aria-controls={MENU_ID}
        aria-expanded={open}
        aria-label={open ? labels.close : labels.open}
        className="size-11 min-[1200px]:hidden"
        onClick={onToggle}
        ref={buttonReference}
        size="icon"
        type="button"
        variant="ghost"
      >
        {open ? (
          <X aria-hidden="true" className="!size-5" />
        ) : (
          <MenuIcon aria-hidden="true" className="!size-5" />
        )}
      </Button>
    </div>
  );
}

type MenuProps = Pick<
  SiteHeaderProps,
  "cta" | "homeHref" | "items" | "labels" | "locale" | "network"
> & {
  onNavigate: () => void;
  open: boolean;
  panelReference: RefObject<HTMLDivElement | null>;
  path: string;
  /** The viewport is 768 px wide or more: the bar shows the `tablet` links,
   * the switcher and the button, so the menu leaves them out. */
  tablet: boolean;
};

/* The menu lists every link the bar hides at the current width. It drops the
 * others from the page instead of hiding them with CSS: focus containment
 * counts a link that CSS hides as a stop, and Tab would reach nothing.
 *
 * The panel sits under the header and over the page, so opening it moves
 * nothing. `mt-px` leaves the header's own hairline above it. */
function Menu({
  cta,
  homeHref,
  items,
  labels,
  locale,
  network,
  onNavigate,
  open,
  panelReference,
  path,
  tablet,
}: MenuProps) {
  const menuItems = tablet
    ? items.filter((item) => item.bar !== "tablet")
    : items;
  const menuCta = tablet ? undefined : cta;
  return (
    <div
      className="absolute inset-x-0 top-full mt-px border-b border-border bg-background"
      hidden={!open}
      id={MENU_ID}
      ref={panelReference}
    >
      <nav
        aria-label={labels.menu}
        className={cn(SITE_COLUMN, "flex flex-col gap-1 pb-8 pt-4")}
      >
        {menuItems.map((item) => (
          <NavLink
            className={MENU_LINK}
            current={isCurrent(path, item.href, homeHref)}
            item={item}
            key={item.href}
            {...(labels.external === undefined
              ? {}
              : { external: labels.external })}
            onClick={onNavigate}
          />
        ))}
        {network && !tablet ? (
          <>
            <Separator className="my-2" />
            <NetworkMenuList network={network} />
          </>
        ) : null}
        {locale || menuCta ? <Separator className="my-2" /> : null}
        {locale ? (
          <Link asChild className={cn(MENU_LINK, "gap-3")} variant="muted">
            <LocaleMenuLink link={locale} />
          </Link>
        ) : null}
        {menuCta ? (
          <Button asChild className="mt-4 w-full" size="lg">
            <NextLink href={menuCta.href} onClick={onNavigate}>
              {menuCta.label}
            </NextLink>
          </Button>
        ) : null}
      </nav>
    </div>
  );
}

/**
 * The site bar of every vllnt site, from oss.vllnt.com: brand, network
 * switcher, the site's links, locale link, call to action and a phone menu.
 * The app passes the copy, the links and the network's site list; the header
 * owns the markup. Text inherits the body face (`--font-mono`).
 *
 * The bar is 52 px high and spans the page, so its hairline reaches both
 * edges. Links join the bar from 768 px (`bar: "tablet"`) or 1200 px
 * (`bar: "desktop"`); the menu lists the rest. While open, the menu keeps
 * focus inside: the first link takes focus, Tab wraps, Esc and a press outside
 * close it, and closing hands focus back to the button. A route change or a
 * width with no menu button closes it too.
 *
 * @example
 * <SiteHeader
 *   homeHref="/"
 *   items={[{ bar: "tablet", href: "/packages", label: "Packages" }]}
 *   labels={{ close: "Close menu", home: "vllnt, home", menu: "Menu", open: "Open menu", primary: "Main" }}
 *   network={{ label: "vllnt network", groups }}
 * />
 */
const SiteHeader = ({
  brand = "vllnt",
  className,
  currentHref,
  homeHref,
  items,
  labels,
  ref,
  ...slots
}: SiteHeaderProps & { ref?: React.Ref<HTMLElement> }) => {
  const browserPath = usePathname();
  const path = currentHref ?? browserPath ?? "";
  const buttonReference = useRef<HTMLButtonElement>(null);
  const panelReference = useRef<HTMLDivElement>(null);
  const tablet = useMinWidth(SITE_TABLET_MIN_WIDTH);
  const desktop = useMinWidth(SITE_DESKTOP_MIN_WIDTH);
  const [menu, setMenu] = useState({ open: false, path });

  /* A route change closes the menu, and so does a width that has no menu:
   * reset while rendering, not in an effect. */
  if (menu.open && (menu.path !== path || desktop)) {
    setMenu({ open: false, path });
  }
  const open = menu.open && menu.path === path && !desktop;

  const closeMenu = useCallback(() => {
    setMenu({ open: false, path });
  }, [path]);
  useDisclosurePanel({
    button: buttonReference,
    close: closeMenu,
    open,
    panel: panelReference,
  });

  return (
    <header
      className={cn(
        "relative z-40 border-b border-border bg-background",
        className,
      )}
      data-slot="site-header"
      ref={ref}
    >
      <Bar
        brand={brand}
        buttonReference={buttonReference}
        homeHref={homeHref}
        items={items}
        labels={labels}
        {...slots}
        onToggle={() => {
          setMenu({ open: !open, path });
        }}
        open={open}
        path={path}
      />
      <Menu
        homeHref={homeHref}
        items={items}
        labels={labels}
        {...slots}
        onNavigate={closeMenu}
        open={open}
        panelReference={panelReference}
        path={path}
        tablet={tablet}
      />
    </header>
  );
};
SiteHeader.displayName = "SiteHeader";

export { SiteHeader };
