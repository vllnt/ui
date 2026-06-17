import * as React from "react";

import { cn } from "@vllnt/ui";

/** Props for {@link TextShimmer}. */
export type TextShimmerProps = React.ComponentPropsWithoutRef<"span"> & {
  /** Content rendered with the moving gradient fill. */
  children: React.ReactNode;
  /** Seconds for one gradient sweep. Defaults to `2`. */
  duration?: number;
};

/**
 * Text filled with a gradient that drifts across the glyphs on a loop.
 *
 * Respects `prefers-reduced-motion`: the gradient holds still.
 *
 * @example
 * ```tsx
 * <TextShimmer>Premium</TextShimmer>
 * ```
 */
export const TextShimmer = React.forwardRef<HTMLSpanElement, TextShimmerProps>(
  ({ children, className, duration = 2, style, ...props }, ref) => {
    return (
      <span
        className={cn(
          "inline-block animate-[vllnt-text-shimmer_linear_infinite] bg-clip-text text-transparent motion-reduce:animate-none",
          className,
        )}
        ref={ref}
        style={{
          animationDuration: `${duration}s`,
          background:
            "linear-gradient(90deg, oklch(var(--muted-foreground) / 0.5), oklch(var(--foreground)), oklch(var(--muted-foreground) / 0.5))",
          backgroundSize: "200% auto",
          ...style,
        }}
        {...props}
      >
        {children}
      </span>
    );
  },
);
TextShimmer.displayName = "TextShimmer";
