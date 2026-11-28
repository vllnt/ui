import type { ReactNode } from "react";

import { named } from "../../../lib/named";
import {
  SHELL_MATERIAL,
  SHELL_SURFACE,
  type ShellMaterial,
} from "../../../lib/shell-material";
import { Button } from "../../atoms/button/button";
import { Link as UiLink } from "../../atoms/link/link";
import {
  BAR,
  barLinkClass,
  ExternalNavLink,
  isCurrent,
  LocaleBarLink,
  LocaleMenuLink,
  MENU,
  MenuGlyph,
  menuReach,
  type SiteHeaderProps,
  type SiteLocaleLink,
  type SiteNavItem,
} from "../site-header/nav-parts";
import {
  NETWORK_PANEL_ID,
  NETWORK_TRIGGER,
  NetworkGroups,
  NetworkTitle,
} from "../site-header/network-list";

import {
  CHEVRON_OPEN,
  GLYPH_OPEN,
  GLYPH_SHUT,
  menuButtonClass,
  menuPopoverClass,
  networkPopoverClass,
  POPOVER_ROW,
  TITLE_OPEN,
} from "./popover";

/** Props for {@link SiteHeaderStatic}. */
export type SiteHeaderStaticProps = Pick<
  SiteHeaderProps,
  "brand" | "cta" | "homeHref" | "items" | "material" | "network"
> & {
  /**
   * The path of the page, in the same form as the hrefs. Without it no link is
   * current.
   */
  currentHref?: string;
  /**
   * `open` names the menu button. There is no `close`: the same button closes
   * the menu.
   */
  labels: Omit<SiteHeaderProps["labels"], "close">;
  /**
   * The link to the same page in the other language. A server component cannot
   * take a function, so it has no `onClick`.
   */
  locale?: Omit<SiteLocaleLink, "onClick">;
  /**
   * Sits beside the brand, outside the home link (a stage chip, say), so the
   * name of the link, `labels.home`, does not hide its text.
   */
  status?: ReactNode;
};

type PartsProps = Pick<
  SiteHeaderStaticProps,
  "cta" | "homeHref" | "items" | "labels" | "locale"
> & { path: string };

/** The id of the menu panel, which the menu button names. */
const MENU_PANEL_ID = "site-menu";
/**
 * The hairline of the menu: an `hr` that draws the same line with or without a
 * CSS reset.
 */
const RULE =
  "my-2 h-0 w-full shrink-0 border-0 border-t border-solid border-border";

function NavAnchor({
  className,
  homeHref,
  item,
  labels,
  path,
}: Pick<PartsProps, "homeHref" | "labels" | "path"> & {
  className: string;
  item: SiteNavItem;
}): React.ReactElement {
  if (item.external) {
    return (
      <ExternalNavLink
        className={className}
        {...(labels.external === undefined
          ? {}
          : { external: labels.external })}
        item={item}
      />
    );
  }
  return (
    <UiLink asChild className={className} variant="muted">
      <a
        aria-current={isCurrent(path, item.href, homeHref) ? "page" : undefined}
        href={item.href}
      >
        {item.label}
      </a>
    </UiLink>
  );
}

/**
 * The tablet links show in the bar from 768 px, the desktop links from 1200 px.
 * CSS alone decides: a link it hides is out of the Tab order.
 */
function BarLinks(props: PartsProps): null | React.ReactElement {
  const barItems = props.items.filter((item) => item.bar !== undefined);
  if (barItems.length === 0) return null;
  return (
    <div className={BAR.links}>
      {barItems.map((item) => (
        <NavAnchor
          {...props}
          className={barLinkClass(item)}
          item={item}
          key={item.href}
        />
      ))}
    </div>
  );
}

/**
 * The navigation shows from the width where the bar has its first link, and a
 * bar with no link has no navigation: a screen reader never meets an empty
 * landmark.
 */
const NAV_FROM_TABLET = "hidden flex-1 items-center gap-4 md:flex";
const NAV_FROM_DESKTOP = "hidden flex-1 items-center gap-4 min-[1200px]:flex";

function primaryNavClass({ cta, items, locale }: PartsProps): null | string {
  if (cta || items.some((item) => item.bar === "tablet"))
    return NAV_FROM_TABLET;
  if (locale || items.some((item) => item.bar === "desktop")) {
    return NAV_FROM_DESKTOP;
  }
  return null;
}

function PrimaryNav(props: PartsProps): null | React.ReactElement {
  const { cta, labels, locale } = props;
  const className = primaryNavClass(props);
  if (className === null) return null;
  return (
    <nav aria-label={labels.primary} className={className}>
      <BarLinks {...props} />
      <div className={BAR.actions}>
        {locale ? (
          <Button asChild className={BAR.locale} size="sm" variant="ghost">
            <LocaleBarLink link={locale} />
          </Button>
        ) : null}
        {cta ? (
          <Button asChild className={BAR.cta} size="sm">
            <a href={cta.href}>{cta.label}</a>
          </Button>
        ) : null}
      </div>
    </nav>
  );
}

/**
 * The title of the bar, at every width: the lockup and a chevron are the
 * button, the list of sites is the popover it opens, and its first row is the
 * current site, linked home. The button carries no `aria-expanded`: a script
 * would have to keep it, and the browser exposes the state of a popover button
 * itself. The panel follows the button in the markup, which the open fill and
 * the chevron read.
 */
function TitlePopover({
  brand,
  homeHref,
  material,
  network,
}: Pick<SiteHeaderProps, "brand" | "homeHref"> & {
  material: ShellMaterial;
  network: NonNullable<SiteHeaderStaticProps["network"]>;
}): React.ReactElement {
  return (
    <>
      <UiLink
        asChild
        className={`${NETWORK_TRIGGER} ${TITLE_OPEN}`}
        variant="muted"
      >
        <button
          aria-controls={NETWORK_PANEL_ID}
          popoverTarget={NETWORK_PANEL_ID}
          type="button"
        >
          <NetworkTitle
            brand={brand}
            chevronClassName={CHEVRON_OPEN}
            label={network.label}
          />
        </button>
      </UiLink>
      <nav
        aria-label={network.label}
        className={networkPopoverClass(material)}
        id={NETWORK_PANEL_ID}
        popover="auto"
      >
        <div className="flex flex-col gap-1">
          <NetworkGroups groups={network.groups} homeHref={homeHref} />
        </div>
      </nav>
    </>
  );
}

/**
 * Every link the bar hides at some width. A link the bar shows from 768 px
 * hides here from 768 px, so no width lists a link twice. The site list is not
 * here: the title of the bar holds it at every width.
 */
function MenuLinks(props: PartsProps): React.ReactElement {
  const { cta, items, locale } = props;
  return (
    <>
      {items.map((item) => (
        <NavAnchor
          {...props}
          className={`${MENU.link}${item.bar === "tablet" ? " md:hidden" : ""}`}
          item={item}
          key={item.href}
        />
      ))}
      {items.length > 0 && (locale || cta) ? (
        <hr
          aria-hidden="true"
          className={locale ? RULE : `${RULE} md:hidden`}
        />
      ) : null}
      {locale ? (
        <UiLink asChild className={`${MENU.link} gap-3`} variant="muted">
          <LocaleMenuLink link={locale} />
        </UiLink>
      ) : null}
      {cta ? (
        <Button asChild className={`${MENU.cta} md:hidden`} size="lg">
          <a href={cta.href}>{cta.label}</a>
        </Button>
      ) : null}
    </>
  );
}

/**
 * The menu, below 1200 px. From 768 px it holds the links the bar does not show
 * yet and the language link; with neither it hides from 768 px, so no width has
 * a control that opens an empty panel, and a header with nothing to list has no
 * menu. The button shows the menu glyph until the menu opens, then the cross.
 * The panel sits under the header, so opening it moves nothing.
 */
function MenuPopover({
  material,
  ...props
}: PartsProps & { material: ShellMaterial }): null | React.ReactElement {
  const reach = menuReach({
    cta: props.cta,
    items: props.items,
    locale: props.locale,
  });
  if (reach === "never") return null;
  return (
    <>
      <Button
        asChild
        className={menuButtonClass(reach)}
        size="icon"
        variant="ghost"
      >
        <button
          aria-controls={MENU_PANEL_ID}
          popoverTarget={MENU_PANEL_ID}
          type="button"
        >
          <span className="sr-only">{props.labels.open}</span>
          <span aria-hidden="true" className={GLYPH_SHUT}>
            <MenuGlyph open={false} />
          </span>
          <span aria-hidden="true" className={GLYPH_OPEN}>
            <MenuGlyph open />
          </span>
        </button>
      </Button>
      <div
        className={menuPopoverClass(material, reach)}
        id={MENU_PANEL_ID}
        popover="auto"
      >
        <nav aria-label={props.labels.menu} className={MENU.nav}>
          <MenuLinks {...props} />
        </nav>
      </div>
    </>
  );
}

/**
 * The header of a site that runs no JavaScript: a server component, with no
 * state, effect, router hook or event handler. The title (with a `network`) and
 * the menu are buttons that open native popovers, and CSS shows each link at its
 * width, so the page needs no script and no hydration. It needs `brand`, as
 * `SiteHeader` does.
 *
 * The browser does what script does in `SiteHeader`: Esc and a press outside
 * close a list, Esc hands focus back to its button, opening one list closes the
 * other, and the button exposes the open state. One rule adds what a popover
 * lacks: an open list hides while a key has put focus outside the header, so it
 * never covers the element that has focus. Following a link to the same page
 * (`#anchor`) leaves a list open, and focus is not held inside it: Tab leaves.
 * Use `SiteHeader` wherever the page can hydrate.
 *
 * A browser without the Popover API shows both lists in full under the bar and
 * hides the menu button, since it would open nothing.
 *
 * @example
 * <SiteHeaderStatic
 *   brand="Acme"
 *   homeHref="/"
 *   items={[{ bar: "tablet", href: "/docs", label: "Docs" }]}
 *   labels={{ home: "Acme home", menu: "Menu", open: "Open menu", primary: "Primary" }}
 * />
 */
const SiteHeaderStatic = /* @__PURE__ */ named(
  "SiteHeaderStatic",
  ({
    brand,
    currentHref,
    homeHref,
    items,
    labels,
    material = SHELL_MATERIAL,
    network,
    status,
    ...slots
  }: SiteHeaderStaticProps): React.ReactElement => {
    const parts = {
      homeHref,
      items,
      labels,
      path: currentHref ?? "",
      ...slots,
    };
    return (
      <header
        className={`relative z-40 ${SHELL_SURFACE[material].bar}`}
        data-material="solid"
        data-slot="site-header-static"
      >
        <div className={POPOVER_ROW}>
          {/* With a network the title is the button of the list, which has the
           * link home; without one the title is the link home. */}
          {network ? (
            <TitlePopover
              brand={brand}
              homeHref={homeHref}
              material={material}
              network={network}
            />
          ) : (
            <a aria-label={labels.home} className={BAR.brand} href={homeHref}>
              {brand}
            </a>
          )}
          {status}
          <PrimaryNav {...parts} />
          <MenuPopover {...parts} material={material} />
        </div>
      </header>
    );
  },
);

export { SiteHeaderStatic };
