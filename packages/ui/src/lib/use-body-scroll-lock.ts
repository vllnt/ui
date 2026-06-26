"use client";

import { useEffect } from "react";

let lockCount = 0;
let previousOverflow = "";

function lockBodyScroll(): void {
  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;
}

function unlockBodyScroll(): void {
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount === 0) {
    document.body.style.overflow = previousOverflow;
  }
}

/**
 * Lock body scroll while `active` is true. Reference-counted: each open overlay
 * holds the lock, and scrolling returns once the last overlay unlocks. Closing
 * one overlay no longer frees scroll for the others.
 */
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [active]);
}
