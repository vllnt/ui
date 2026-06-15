"use client";

import { useEffect } from "react";

let lockCount = 0;
let previousOverflow = "";

/**
 * Locks body scrolling while `locked` is true.
 *
 * The hook reference-counts locks across all mounted consumers, so
 * overlapping overlays (dialog over drawer) keep the body locked until the
 * last one unlocks — afterwards the hook restores the original `overflow`.
 *
 * @param locked - Whether this consumer holds a lock. Defaults to true.
 * @example
 * useBodyScrollLock(isOpen);
 */
export function useBodyScrollLock(locked = true): void {
  useEffect(() => {
    if (!locked) return;

    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        document.body.style.overflow = previousOverflow;
      }
    };
  }, [locked]);
}
