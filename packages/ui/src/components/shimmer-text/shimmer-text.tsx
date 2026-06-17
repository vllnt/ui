import * as React from "react";

import { cn } from "../../lib/utils";

/** Props for {@link ShimmerText}. */
export type ShimmerTextProps = React.ComponentPropsWithoutRef<"span"> & {
  /** Content shown muted with a bright band passing across it. */
  children: React.ReactNode;
  /** Seconds for one light-band pass. Defaults to `3`. */
  duration?: number;
};

/**
 * Muted text with a brighter light band that sweeps across on a loop.
 *
 * Respects `prefers-reduced-motion`: the band holds still.
 *
 * @example
 * ```tsx
 * <ShimmerText>Loading your workspace</ShimmerText>
 * ```
 */
export const ShimmerText = React.forwardRef<HTMLSpanElement, ShimmerTextProps>(
  ({ children, className, duration = 3, style, ...props }, ref) => {
    return (
      <span
        className={cn("relative inline-block text-muted-foreground", className)}
        ref={ref}
        {...props}
      >
        {children}
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-[vllnt-text-shimmer_linear_infinite] bg-clip-text text-transparent motion-reduce:animate-none"
          style={{
            animationDuration: `${duration}s`,
            background:
              "linear-gradient(90deg, transparent 0%, oklch(var(--foreground)) 50%, transparent 100%)",
            backgroundSize: "200% auto",
            ...style,
          }}
        >
          {children}
        </span>
      </span>
    );
  },
);
ShimmerText.displayName = "ShimmerText";
