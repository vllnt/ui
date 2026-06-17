import * as React from "react";

import { cn } from "../../lib/utils";

/** Props for {@link ShineBorder}. */
export type ShineBorderProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Border thickness in pixels. Defaults to `1`. */
  borderWidth?: number;
  /** Seconds for one full revolution of the lit border. Defaults to `8`. */
  duration?: number;
};

/**
 * Wrapper that lights its full perimeter with a revolving gradient border.
 *
 * Respects `prefers-reduced-motion`: the lit border stays still.
 *
 * @example
 * ```tsx
 * <ShineBorder className="rounded-xl bg-card p-6">Featured</ShineBorder>
 * ```
 */
export const ShineBorder = React.forwardRef<HTMLDivElement, ShineBorderProps>(
  ({ borderWidth = 1, children, className, duration = 8, ...props }, ref) => {
    const borderStyle: React.CSSProperties = {
      animationDuration: `${duration}s`,
      animationIterationCount: "infinite",
      animationName: "vllnt-border-beam-angle",
      animationTimingFunction: "linear",
      background:
        "conic-gradient(from var(--vllnt-border-beam-angle, 90deg), oklch(var(--primary) / 0.8), oklch(var(--ring) / 0.3), oklch(var(--primary) / 0.8))",
      mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
      maskComposite: "exclude",
      padding: `${borderWidth}px`,
      WebkitMask:
        "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
      WebkitMaskComposite: "xor",
    };

    return (
      <div className={cn("relative", className)} ref={ref} {...props}>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] motion-reduce:animate-none"
          style={borderStyle}
        />
        {children}
      </div>
    );
  },
);
ShineBorder.displayName = "ShineBorder";
