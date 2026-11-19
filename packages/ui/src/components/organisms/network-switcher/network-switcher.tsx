"use client";

import { useCallback, useRef, useState } from "react";

import { ChevronDown } from "lucide-react";

import {
  SITE_TABLET_MIN_WIDTH,
  useDisclosurePanel,
  useMinWidth,
} from "../../../lib/site-shell";
import { cn } from "../../../lib/utils";
import { Button } from "../../atoms/button/button";
import {
  NetworkMenuList,
  type SiteNetwork,
} from "../../molecules/network-menu-list/network-menu-list";

/** Props for the {@link NetworkSwitcher} component. */
export type NetworkSwitcherProps = {
  className?: string;
  network: SiteNetwork;
  /** The id of the panel, which the button's `aria-controls` names. */
  panelId?: string;
};

/**
 * The network switcher of the site bar, from 768 px: one button (e.g. "vllnt
 * network") that opens a panel listing the network's sites. A phone has no
 * bar button; `SiteHeader` lists the same links in its menu instead.
 *
 * The surface that shows at the current width holds the links, the other one
 * none. The first render, on the server and in the browser, says "phone", so
 * the menu has them in the page for crawlers; the panel takes them over once
 * the browser has measured the width.
 *
 * While open, the first link takes focus, Tab wraps around the links, Esc and
 * a press outside close the panel, and closing hands focus back to the button.
 * Focus that leaves by other means (a screen reader's swipe) closes it too.
 *
 * @example
 * <NetworkSwitcher network={{ label: "vllnt network", groups }} />
 */
const NetworkSwitcher = ({
  className,
  network,
  panelId = "site-network",
  ref,
}: NetworkSwitcherProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const tablet = useMinWidth(SITE_TABLET_MIN_WIDTH);
  const buttonReference = useRef<HTMLButtonElement>(null);
  const panelReference = useRef<HTMLElement>(null);
  const [requested, setRequested] = useState(false);
  const open = requested && tablet;

  /* A width with no button closes the panel: reset while rendering, not in an
   * effect. */
  if (requested && !tablet) setRequested(false);

  const close = useCallback(() => {
    setRequested(false);
  }, []);
  useDisclosurePanel({
    button: buttonReference,
    close,
    closeOnFocusOut: true,
    open,
    panel: panelReference,
  });

  return (
    <div
      className={cn("relative hidden min-[768px]:block", className)}
      data-slot="network-switcher"
      ref={ref}
    >
      <Button
        aria-controls={panelId}
        aria-expanded={open}
        className="h-11 gap-1 motion-safe:active:scale-[0.98] min-[1200px]:[@media(pointer:fine)]:h-9"
        onClick={() => {
          setRequested(!open);
        }}
        ref={buttonReference}
        size="sm"
        type="button"
        variant="ghost"
      >
        {network.label}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "motion-safe:transition-transform",
            open && "rotate-180",
          )}
        />
      </Button>
      {/* No display utility on the panel: it would override `hidden`. */}
      <nav
        aria-label={network.label}
        className="absolute left-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-md"
        hidden={!open}
        id={panelId}
        ref={panelReference}
      >
        {tablet ? <NetworkMenuList network={network} titled={false} /> : null}
      </nav>
    </div>
  );
};
NetworkSwitcher.displayName = "NetworkSwitcher";

export { NetworkSwitcher };
