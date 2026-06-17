import * as React from "react";

import { cn } from "../../lib/utils";

/** Props for {@link LiquidGlass}. */
export type LiquidGlassProps = React.ComponentPropsWithoutRef<"div">;

/**
 * Glass surface with a looping liquid sheen drifting across the backdrop.
 *
 * Respects `prefers-reduced-motion`: the sheen stays still.
 *
 * @example
 * ```tsx
 * <LiquidGlass className="p-6">Content</LiquidGlass>
 * ```
 */
export const LiquidGlass = ({
  children,
  className,
  ref,
  ...props
}: LiquidGlassProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-md",
        className,
      )}
      ref={ref}
      {...props}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 motion-reduce:animate-none"
        style={{
          animation: "vllnt-liquid-shift 8s ease-in-out infinite",
          background:
            "linear-gradient(120deg, transparent, oklch(var(--primary) / 0.18), transparent, oklch(var(--accent) / 0.18), transparent)",
          backgroundSize: "200% 200%",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
LiquidGlass.displayName = "LiquidGlass";
