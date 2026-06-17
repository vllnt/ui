"use client";

import { useEffect } from "react";

type UseEscapeKeyOptions = {
  /** Skip the listener while false. Defaults to true. */
  enabled?: boolean;
  /** Call `event.preventDefault()` before the handler. Defaults to false. */
  preventDefault?: boolean;
  /** Attach to `document` or `window`. Defaults to `window`. */
  target?: "document" | "window";
};

/**
 * Run `onEscape` when the user presses Escape. Replaces the hand-rolled keydown
 * listeners that overlays copied. Options cover the small differences between
 * those copies (target node, `preventDefault`, enabled flag).
 */
export function useEscapeKey(
  onEscape: () => void,
  {
    enabled = true,
    preventDefault = false,
    target = "window",
  }: UseEscapeKeyOptions = {},
): void {
  useEffect(() => {
    if (!enabled) return;

    const node = target === "document" ? document : window;
    const handleKeyDown = (event: Event): void => {
      if (!(event instanceof KeyboardEvent) || event.key !== "Escape") return;
      if (preventDefault) event.preventDefault();
      onEscape();
    };

    node.addEventListener("keydown", handleKeyDown);
    return () => {
      node.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, onEscape, preventDefault, target]);
}
