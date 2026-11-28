"use client";

import {
  type ReactNode,
  type RefObject,
  useCallback,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { named } from "../../../lib/named";
import {
  SHELL_DESKTOP_MIN_WIDTH,
  SHELL_TABLET_MIN_WIDTH,
} from "../../../lib/shell-layout";
import {
  SHELL_MATERIAL,
  SHELL_SURFACE,
  type ShellMaterial,
} from "../../../lib/shell-material";
import { useEscapeKey } from "../../../lib/use-escape-key";
import { useFocusContainment } from "../../../lib/use-focus-containment";
import { Button } from "../../atoms/button/button";
import { Link as UiLink } from "../../atoms/link/link";
import { Separator } from "../../atoms/separator/separator";

import { useMinWidth, useOutsidePress } from "./menu-hooks";
import {
  BAR,
  barLinkClass,
  ExternalNavLink,
  isCurrent,
  LocaleBarLink,
  LocaleMenuLink,
  MENU,
  MenuGlyph,
  menuPanelClass,
  menuReach,
  type SiteHeaderProps,
  type SiteNavItem,
} from "./nav-parts";
import { NetworkSwitcher } from "./network-switcher";

type MenuReach = ReturnType<typeof menuReach>;

type BarProps = Pick<
  SiteHeaderProps,
  | "actions"
  | "brand"
  | "cta"
  | "homeHref"
  | "items"
  | "labels"
  | "locale"
  | "network"
> & {
  buttonReference: RefObject<HTMLButtonElement | null>;
  material: ShellMaterial;
  onToggle: () => void;
  open: boolean;
  path: string;
  reach: MenuReach;
};

/**
 * One link of the bar or the menu. An external link is a plain anchor that
 * opens a new tab (see `ExternalNavLink`). It leaves the menu open, since the
 * visitor stays on this page.
 */
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
}): React.ReactElement {
  if (item.external) {
    return (
      <ExternalNavLink
        className={className}
        {...(external === undefined ? {} : { external })}
        item={item}
      />
    );
  }
  return (
    <UiLink asChild className={className} variant="muted">
      <Link
        aria-current={current ? "page" : undefined}
        href={item.href}
        {...(onClick === undefined ? {} : { onClick })}
      >
        {item.label}
      </Link>
    </UiLink>
  );
}

/** The tablet links show in the bar from 768 px, the desktop links from 1200 px. */
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
}): null | React.ReactElement {
  const barItems = items.filter((item) => item.bar !== undefined);
  if (barItems.length === 0) return null;
  return (
    <div className={BAR.links}>
      {barItems.map((item) => (
        <NavLink
          className={barLinkClass(item)}
          current={isCurrent(path, item.href, homeHref)}
          item={item}
          key={item.href}
          {...(external === undefined ? {} : { external })}
        />
      ))}
    </div>
  );
}

function Brand({
  brand,
  homeHref,
  label,
}: {
  brand: ReactNode;
  homeHref: string;
  label: string;
}): React.ReactElement {
  return (
    <Link aria-label={label} className={BAR.brand} href={homeHref}>
      {brand}
    </Link>
  );
}

/**
 * The button that opens and closes the menu: below 1200 px, or below 768 px
 * when the bar already shows everything the menu would list from there.
 */
function MenuButton({
  buttonReference,
  labels,
  onToggle,
  open,
  reach,
}: Pick<BarProps, "buttonReference" | "labels" | "onToggle" | "open"> & {
  reach: Exclude<MenuReach, "never">;
}): React.ReactElement {
  return (
    <Button
      aria-controls="site-menu"
      aria-expanded={open}
      aria-label={open ? labels.close : labels.open}
      className={reach === "tablet" ? "md:hidden" : "min-[1200px]:hidden"}
      onClick={onToggle}
      ref={buttonReference}
      size="icon-lg"
      type="button"
      variant="ghost"
    >
      <MenuGlyph open={open} />
    </Button>
  );
}

function Bar({
  actions,
  brand,
  buttonReference,
  cta,
  homeHref,
  items,
  labels,
  locale,
  material,
  network,
  onToggle,
  open,
  path,
  reach,
}: BarProps): React.ReactElement {
  return (
    <div className={BAR.row}>
      {/* With a network the title is the switcher, and its list has the link
       * home (a page that runs no script gets one over the title); without
       * one the title is the link home. */}
      {network ? (
        <NetworkSwitcher
          brand={brand}
          homeHref={homeHref}
          homeLabel={labels.home}
          material={material}
          network={network}
          path={path}
        />
      ) : (
        <Brand brand={brand} homeHref={homeHref} label={labels.home} />
      )}
      {/* The navigation holds the menu button, so the landmark stays at every
       * width. The link list inside it hides below 768 px. */}
      <nav aria-label={labels.primary} className={BAR.nav}>
        <BarLinks
          {...(labels.external === undefined
            ? {}
            : { external: labels.external })}
          homeHref={homeHref}
          items={items}
          path={path}
        />
        <div className={BAR.actions}>
          {actions}
          {locale ? (
            <Button asChild className={BAR.locale} size="sm" variant="ghost">
              <LocaleBarLink link={locale} />
            </Button>
          ) : null}
          {cta ? (
            <Button asChild className={BAR.cta} size="sm">
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          ) : null}
          {reach === "never" ? null : (
            <MenuButton
              buttonReference={buttonReference}
              labels={labels}
              onToggle={onToggle}
              open={open}
              reach={reach}
            />
          )}
        </div>
      </nav>
    </div>
  );
}

type MenuProps = Pick<
  SiteHeaderProps,
  "cta" | "homeHref" | "items" | "labels" | "locale"
> & {
  material: ShellMaterial;
  onNavigate: () => void;
  open: boolean;
  panelReference: RefObject<HTMLDivElement | null>;
  path: string;
  /**
   * The viewport is 768 px wide or more: the bar shows the `tablet` links and
   * the button, so the menu leaves them out.
   */
  tablet: boolean;
};

/**
 * The menu lists every link the bar hides at the current width. It drops the
 * others from the page instead of hiding them with CSS: focus containment
 * counts a link that CSS hides as a stop, and Tab would reach nothing.
 *
 * The panel sits under the header and over the page, so opening it moves
 * nothing. `mt-px` leaves the header's own hairline above it.
 */
function Menu({
  cta,
  homeHref,
  items,
  labels,
  locale,
  material,
  onNavigate,
  open,
  panelReference,
  path,
  tablet,
}: MenuProps): React.ReactElement {
  const menuItems = tablet
    ? items.filter((item) => item.bar !== "tablet")
    : items;
  const menuCta = tablet ? undefined : cta;
  return (
    <div
      className={menuPanelClass(material)}
      hidden={!open}
      id="site-menu"
      ref={panelReference}
    >
      <nav aria-label={labels.menu} className={MENU.nav}>
        {menuItems.map((item) => (
          <NavLink
            className={MENU.link}
            current={isCurrent(path, item.href, homeHref)}
            item={item}
            key={item.href}
            {...(labels.external === undefined
              ? {}
              : { external: labels.external })}
            onClick={onNavigate}
          />
        ))}
        {/* The hairline sets the links off from what follows: with no locale
         * link and no button, nothing follows, and with no link, nothing
         * comes before. */}
        {menuItems.length > 0 && (locale || menuCta) ? (
          <Separator className="my-2" />
        ) : null}
        {locale ? (
          <UiLink asChild className={`${MENU.link} gap-3`} variant="muted">
            <LocaleMenuLink link={locale} />
          </UiLink>
        ) : null}
        {menuCta ? (
          <Button asChild className={MENU.cta} size="lg">
            <Link href={menuCta.href} onClick={onNavigate}>
              {menuCta.label}
            </Link>
          </Button>
        ) : null}
      </nav>
    </div>
  );
}

/**
 * The header of a site that hydrates: a bar across the page with the title, the
 * links, an optional language link and button, and a menu below 1200 px. It has
 * no brand, link or copy of its own; the page gives them all.
 *
 * With a `network`, the title is the button that opens the list of sites (the
 * current site first, linked home, then the others), and the menu leaves that
 * list out. Without one the title is a plain link home. Both cases need
 * `brand`.
 *
 * While open, the menu keeps focus inside: the first link takes focus, Tab and
 * Shift+Tab wrap around the links, Esc and a press outside close the menu, and
 * closing hands focus back to the button. A route change closes it.
 *
 * The bar is flat: a hairline under it, the page colour, no shadow and no blur.
 * `material` stays in the props for compatibility and changes nothing. The header
 * stacks above the page, so the menu panel covers what is under it.
 *
 * @example
 * <SiteHeader
 *   brand="Acme"
 *   homeHref="/"
 *   items={[{ bar: "tablet", href: "/docs", label: "Docs" }]}
 *   labels={{
 *     close: "Close menu",
 *     home: "Acme home",
 *     menu: "Menu",
 *     open: "Open menu",
 *     primary: "Primary",
 *   }}
 * />
 */
const SiteHeader = /* @__PURE__ */ named(
  "SiteHeader",
  ({
    actions,
    brand,
    currentHref,
    homeHref,
    items,
    labels,
    material = SHELL_MATERIAL,
    ...slots
  }: SiteHeaderProps): React.ReactElement => {
    const browserPath = usePathname();
    // A Pages Router app types `usePathname` as `string | null`: null until the
    // router is ready, and never null in an App Router app.
    const path = currentHref ?? browserPath ?? "";
    const reach = menuReach({ cta: slots.cta, items, locale: slots.locale });
    const buttonReference = useRef<HTMLButtonElement>(null);
    const panelReference = useRef<HTMLDivElement>(null);
    const tablet = useMinWidth(SHELL_TABLET_MIN_WIDTH);
    const desktop = useMinWidth(SHELL_DESKTOP_MIN_WIDTH);
    const [menu, setMenu] = useState({ open: false, path });
    const noMenu =
      reach === "never" || desktop || (reach === "tablet" && tablet);

    // A route change closes the menu, and so does a width that has no menu:
    // reset while rendering, not in an effect.
    if (menu.open && (menu.path !== path || noMenu)) {
      setMenu({ open: false, path });
    }
    const open = menu.open && menu.path === path && !noMenu;

    const closeMenu = useCallback(() => {
      setMenu({ open: false, path });
    }, [path]);
    useEscapeKey(
      () => {
        closeMenu();
        buttonReference.current?.focus();
      },
      { enabled: open },
    );
    useFocusContainment(panelReference, open);
    useOutsidePress({
      button: buttonReference,
      close: closeMenu,
      open,
      panel: panelReference,
    });

    // What the bar and the menu both read.
    const shared = { homeHref, items, labels, material, open, path, ...slots };

    return (
      <header
        className={`relative z-40 ${SHELL_SURFACE[material].bar}`}
        data-material="solid"
        data-slot="site-header"
      >
        <Bar
          actions={actions}
          brand={brand}
          buttonReference={buttonReference}
          {...shared}
          onToggle={() => {
            setMenu({ open: !open, path });
          }}
          reach={reach}
        />
        {reach === "never" ? null : (
          <Menu
            {...shared}
            onNavigate={closeMenu}
            panelReference={panelReference}
            tablet={tablet}
          />
        )}
      </header>
    );
  },
);

export { SiteHeader };
