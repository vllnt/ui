"use client";

import { useRef } from "react";

/** Focus handlers to spread on a Radix `Dialog.Content`. */
export type ReturnFocusHandlers = {
  onCloseAutoFocus: (event: Event) => void;
  onOpenAutoFocus: (event: Event) => void;
};

/**
 * Remembers the element that had focus when a dialog opens and moves focus
 * back to it on close (WAI-ARIA APG dialog pattern). Radix restores focus to
 * a `Dialog.Trigger` and nothing else, so a controlled dialog opened from any
 * other control would drop focus on `<body>`.
 *
 * @param onOpenAutoFocus - optional open handler that runs after the hook records the element.
 * @returns handlers for `onOpenAutoFocus` and `onCloseAutoFocus`.
 */
export function useReturnFocus(
  onOpenAutoFocus?: (event: Event) => void,
): ReturnFocusHandlers {
  const returnFocusReference = useRef<HTMLElement | undefined>(undefined);

  return {
    onCloseAutoFocus: (event: Event) => {
      const target = returnFocusReference.current;
      returnFocusReference.current = undefined;
      if (target?.isConnected) {
        event.preventDefault();
        target.focus();
      }
    },
    onOpenAutoFocus: (event: Event) => {
      const active = document.activeElement;
      returnFocusReference.current =
        active instanceof HTMLElement && active !== document.body
          ? active
          : undefined;
      onOpenAutoFocus?.(event);
    },
  };
}
