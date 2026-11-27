"use client";

import {
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import { flushSync } from "react-dom";

import { moveRovingFocus } from "../../../lib/roving-focus";
import type { ShellMaterial } from "../../../lib/shell-material";
import { useEscapeKey } from "../../../lib/use-escape-key";
import { Link as UiLink } from "../../atoms/link/link";

import { useOutsidePress } from "./menu-hooks";
import {
  NETWORK_PANEL_ID,
  NETWORK_TRIGGER,
  NetworkGroups,
  networkPanelClass,
  NetworkTitle,
  type SiteNetwork,
} from "./network-list";

type NetworkSwitcherProps = {
  /** The app's lockup: the title the trigger shows. */
  brand: ReactNode;
  /** Where the link of the current site goes: the root or the locale root. */
  homeHref: string;
  /** Names the link home of a page that runs no script: `labels.home`. */
  homeLabel: string;
  /** The material of the panel. */
  material: ShellMaterial;
  network: SiteNetwork;
  /** The path of the page. A new path closes the panel. */
  path: string;
};

const LINKS = "a[href]";

/**
 * The link home of a page that runs no script: it covers the title, so a press
 * on the title goes home, as it did when the title was the brand link.
 */
const NO_SCRIPT_HOME = "absolute inset-y-0 -left-2 right-0 rounded-md";

/** The open fill reads the state the button already announces. */
const OPEN_FILL =
  "aria-expanded:bg-accent aria-expanded:text-accent-foreground";

/**
 * The state of the disclosure, per page. Esc closes it and hands focus back to
 * the button; a press outside closes it too.
 */
function useDisclosure(path: string) {
  const buttonReference = useRef<HTMLButtonElement>(null);
  const panelReference = useRef<HTMLElement>(null);
  const [state, setState] = useState({ open: false, path });

  // A new page closes the panel: reset while rendering, not in an effect.
  if (state.open && state.path !== path) setState({ open: false, path });
  const open = state.open && state.path === path;

  const close = useCallback(() => {
    setState({ open: false, path });
  }, [path]);
  // Esc, and the link home: the panel shuts and takes the focused link with
  // it, so focus goes back to the button instead of the top of the page.
  const closeToButton = useCallback(() => {
    close();
    buttonReference.current?.focus();
  }, [close]);
  useEscapeKey(closeToButton, { enabled: open });
  useOutsidePress({
    button: buttonReference,
    close,
    open,
    panel: panelReference,
  });

  // The panel stays `hidden` until React commits, and a hidden link takes no
  // focus: flush the update before the first link gets it.
  const openAtFirstLink = (): void => {
    flushSync(() => {
      setState({ open: true, path });
    });
    panelReference.current?.querySelector<HTMLElement>(LINKS)?.focus();
  };
  const handleToggle = (): void => {
    setState({ open: !open, path });
  };
  return {
    buttonReference,
    close,
    closeToButton,
    handleToggle,
    open,
    openAtFirstLink,
    panelReference,
  };
}

function Trigger({
  brand,
  label,
  onClick,
  open,
  reference,
}: {
  brand: ReactNode;
  label: string;
  onClick: () => void;
  open: boolean;
  reference: RefObject<HTMLButtonElement | null>;
}): React.ReactElement {
  return (
    <UiLink
      asChild
      className={`${NETWORK_TRIGGER} ${OPEN_FILL}`}
      variant="muted"
    >
      <button
        aria-controls={NETWORK_PANEL_ID}
        aria-expanded={open}
        onClick={onClick}
        ref={reference}
        type="button"
      >
        <NetworkTitle
          brand={brand}
          chevronClassName={open ? "rotate-180" : ""}
          label={label}
        />
      </button>
    </UiLink>
  );
}

function NoScriptHome({
  href,
  label,
}: {
  href: string;
  label: string;
}): React.ReactElement {
  return (
    <noscript>
      <UiLink asChild className={NO_SCRIPT_HOME} variant="muted">
        <a aria-label={label} href={href} />
      </UiLink>
    </noscript>
  );
}

/**
 * The title of the bar, and the switcher behind it: one button that shows the
 * app's lockup and a chevron, and opens the list of sites. It takes the place
 * of the brand link, so a site that passes a `network` has no second button.
 * The current site is the first row of the list and links home.
 *
 * The control follows the disclosure navigation pattern: the panel is a `nav`
 * of links, and the button carries `aria-expanded` and `aria-controls`. It sets
 * no `aria-haspopup`, which would announce a menu widget over a list of links.
 * The links sit in the page at every width, in a `hidden` panel while the panel
 * stays shut, so the server markup holds them for a crawler. The button needs
 * script to open the panel, so the server markup also holds a link home in a
 * `noscript`, over the title: a page that runs no script keeps its way home,
 * and one that does never sees it.
 *
 * Enter and Space toggle. Arrow Down on the button opens the panel and moves
 * focus to the first link. Inside, Arrow Up and Down, Home and End move between
 * the links. Esc closes and hands focus back to the button, and so does
 * following the link home; a press outside and focus leaving the title or the
 * panel (Tab, or a screen reader's swipe) close it too. Tab otherwise walks the
 * links in page order.
 */
export function NetworkSwitcher({
  brand,
  homeHref,
  homeLabel,
  material,
  network,
  path,
}: NetworkSwitcherProps): React.ReactElement {
  const {
    buttonReference,
    close,
    closeToButton,
    handleToggle,
    open,
    openAtFirstLink,
    panelReference,
  } = useDisclosure(path);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.target !== buttonReference.current) {
      moveRovingFocus(event, LINKS, { orientation: "vertical" });
    } else if (
      event.key === "ArrowDown" &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      event.preventDefault();
      openAtFirstLink();
    }
  };

  // The wrapper takes no role of its own: it gathers the key and focus events
  // of the button and the links under it.
  return (
    <div
      className="relative"
      onBlur={(event) => {
        const next = event.relatedTarget;
        if (next instanceof Node && !event.currentTarget.contains(next)) {
          close();
        }
      }}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <Trigger
        brand={brand}
        label={network.label}
        onClick={handleToggle}
        open={open}
        reference={buttonReference}
      />
      <NoScriptHome href={homeHref} label={homeLabel} />
      {/* No display utility on the panel: it would override `hidden`. */}
      <nav
        aria-label={network.label}
        className={networkPanelClass(material)}
        hidden={!open}
        id={NETWORK_PANEL_ID}
        ref={panelReference}
      >
        <div className="flex flex-col gap-1">
          <NetworkGroups
            groups={network.groups}
            homeHref={homeHref}
            HomeLink={Link}
            onNavigate={closeToButton}
          />
        </div>
      </nav>
    </div>
  );
}
