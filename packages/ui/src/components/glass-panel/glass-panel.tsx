import { forwardRef } from "react";

import { cn } from "../../lib/utils";

export type GlassPanelProps = React.ComponentPropsWithoutRef<"div">;

const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ children, className, ...props }, ref) => (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-background/70 shadow-[0_12px_40px_hsl(var(--foreground)/0.08)] backdrop-blur-xl",
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  ),
);

GlassPanel.displayName = "GlassPanel";

export { GlassPanel };
