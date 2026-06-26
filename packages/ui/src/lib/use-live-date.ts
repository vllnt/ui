"use client";

import * as React from "react";

import { normalizeDate } from "./format";

/**
 * Track a ticking clock. Returns a Date updated every `intervalMs`, or a fixed
 * Date derived from `now` when the caller passes one.
 */
export function useLiveDate(
  now: Date | number | string | undefined,
  intervalMs: number,
): Date {
  const fixedNow = React.useMemo(
    () => (now ? normalizeDate(now) : undefined),
    [now],
  );
  const [liveNow, setLiveNow] = React.useState<Date>(fixedNow ?? new Date());

  React.useEffect(() => {
    if (fixedNow) {
      setLiveNow(fixedNow);
      return;
    }

    const interval = window.setInterval(() => {
      setLiveNow(new Date());
    }, intervalMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [fixedNow, intervalMs]);

  return liveNow;
}
