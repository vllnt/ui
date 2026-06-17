import * as React from "react";

import { cn } from "../../lib/utils";

/** Props for {@link ShinyButton}. */
export type ShinyButtonProps = React.ComponentPropsWithoutRef<"button">;

/**
 * Secondary button with a slow sheen drifting across its surface on a loop.
 *
 * Respects `prefers-reduced-motion`: the sheen stays parked off-screen.
 *
 * @example
 * ```tsx
 * <ShinyButton>Learn more</ShinyButton>
 * ```
 */
export const ShinyButton = React.forwardRef<
  HTMLButtonElement,
  ShinyButtonProps
>(({ children, className, ...props }, ref) => {
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
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
          animationDuration: "3s",
          background:
            "linear-gradient(90deg, transparent, oklch(var(--foreground) / 0.15), transparent)",
        }}
      />
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
    </button>
  );
});
ShinyButton.displayName = "ShinyButton";
