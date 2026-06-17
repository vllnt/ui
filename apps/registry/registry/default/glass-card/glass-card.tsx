import * as React from "react";

import { cn } from "@vllnt/ui";

/** Props for {@link GlassCard}. */
export type GlassCardProps = React.ComponentPropsWithoutRef<"div">;

/**
 * Frosted-glass surface card with a translucent background and backdrop blur.
 *
 * @example
 * ```tsx
 * <GlassCard>Content</GlassCard>
 * ```
 */
export const GlassCard = ({
  children,
  className,
  ref,
  ...props
}: GlassCardProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-card/60 p-6 text-card-foreground shadow-lg backdrop-blur-md",
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
};
GlassCard.displayName = "GlassCard";
