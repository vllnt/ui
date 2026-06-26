import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@vllnt/ui";

const meterFillVariants = cva("h-full transition-all", {
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      default: "bg-primary",
      destructive: "bg-destructive",
      secondary: "bg-secondary-foreground",
    },
  },
});

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Props for the {@link Meter} component. */
export type MeterProps = {
  /** Accessible label naming the measured quantity. */
  label?: string;
  /** Upper bound of the measured range. Defaults to `100`. */
  max?: number;
  /** Lower bound of the measured range. Defaults to `0`. */
  min?: number;
  /** Split the bar into this number of discrete blocks instead of a solid fill. */
  segments?: number;
  /** Current measured value (clamped to `min`/`max`). */
  value: number;
  /** Human-readable description of the current value (`aria-valuetext`). */
  valueText?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children"> &
  VariantProps<typeof meterFillVariants>;

/**
 * Static measurement bar for a known range (disk usage, score, capacity).
 * Uses `role="meter"` — distinct from a progress bar, which reports task
 * completion over time.
 * @example
 * <Meter label="Disk usage" value={72} valueText="72% used" />
 */
const Meter = ({
  className,
  label,
  max = 100,
  min = 0,
  ref,
  segments,
  value,
  valueText,
  variant,
  ...props
}: MeterProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const safeMax = max > min ? max : min + 1;
  const current = clamp(value, min, safeMax);
  const ratio = (current - min) / (safeMax - min);
  const percentage = ratio * 100;
  const segmentCount = segments !== undefined && segments > 0 ? segments : 0;
  const filledSegments = Math.round(ratio * segmentCount);

  return (
    <div
      aria-label={label}
      aria-valuemax={safeMax}
      aria-valuemin={min}
      aria-valuenow={current}
      aria-valuetext={valueText}
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-muted",
        segmentCount > 0 && "flex gap-0.5 bg-transparent",
        className,
      )}
      ref={ref}
      role="meter"
      {...props}
    >
      {segmentCount > 0 ? (
        Array.from({ length: segmentCount }, (_cell, index) => (
          <div
            className={cn(
              "h-full flex-1 rounded-full",
              index < filledSegments
                ? meterFillVariants({ variant })
                : "bg-muted",
            )}
            key={`meter-segment-${index}`}
          />
        ))
      ) : (
        <div
          className={meterFillVariants({ variant })}
          style={{ width: `${percentage}%` }}
        />
      )}
    </div>
  );
};
Meter.displayName = "Meter";

export { Meter, meterFillVariants };
