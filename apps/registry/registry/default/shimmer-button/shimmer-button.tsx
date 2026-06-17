"use client";

import * as React from "react";

import { cn } from "@vllnt/ui";

/** Props for {@link ShimmerButton}. */
export type ShimmerButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  /** Seconds for one shimmer sweep across the button. Defaults to `2`. */
  shimmerDuration?: number;
};

/**
 * Button with a light sheen that sweeps across its surface on a loop.
 *
 * Respects `prefers-reduced-motion`: the sheen stays parked off-screen.
 *
 * @example
 * ```tsx
 * <ShimmerButton>Get started</ShimmerButton>
 * ```
 */
export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(({ children, className, shimmerDuration = 2, ...props }, ref) => {
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      ref={ref}
      type="button"
      {...props}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full animate-shimmer motion-reduce:animate-none"
        style={{
          animationDuration: `${shimmerDuration}s`,
          background:
            "linear-gradient(90deg, transparent, oklch(var(--primary-foreground) / 0.4), transparent)",
        }}
      />
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
    </button>
  );
});
ShimmerButton.displayName = "ShimmerButton";
