import { forwardRef } from "react";

import { cn } from "../../lib/utils";

export type EdgeLabelProps = React.ComponentPropsWithoutRef<"span"> & {
  emphasis?: "active" | "subtle";
};

const emphasisClasses: Record<
  NonNullable<EdgeLabelProps["emphasis"]>,
  string
> = {
  active: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  subtle: "border-border/60 bg-background/90 text-muted-foreground",
};

const EdgeLabel = forwardRef<HTMLSpanElement, EdgeLabelProps>(
  ({ className, emphasis = "subtle", ...props }, ref) => (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] shadow-sm",
        emphasisClasses[emphasis],
        className,
      )}
      data-emphasis={emphasis}
      ref={ref}
      {...props}
    />
  ),
);

EdgeLabel.displayName = "EdgeLabel";

export { EdgeLabel };
