"use client";

import { Meter as MeterPrimitive, MeterIndicator } from "@ui-sdk/react/meter";

import { named } from "../../../lib/named";
import { withDataAttributes } from "../../../lib/ui-sdk";
import { cn } from "../../../lib/utils";
import { cva, type VariantProps } from "../../../lib/variants";

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
const Meter = /* @__PURE__ */ named(
  "Meter",
  ({
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
    const segmentCount = segments !== undefined && segments > 0 ? segments : 0;
    const ratio = (clamp(value, min, safeMax) - min) / (safeMax - min);
    const filledSegments = Math.round(ratio * segmentCount);

    return (
      <MeterPrimitive
        aria-label={label}
        className={cn(
          "h-2 w-full overflow-hidden rounded-full bg-secondary",
          segmentCount > 0 && "flex gap-0.5 bg-transparent",
          className,
        )}
        max={safeMax}
        min={min}
        ref={ref}
        // Drops the default link to a label part and the percent value text:
        // `label` names the meter and `valueText` describes its value.
        render={withDataAttributes("div", () => ({
          "aria-labelledby": undefined,
          "aria-valuetext": valueText,
        }))}
        value={value}
        {...props}
      >
        {segmentCount > 0 ? (
          Array.from({ length: segmentCount }, (_cell, index) => (
            <div
              className={cn(
                "h-full flex-1 rounded-full",
                index < filledSegments
                  ? meterFillVariants({ variant })
                  : "bg-secondary",
              )}
              key={`meter-segment-${index}`}
            />
          ))
        ) : (
          <MeterIndicator className={meterFillVariants({ variant })} />
        )}
      </MeterPrimitive>
    );
  },
);

export { Meter, meterFillVariants };
