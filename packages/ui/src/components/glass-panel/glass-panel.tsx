import { cn } from "../../lib/utils";
export type GlassPanelProps = React.ComponentPropsWithoutRef<"div">;

const GlassPanel = ({
  children,
  className,
  ref,
  ...props
}: GlassPanelProps & React.RefAttributes<HTMLDivElement>) => (
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
);

GlassPanel.displayName = "GlassPanel";
export { GlassPanel };
