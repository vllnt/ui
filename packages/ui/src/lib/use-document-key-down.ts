"use client";

import { useEffect, useRef } from "react";

/**
 * Options for {@link useDocumentKeyDown} and {@link useEscapeKey}.
 */
export type UseDocumentKeyDownOptions = {
  /** Listen in the capture phase. Defaults to false. */
  capture?: boolean;
  /** Whether to attach the listener. Defaults to true. */
  enabled?: boolean;
};

/**
 * Attaches a document-level `keydown` listener while `enabled` is true.
 *
 * The hook always invokes the latest `handler` without re-attaching the
 * listener, so callers can pass inline functions.
 *
 * @param handler - Receives every document `keydown` event
 * @param options - Capture phase and enabled flag
 * @example
 * useDocumentKeyDown((event) => {
 *   if (event.key === "ArrowRight") next();
 * }, { enabled: isOpen });
 */
export function useDocumentKeyDown(
  handler: (event: KeyboardEvent) => void,
  { capture = false, enabled = true }: UseDocumentKeyDownOptions = {},
): void {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: KeyboardEvent): void => {
      handlerRef.current(event);
    };

    document.addEventListener("keydown", listener, capture);
    return () => {
      document.removeEventListener("keydown", listener, capture);
    };
  }, [capture, enabled]);
}

/**
 * Options for {@link useEscapeKey}.
 */
export type UseEscapeKeyOptions = {
  /** Whether to attach the listener. Defaults to true. */
  enabled?: boolean;
  /** Call `preventDefault()` on the Escape event. Defaults to false. */
  preventDefault?: boolean;
};

/**
 * Runs `onEscape` on any Escape keydown in the document — the
 * close-on-escape behavior that dismissible overlays share.
 *
 * @param onEscape - Called on every Escape keydown while enabled
 * @param options - Enabled flag and preventDefault behavior
 * @example
 * useEscapeKey(onClose, { enabled: isOpen });
 */
export function useEscapeKey(
  onEscape: () => void,
  { enabled = true, preventDefault = false }: UseEscapeKeyOptions = {},
): void {
  useDocumentKeyDown(
    (event) => {
      if (event.key !== "Escape") return;
      if (preventDefault) event.preventDefault();
      onEscape();
    },
    { enabled },
  );
}
