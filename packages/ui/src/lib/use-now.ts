"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Normalizes a `Date`, epoch milliseconds, or date string into a `Date`.
 *
 * @param input - The value to normalize
 * @returns A new `Date` instance — clones `Date` inputs
 */
export function normalizeDate(input: Date | number | string): Date {
  if (input instanceof Date) {
    return new Date(input.getTime());
  }

  return new Date(input);
}

/**
 * Options for {@link useNow}.
 */
export type UseNowOptions = {
  /** Fixed timestamp that disables ticking — for deterministic rendering. */
  now?: Date | number | string;
  /** Milliseconds between clock ticks while live. Defaults to 1000. */
  tickMs?: number;
};

/**
 * Returns the current time, re-rendering every `tickMs` milliseconds.
 *
 * Passing `now` pins the clock to a fixed timestamp and stops the interval —
 * the escape hatch tests and stories use for deterministic output.
 *
 * @param options - Optional fixed timestamp and tick interval
 * @returns The current (or pinned) time as a `Date`
 * @example
 * const liveNow = useNow({ now: fixedNow, tickMs: 1000 });
 */
export function useNow({ now, tickMs = 1000 }: UseNowOptions = {}): Date {
  const fixedNow = useMemo(() => (now ? normalizeDate(now) : undefined), [now]);
  const [liveNow, setLiveNow] = useState<Date>(() => new Date());

  useEffect(() => {
    if (fixedNow) return;

    const interval = window.setInterval(() => {
      setLiveNow(new Date());
    }, tickMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [fixedNow, tickMs]);

  return fixedNow ?? liveNow;
}
