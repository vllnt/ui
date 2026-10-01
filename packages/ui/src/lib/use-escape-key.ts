"use client";

import { useEffect } from "react";

type UseEscapeKeyOptions = {
  /**
   * Listen in the capture phase so the handler runs before listeners on
   * descendants (e.g. a Radix dialog's document listener). Defaults to false.
   */
  capture?: boolean;
  /** Skip the listener while false. Defaults to true. */
  enabled?: boolean;
  /** Call `event.preventDefault()` before the handler. Defaults to false. */
  preventDefault?: boolean;
  /** Stop the event from reaching other listeners. Defaults to false. */
  stopPropagation?: boolean;
  /** Attach to `document` or `window`. Defaults to `window`. */
  target?: "document" | "window";
};

/**
 * Run `onEscape` when the user presses Escape. Replaces the hand-rolled keydown
 * listeners that overlays copied. Options cover the small differences between
 * those copies (target node, capture phase, `preventDefault`,
 * `stopPropagation`, enabled flag).
 */
export function useEscapeKey(
  onEscape: () => void,
  {
    capture = false,
    enabled = true,
    preventDefault = false,
    stopPropagation = false,
    target = "window",
  }: UseEscapeKeyOptions = {},
): void {
  useEffect(() => {
    if (!enabled) return;

    const node = target === "document" ? document : window;
    const handleKeyDown = (event: Event): void => {
      if (!(event instanceof KeyboardEvent) || event.key !== "Escape") return;
      if (preventDefault) event.preventDefault();
      if (stopPropagation) event.stopPropagation();
      onEscape();
    };

    node.addEventListener("keydown", handleKeyDown, { capture });
    return () => {
      node.removeEventListener("keydown", handleKeyDown, { capture });
    };
  }, [capture, enabled, onEscape, preventDefault, stopPropagation, target]);
}
