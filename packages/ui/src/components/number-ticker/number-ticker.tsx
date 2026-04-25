"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

export type NumberTickerProps = React.ComponentPropsWithoutRef<"span"> & {
  delay?: number;
  duration?: number;
  formatOptions?: Intl.NumberFormatOptions;
  from?: number;
  locale?: string;
  value: number;
};

export const NumberTicker = React.forwardRef<
  HTMLSpanElement,
  NumberTickerProps
>(
  (
    {
      className,
      delay = 0,
      duration = 1.2,
      formatOptions,
      from = 0,
      locale,
      value,
      ...props
    },
    ref,
  ) => {
    const [currentValue, setCurrentValue] = React.useState(from);

    React.useEffect(() => {
      const reducedMotion =
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reducedMotion || duration <= 0) {
        setCurrentValue(value);
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
    }, [delay, duration, from, value]);

    const formatter = React.useMemo(
      () => new Intl.NumberFormat(locale, formatOptions),
      [formatOptions, locale],
    );

    return (
      <span
        className={cn("tabular-nums tracking-tight", className)}
        ref={ref}
        {...props}
      >
        {formatter.format(currentValue)}
      </span>
    );
  },
);

NumberTicker.displayName = "NumberTicker";
