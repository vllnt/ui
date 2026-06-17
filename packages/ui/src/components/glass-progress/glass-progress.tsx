import * as React from "react";

import { cn } from "../../lib/utils";

/** Props for {@link GlassProgress}. */
export type GlassProgressProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Completion percentage between `0` and `100`. */
  value: number;
};

function clampPercent(value: number): number {
  return Math.min(Math.max(value, 0), 100);
}

/**
 * Glass-styled progress bar with a translucent track and a solid fill.
 *
 * @example
 * ```tsx
 * <GlassProgress value={60} />
 * ```
 */
export const GlassProgress = ({
  className,
  ref,
  value,
  ...props
}: GlassProgressProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const clamped = clampPercent(value);

  return (
    <div
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={clamped}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full border border-border/50 bg-muted/40 backdrop-blur",
        className,
      )}
      ref={ref}
      role="progressbar"
      {...props}
    >
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};
GlassProgress.displayName = "GlassProgress";
