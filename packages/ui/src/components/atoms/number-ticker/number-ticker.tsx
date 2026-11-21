"use client";

import * as React from "react";

import { cn } from "../../../lib/utils";

export type NumberTickerProps = React.ComponentPropsWithoutRef<"span"> & {
  delay?: number;
  duration?: number;
  formatOptions?: Intl.NumberFormatOptions;
  from?: number;
  locale?: string;
  value: number;
};

const NUMBER_FORMATTER_CACHE = new Map<string, Intl.NumberFormat>();
function getNumberTickerFormatter(
  locale: string | undefined,
  formatOptions: Intl.NumberFormatOptions | undefined,
): Intl.NumberFormat {
  const key = `${locale ?? ""}|${formatOptions ? JSON.stringify(formatOptions) : ""}`;
  let formatter = NUMBER_FORMATTER_CACHE.get(key);
  if (!formatter) {
    formatter = Intl.NumberFormat(locale, formatOptions);
    NUMBER_FORMATTER_CACHE.set(key, formatter);
  }
  return formatter;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void): () => void {
  const query =
    typeof window.matchMedia === "function"
      ? window.matchMedia(REDUCED_MOTION_QUERY)
      : undefined;
  query?.addEventListener("change", onChange);
  return () => {
    query?.removeEventListener("change", onChange);
  };
}

function getReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

/** Whether the user asks for reduced motion; `false` on the server. */
function usePrefersReducedMotion(): boolean {
  return React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );
}

export const NumberTicker = ({
  className,
  delay = 0,
  duration = 1.2,
  formatOptions,
  from = 0,
  locale,
  ref,
  value,
  ...props
}: NumberTickerProps & { ref?: React.Ref<HTMLSpanElement> }) => {
  const [currentValue, setCurrentValue] = React.useState(() => from);
  const skipAnimation = usePrefersReducedMotion() || duration <= 0;

  React.useEffect(() => {
    if (skipAnimation) {
      return;
    }

    let animationFrame = 0;
    let timeoutId = 0;
    const startDelay = Math.max(0, delay * 1000);
    const durationMs = duration * 1000;

    timeoutId = window.setTimeout(() => {
      const startTime = performance.now();

      const tick = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const nextValue = from + (value - from) * progress;

        setCurrentValue(nextValue);

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(tick);
        }
      };

      animationFrame = window.requestAnimationFrame(tick);
    }, startDelay);

    return () => {
      window.clearTimeout(timeoutId);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [delay, duration, from, skipAnimation, value]);

  const formatter = getNumberTickerFormatter(locale, formatOptions);

  return (
    <span
      className={cn("tabular-nums tracking-tight", className)}
      ref={ref}
      {...props}
    >
      {formatter.format(skipAnimation ? value : currentValue)}
    </span>
  );
};

NumberTicker.displayName = "NumberTicker";
