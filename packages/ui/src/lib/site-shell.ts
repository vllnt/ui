"use client";

import {
  type RefObject,
  useCallback,
  useEffect,
  useSyncExternalStore,
} from "react";

import { useEscapeKey } from "./use-escape-key";
import { useFocusContainment } from "./use-focus-containment";

/**
 * The two widths where the site shell changes, from the oss.vllnt.com design
 * handoff: the bar shows its `tablet` links and the network switcher from
 * 768 px, and its `desktop` links (with no menu button) from 1200 px. The
 * classes use literal `min-[768px]:` / `min-[1200px]:` variants, so they work
 * whatever screens an app's Tailwind config declares.
 */
export const SITE_TABLET_MIN_WIDTH = 768;
export const SITE_DESKTOP_MIN_WIDTH = 1200;

/**
 * The page column of every vllnt site: 1440 px wide at most, with 20 px side
 * gutters on a phone, 48 px from 768 px and 96 px from 1200 px.
 */
export const SITE_COLUMN =
  "mx-auto w-full max-w-[1440px] px-5 min-[768px]:px-12 min-[1200px]:px-24";

/**
 * Hit area of a bar link: 44 px on touch, 32 px for a fine pointer from
 * 1200 px (WCAG 2.2 SC 2.5.8 asks 24 px; SPATIAL.md §3.3).
 */
export const SITE_TARGET =
  "min-h-11 min-w-11 min-[1200px]:[@media(pointer:fine)]:min-h-8 min-[1200px]:[@media(pointer:fine)]:min-w-8";

/**
 * Whether the viewport is at least `width` px wide. The server and the first
 * client render say `false`, so the markup matches while hydrating; React then
 * re-renders with the real answer.
 *
 * The shell needs it for focus: CSS can hide a link at one width, but
 * `useFocusContainment` still counts a hidden link as a stop and Tab would
 * reach nothing. The menu leaves out the links it hides instead.
 *
 * @param width - The viewport width to test, in px.
 * @returns Whether the viewport is at least that wide.
 */
export function useMinWidth(width: number): boolean {
  const query = `(min-width: ${width}px)`;
  const subscribe = useCallback(
    (notify: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => {
        list.removeEventListener("change", notify);
      };
    },
    [query],
  );
  const matches = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, matches, noMatch);
}

function noMatch(): boolean {
  return false;
}

type DisclosureOptions = {
  /** The opener: a press on it counts as inside, so its own click can toggle. */
  button: RefObject<HTMLElement | null>;
  close: () => void;
  /** Close as well when focus leaves the panel for anything but the button
   * (a screen reader's swipe). */
  closeOnFocusOut?: boolean;
  open: boolean;
  panel: RefObject<HTMLElement | null>;
};

/** Calls `close` on a pointer press outside the panel and its button. */
function useOutsidePress({ button, close, open, panel }: DisclosureOptions) {
  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      const { target } = event;
      const inside =
        target instanceof Node &&
        (panel.current?.contains(target) === true ||
          button.current?.contains(target) === true);
      if (!inside) close();
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
    };
  }, [button, close, open, panel]);
}

/** Calls `close` when focus moves from the panel to a node outside it and
 * outside its button. */
function useFocusOut({
  button,
  close,
  closeOnFocusOut = false,
  open,
  panel,
}: DisclosureOptions) {
  useEffect(() => {
    const node = panel.current;
    if (!open || !closeOnFocusOut || !node) return;
    const closeOnLeave = (event: FocusEvent) => {
      const next = event.relatedTarget;
      const away = next instanceof Node && !node.contains(next);
      if (away && button.current?.contains(next) !== true) close();
    };
    node.addEventListener("focusout", closeOnLeave);
    return () => {
      node.removeEventListener("focusout", closeOnLeave);
    };
  }, [button, close, closeOnFocusOut, open, panel]);
}

/**
 * The close behaviour of an open site shell panel (the menu, the network
 * panel): focus stays inside; Escape closes it and hands focus back to the
 * button; a pointer press outside the panel and the button closes it.
 *
 * @param options - The button, the panel, the open state and `close`.
 */
export function useDisclosurePanel(options: DisclosureOptions): void {
  const { button, close, open, panel } = options;
  useEscapeKey(
    () => {
      close();
      button.current?.focus();
    },
    { enabled: open },
  );
  useFocusContainment(panel, open);
  useOutsidePress(options);
  useFocusOut(options);
}
