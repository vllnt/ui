"use client";

import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../../lib/utils";

const progressBarTrackVariants = cva("overflow-hidden rounded-full bg-muted", {
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      lg: "h-3",
      md: "h-2",
      sm: "h-1",
    },
  },
});

const progressBarFillVariants = cva("h-full", {
  defaultVariants: {
    tone: "primary",
  },
  variants: {
    tone: {
      danger: "bg-destructive",
      info: "bg-info",
      neutral: "bg-muted-foreground",
      primary: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
    },
  },
});

const progressBarCompleteVariants = cva("", {
  defaultVariants: {
    tone: "primary",
  },
  variants: {
    tone: {
      danger: "border-destructive/50 bg-destructive/5",
      info: "border-info/50 bg-info/5",
      neutral: "border-border bg-muted/30",
      primary: "border-primary/50 bg-primary/5",
      success: "border-success/50 bg-success/5",
      warning: "border-warning/50 bg-warning/5",
    },
  },
});

/** Colour role of the fill. Matches the Penpot `Tone` axis. */
export type ProgressBarTone = NonNullable<
  VariantProps<typeof progressBarFillVariants>["tone"]
>;

/** Track height. Matches the Penpot `Size` axis. */
export type ProgressBarSize = NonNullable<
  VariantProps<typeof progressBarTrackVariants>["size"]
>;

/** Progress mode. Matches the Penpot `Mode` axis. */
export type ProgressBarMode = "determinate" | "indeterminate";

/** Props for the {@link ProgressBar} component. */
export type ProgressBarProps = {
  /**
   * Names the progressbar and overrides the visible label. Without it, the
   * visible label names the bar; with no label rendered, the name falls back
   * to `"Progress"`.
   */
  "aria-label"?: string;
  className?: string;
  completedLabel?: string;
  currentLabel?: string;
  /** Marks the task done. Ends `indeterminate` mode and tints the card. */
  isComplete?: boolean;
  /** Shows a skeleton header and an empty bar, and omits `aria-valuenow`. */
  isLoading?: boolean;
  /** Visible label in the header row. Takes priority over `currentLabel`. */
  label?: React.ReactNode;
  max: number;
  /**
   * `"indeterminate"` shows an animated bar and omits `aria-valuenow`, the
   * way ARIA reports an unknown value. The bar then ignores `value` and
   * `max`. Defaults to `"determinate"`.
   */
  mode?: ProgressBarMode;
  showLabels?: boolean;
  /** Shows the percentage as the value text when `valueLabel` is absent. */
  showValue?: boolean;
  /** Track height. Defaults to `"md"`. */
  size?: ProgressBarSize;
  /**
   * Colour role of the fill. Defaults to `"primary"`, or `"success"` for a
   * complete task.
   */
  tone?: ProgressBarTone;
  value: number;
  /** Value text in the header row, for example a step label such as `3 / 8`. */
  valueLabel?: React.ReactNode;
};

type ProgressBarHeaderProps = Pick<
  ProgressBarProps,
  "completedLabel" | "max" | "showValue" | "value" | "valueLabel"
> & {
  isIndeterminate: boolean;
  isLoading: boolean;
  label: React.ReactNode;
  labelId: string;
  percent: number;
};

function renderValueText({
  completedLabel,
  isIndeterminate,
  max,
  percent,
  showValue,
  value,
  valueLabel,
}: ProgressBarHeaderProps): React.ReactNode {
  if (valueLabel !== undefined) {
    return valueLabel;
  }
  if (isIndeterminate) {
    return null;
  }
  if (showValue) {
    return `${percent}%`;
  }
  return (
    <>
      {value} / {max} {completedLabel ?? ""}
    </>
  );
}

function ProgressBarHeader(props: ProgressBarHeaderProps): React.ReactNode {
  return (
    <div className="flex items-center justify-between mb-2 h-5">
      {props.isLoading ? (
        <>
          <span className="h-5 w-16 bg-muted rounded animate-pulse motion-reduce:animate-none" />
          <span className="h-5 w-24 bg-muted rounded animate-pulse motion-reduce:animate-none" />
        </>
      ) : (
        <>
          <span className="text-sm font-medium leading-5" id={props.labelId}>
            {props.label}
          </span>
          <span className="text-sm text-muted-foreground leading-5">
            {renderValueText(props)}
          </span>
        </>
      )}
    </div>
  );
}

type ProgressBarTrackProps = Pick<
  ProgressBarProps,
  "max" | "size" | "value"
> & {
  ariaLabel?: string;
  isIndeterminate: boolean;
  isLoading: boolean;
  labelledBy?: string;
  percent: number;
  tone: ProgressBarTone;
};

function ProgressBarTrack({
  ariaLabel,
  isIndeterminate,
  isLoading,
  labelledBy,
  max,
  percent,
  size,
  tone,
  value,
}: ProgressBarTrackProps): React.ReactNode {
  const isValueKnown = !isLoading && !isIndeterminate;

  return (
    <div
      aria-label={labelledBy ? undefined : (ariaLabel ?? "Progress")}
      aria-labelledby={labelledBy}
      aria-valuemax={max}
      aria-valuemin={0}
      aria-valuenow={isValueKnown ? value : undefined}
      className={progressBarTrackVariants({ size })}
      role="progressbar"
    >
      <div
        className={cn(
          progressBarFillVariants({ tone }),
          isIndeterminate
            ? "w-full animate-shimmer motion-reduce:w-1/3 motion-reduce:animate-none"
            : "transition-all duration-300",
          isLoading && "w-0",
        )}
        style={isValueKnown ? { width: `${percent}%` } : undefined}
      />
    </div>
  );
}

/**
 * Progress bar with an optional header row (label and value text), tone and
 * size variants, and an indeterminate mode. The track carries
 * `role="progressbar"`.
 *
 * @example
 * ```tsx
 * <ProgressBar label="Step" max={8} value={3} valueLabel="3 / 8" />
 * ```
 */
const ProgressBar = ({
  "aria-label": ariaLabel,
  className,
  completedLabel,
  currentLabel,
  isComplete = false,
  isLoading = false,
  label,
  max,
  mode = "determinate",
  ref,
  showLabels = true,
  showValue = false,
  size,
  tone,
  value,
  valueLabel,
}: ProgressBarProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const labelId = React.useId();
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;
  const isIndeterminate = mode === "indeterminate" && !isLoading && !isComplete;
  const resolvedTone = tone ?? (isComplete ? "success" : "primary");
  const labelledBy =
    showLabels && !isLoading && ariaLabel === undefined ? labelId : undefined;

  return (
    <div
      className={cn(
        "border rounded-lg p-4 transition-colors",
        !isLoading && isComplete
          ? progressBarCompleteVariants({ tone: resolvedTone })
          : "border-border bg-muted/30",
        className,
      )}
      ref={ref}
    >
      {showLabels ? (
        <ProgressBarHeader
          completedLabel={completedLabel}
          isIndeterminate={isIndeterminate}
          isLoading={isLoading}
          label={
            label ?? currentLabel ?? (isComplete ? "Complete" : "Progress")
          }
          labelId={labelId}
          max={max}
          percent={percent}
          showValue={showValue}
          value={value}
          valueLabel={valueLabel}
        />
      ) : null}
      <ProgressBarTrack
        ariaLabel={ariaLabel}
        isIndeterminate={isIndeterminate}
        isLoading={isLoading}
        labelledBy={labelledBy}
        max={max}
        percent={percent}
        size={size}
        tone={resolvedTone}
        value={value}
      />
    </div>
  );
};
ProgressBar.displayName = "ProgressBar";

export { ProgressBar };
