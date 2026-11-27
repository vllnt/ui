"use client";

import {
  type RefObject,
  useCallback,
  useEffect,
  useSyncExternalStore,
} from "react";

function noMatch(): boolean {
  return false;
}

/**
 * Whether the viewport is at least `width` px wide. The server and the first
 * client render say `false`, so the markup matches while hydrating; React then
 * re-renders with the real answer.
 *
 * It exists for the focus handling of the menu: CSS can hide a link at one
 * width, but a hidden link still counts as a focus stop for
 * `useFocusContainment`, which would then swallow Tab. The menu leaves out the
 * links it hides instead.
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

type OutsidePressOptions = {
  /** The opener: a press on it counts as inside, so its own click can toggle. */
  button: RefObject<HTMLElement | null>;
  close: () => void;
  open: boolean;
  panel: RefObject<HTMLElement | null>;
};

/**
 * Calls `close` when a pointer goes down outside both the panel and its button,
 * while the panel is open.
 */
export function useOutsidePress({
  button,
  close,
  open,
  panel,
}: OutsidePressOptions): void {
  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePress = (event: PointerEvent): void => {
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
