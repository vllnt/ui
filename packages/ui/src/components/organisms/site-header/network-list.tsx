import type { ComponentType, MouseEventHandler, ReactNode } from "react";

import { SHELL_SURFACE, type ShellMaterial } from "../../../lib/shell-material";
import { Link as UiLink } from "../../atoms/link/link";

/** One site in the switcher. */
export type NetworkSwitcherItem = {
  /**
   * The site that renders the header: listed first and marked current. The
   * header links its row to the app's own home, never to this `href`.
   */
  current: boolean;
  href: string;
  label: string;
};

/** One group of sites in the switcher. */
export type NetworkSwitcherGroup = {
  /** Without it the group has no heading, e.g. the current site's own group. */
  heading?: string;
  id: string;
  items: readonly NetworkSwitcherItem[];
};

/** The sites a header can switch between. */
export type SiteNetwork = {
  /** The groups, in order. The caller builds them from its own list of sites. */
  groups: readonly NetworkSwitcherGroup[];
  /** Names the list, and the title that opens it, e.g. `Acme network`. */
  label: string;
};

/**
 * What the link of the current site takes: the anchor props it needs, so a
 * router link fits as well as a plain `a`.
 */
export type HomeLinkProps = {
  "aria-current": "true";
  children: ReactNode;
  className?: string;
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

/** The id of the switcher panel. Tests and end-to-end checks read it. */
export const NETWORK_PANEL_ID = "site-network";

const ROW =
  "flex min-h-[var(--size-control-xs)] w-full flex-col items-start justify-center rounded-md px-2 text-sm";
const LINK_ROW = `${ROW} font-normal text-foreground hover:bg-accent hover:text-accent-foreground hover:no-underline`;
/**
 * Secondary, not muted: in the dark theme muted is black like the page, so a
 * muted fill would not mark the current site.
 */
const CURRENT_ROW = `${ROW} bg-secondary font-medium text-foreground hover:text-foreground hover:no-underline`;
const HEADING = "px-2 pt-2 text-xs font-medium text-muted-foreground";
/** A hairline sets each group off from the one above it. */
const GROUP_RULE = "mt-1 border-t border-border pt-1";

/**
 * The classes of the title trigger, which both headers share. The library
 * `Button` cannot hold a lockup: it sizes every `svg` inside to 16 px, so the
 * trigger takes the library `Link` styles (focus ring, colours) instead. The
 * `-ml-2` lines the title up with the page column and lets the hover fill reach
 * past it. The trigger is 36 px high with a fine pointer and 44 px with a
 * coarse one.
 */
export const NETWORK_TRIGGER =
  "-ml-2 h-9 cursor-pointer rounded-md border-0 bg-transparent px-2 text-xl font-semibold text-foreground hover:bg-accent hover:text-accent-foreground hover:no-underline [@media(pointer:coarse)]:h-11";

/**
 * The classes of the switcher panel: it floats 8 px under the bar's title, and
 * on a phone it keeps 16 px to the screen edge: the panel starts at the 20 px
 * page column, so its width stops at the screen less 36 px.
 */
export function networkPanelClass(material: ShellMaterial): string {
  return `absolute left-0 top-full mt-2 w-72 max-w-[calc(100vw-2.25rem)] p-2 ${SHELL_SURFACE[material].popover}`;
}

function AnchorHome({ children, ...props }: HomeLinkProps): React.ReactElement {
  return <a {...props}>{children}</a>;
}

function Row({
  homeHref,
  HomeLink,
  item,
  onNavigate,
}: {
  homeHref: string;
  HomeLink: ComponentType<HomeLinkProps>;
  item: NetworkSwitcherItem;
  onNavigate?: () => void;
}): React.ReactElement {
  if (item.current) {
    return (
      <UiLink asChild className={CURRENT_ROW} variant="muted">
        <HomeLink
          aria-current="true"
          href={homeHref}
          {...(onNavigate === undefined ? {} : { onClick: onNavigate })}
        >
          {item.label}
        </HomeLink>
      </UiLink>
    );
  }
  return (
    <UiLink asChild className={LINK_ROW} variant="muted">
      <a href={item.href}>{item.label}</a>
    </UiLink>
  );
}

/**
 * The groups of the list: real links, so a crawler or a client that runs no
 * script reads them with the panel closed too. The current site's row is the
 * link home: `homeHref` is the root or the locale root of the app, and
 * `HomeLink` is the router link of an app that has one.
 *
 * It uses no hook, so the static header renders it on the server with no
 * script. A group's heading id comes from the group id.
 */
export function NetworkGroups({
  groups,
  homeHref,
  HomeLink = AnchorHome,
  onNavigate,
}: {
  groups: readonly NetworkSwitcherGroup[];
  homeHref: string;
  HomeLink?: ComponentType<HomeLinkProps>;
  /** Runs when a visitor follows the link home. */
  onNavigate?: () => void;
}): React.ReactElement[] {
  return groups.map(({ heading, id, items }, index) => {
    const headingId = `${NETWORK_PANEL_ID}-${id}`;
    return (
      <div
        className={`flex flex-col gap-1${index > 0 ? ` ${GROUP_RULE}` : ""}`}
        key={id}
      >
        {heading ? (
          <p className={HEADING} id={headingId}>
            {heading}
          </p>
        ) : null}
        <ul
          aria-labelledby={heading ? headingId : undefined}
          className="m-0 flex list-none flex-col gap-1 p-0"
        >
          {items.map((item) => (
            <li key={item.href}>
              <Row
                homeHref={homeHref}
                HomeLink={HomeLink}
                item={item}
                {...(onNavigate === undefined ? {} : { onNavigate })}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  });
}

/**
 * The chevron of the title trigger. `className` adds the turn that shows the
 * panel is open.
 */
export function Chevron({
  className,
}: {
  className: string;
}): React.ReactElement {
  return (
    <svg
      aria-hidden="true"
      className={`size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/**
 * What sits inside the title trigger: the app's lockup, the network label for
 * assistive tech, and a quiet chevron. The accessible name is the title
 * followed by the label (`Acme Docs, Acme network`), so it says where the
 * visitor is and what the control opens, and it always contains the visible
 * title.
 */
export function NetworkTitle({
  brand,
  chevronClassName,
  label,
}: {
  brand: ReactNode;
  /** The turn of the chevron while the panel is open. */
  chevronClassName: string;
  label: string;
}): React.ReactElement {
  return (
    <>
      {brand}
      <span className="sr-only">, {label}</span>
      <Chevron className={chevronClassName} />
    </>
  );
}
