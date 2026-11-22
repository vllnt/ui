import * as React from "react";

import type { MaterialProps } from "../../../lib/material";
import { cn } from "../../../lib/utils";

/** Props for {@link GlassCard}. `material="solid"` opts out of glass. */
export type GlassCardProps = MaterialProps &
  React.ComponentPropsWithoutRef<"div">;

/**
 * Frosted-glass surface card: the glass material tokens (translucent tint, backdrop
 * blur, hairline border). Pass `material="solid"` for an opaque card.
 *
 * @example
 * ```tsx
 * <GlassCard>Content</GlassCard>
 * ```
 */
export const GlassCard = ({
  children,
  className,
  material = "glass",
  ref,
  ...props
}: GlassCardProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <div
      className={cn(
        "vllnt-glass vllnt-glass-dense rounded-xl border p-6 text-card-foreground",
        className,
      )}
      data-material={material}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
};
GlassCard.displayName = "GlassCard";
