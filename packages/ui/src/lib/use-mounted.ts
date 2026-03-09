"use client";

import { useSyncExternalStore } from "react";

function noop(): void {
  /* intentional no-op for useSyncExternalStore */
}

function subscribe(): () => void {
  return noop;
}

/**
 * Returns `true` on the client after hydration, `false` during SSR.
 * Uses `useSyncExternalStore` to avoid synchronous setState in effects.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
