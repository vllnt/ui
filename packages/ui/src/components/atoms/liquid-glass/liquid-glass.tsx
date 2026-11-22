import * as React from "react";

import type { MaterialProps } from "../../../lib/material";
import { cn } from "../../../lib/utils";

/** Props for {@link LiquidGlass}. `material="solid"` opts out of glass. */
export type LiquidGlassProps = MaterialProps &
  React.ComponentPropsWithoutRef<"div">;

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
  material = "glass",
  ref,
  ...props
}: LiquidGlassProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <div
      className={cn(
        "vllnt-glass vllnt-glass-dense relative overflow-hidden rounded-xl border",
        className,
      )}
      data-material={material}
      ref={ref}
      {...props}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [animation:vllnt-liquid-shift_8s_ease-in-out_infinite] motion-reduce:animate-none"
        style={{
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
