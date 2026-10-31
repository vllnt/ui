"use client";

import { useCallback, useInsertionEffect, useRef } from "react";

/**
 * Returns a stable function that always calls the latest `callback`.
 *
 * Stand-in for React 19.2's `useEffectEvent` so the package keeps working on
 * React 19.0 and 19.1. Call the result from effects and event listeners, never
 * during render. The ref updates in an insertion effect, so it is current
 * before any layout effect or event handler runs.
 *
 * @param callback - the latest closure to call.
 * @returns a callback whose identity never changes.
 */
export function useEventCallback<Arguments extends unknown[], Result>(
  callback: (...arguments_: Arguments) => Result,
): (...arguments_: Arguments) => Result {
  const reference = useRef(callback);

  useInsertionEffect(() => {
    reference.current = callback;
  });

  return useCallback(
    (...arguments_: Arguments) => reference.current(...arguments_),
    [],
  );
}
