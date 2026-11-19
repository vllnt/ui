"use client";

import { useId } from "react";

import { cn } from "../../../lib/utils";
import { Link } from "../../atoms/link/link";

/**
 * One site of the network. Extra keys from a site config pass through
 * untouched; the list reads these three.
 */
export type NetworkSwitcherItem = {
  [key: string]: unknown;
  /** The site that renders the header: shown as text, not as a link. */
  current: boolean;
  href: string;
  label: string;
};

/** A run of sites under one heading. Extra keys pass through untouched. */
export type NetworkSwitcherGroup = {
  [key: string]: unknown;
  /** Without it the group has no heading (the parent site, listed first). */
  heading?: string;
  id: string;
  items: readonly NetworkSwitcherItem[];
};

/**
 * The sites of a network, as `SiteHeader`'s `network` prop takes them. The
 * site list is data: the app passes it (e.g. built from its site config), the
 * library hardcodes none. `version` and any other key of the config are
 * accepted and kept.
 */
export type SiteNetwork = {
  [key: string]: unknown;
  /** The groups, in order. */
  groups: readonly NetworkSwitcherGroup[];
  /** Names the switcher button and the list, e.g. `vllnt network`. */
  label: string;
  /** The version of the site config the list came from, when it has one. */
  version?: number | string;
};

/** Props for the {@link NetworkMenuList} component. */
export type NetworkMenuListProps = {
  className?: string;
  network: SiteNetwork;
  /**
   * Show `network.label` above the groups and name the list with it, as the
   * phone menu of `SiteHeader` does. `NetworkSwitcher` turns it off: its
   * `<nav>` already carries the name.
   */
  titled?: boolean;
};

const ROW =
  "flex min-h-11 w-full flex-col items-start justify-center rounded-md px-2 text-sm";
/* Hover and current share the `--secondary` fill; the current row adds the
 * weight, so it never relies on colour alone (SPATIAL.md §3.2). */
const LINK_ROW = `${ROW} font-normal text-foreground hover:bg-secondary hover:no-underline motion-safe:active:scale-[0.98]`;
const CURRENT_ROW = `${ROW} bg-secondary font-medium text-foreground`;
const HEADING = "m-0 px-2 pt-2 text-xs font-medium text-muted-foreground";

function Row({ item }: { item: NetworkSwitcherItem }) {
  if (item.current) {
    return (
      <span aria-current="true" className={CURRENT_ROW}>
        {item.label}
      </span>
    );
  }
  return (
    <Link asChild className={LINK_ROW} variant="muted">
      <a href={item.href}>{item.label}</a>
    </Link>
  );
}

function Groups({ groups }: { groups: readonly NetworkSwitcherGroup[] }) {
  const prefix = useId();
  return groups.map(({ heading, id, items }) => {
    const headingId = `${prefix}-${id}`;
    return (
      <div className="flex flex-col gap-1" key={id}>
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
              <Row item={item} />
            </li>
          ))}
        </ul>
      </div>
    );
  });
}

/**
 * The grouped list of a network's sites: real links, so crawlers and clients
 * that run no script read them. The current site shows as text with
 * `aria-current`. `SiteHeader` shows it, titled, in the phone menu;
 * `NetworkSwitcher` shows it in its panel.
 *
 * @example
 * <NetworkMenuList network={{ label: "vllnt network", groups }} />
 */
const NetworkMenuList = ({
  className,
  network,
  ref,
  titled = true,
}: NetworkMenuListProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const titleId = useId();
  return (
    <div
      aria-labelledby={titled ? titleId : undefined}
      className={cn("flex flex-col gap-1", className)}
      data-slot="network-menu-list"
      ref={ref}
      role={titled ? "group" : undefined}
    >
      {titled ? (
        <p className={HEADING} id={titleId}>
          {network.label}
        </p>
      ) : null}
      <Groups groups={network.groups} />
    </div>
  );
};
NetworkMenuList.displayName = "NetworkMenuList";

export { NetworkMenuList };
