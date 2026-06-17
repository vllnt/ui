"use client";

import * as React from "react";

import { cn } from "@vllnt/ui";

/** Props for {@link Sparkles}. */
export type SparklesProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Count of twinkling sparkle squares to scatter. Defaults to `20`. */
  count?: number;
};

type Sparkle = {
  delay: number;
  duration: number;
  left: number;
  size: number;
  top: number;
};

function createSparkles(count: number): Sparkle[] {
  return Array.from({ length: count }, () => ({
    delay: Math.random() * 2,
    duration: 1 + Math.random() * 1.5,
    left: Math.random() * 100,
    size: 4 + Math.random() * 8,
    top: Math.random() * 100,
  }));
}

/**
 * Decorative field of twinkling sparkles layered behind optional content.
 *
 * Respects `prefers-reduced-motion`: the sparkles hold still.
 *
 * @example
 * ```tsx
 * <Sparkles count={30}>
 *   <h1>Magic</h1>
 * </Sparkles>
 * ```
 */
export const Sparkles = React.forwardRef<HTMLDivElement, SparklesProps>(
  ({ children, className, count = 20, ...props }, ref) => {
    const [sparkles] = React.useState(() => createSparkles(count));

    return (
      <div className={cn("relative", className)} ref={ref} {...props}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {sparkles.map((sparkle, index) => (
            <span
              className="absolute rotate-45 rounded-[1px] bg-foreground motion-reduce:animate-none"
              key={index}
              style={{
                animation: `vllnt-sparkle ${sparkle.duration}s linear infinite`,
                animationDelay: `${sparkle.delay}s`,
                height: `${sparkle.size}px`,
                left: `${sparkle.left}%`,
                top: `${sparkle.top}%`,
                width: `${sparkle.size}px`,
              }}
            />
          ))}
        </div>
        {children ? <div className="relative">{children}</div> : null}
      </div>
    );
  },
);
Sparkles.displayName = "Sparkles";
