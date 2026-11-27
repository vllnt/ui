"use client";

import * as React from "react";

import { renderElement } from "@ui-sdk/react/primitive";
import {
  Progress as ProgressPrimitive,
  ProgressIndicator,
} from "@ui-sdk/react/progress";

import { named } from "../../../lib/named";
import { withDataAttributes } from "../../../lib/ui-sdk";
import { cn } from "../../../lib/utils";
import { cva, type VariantProps } from "../../../lib/variants";

const progressBarTrackVariants = cva(
  "overflow-hidden rounded-full bg-secondary",
  {
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
  },
);

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

/** Cells in a block-style track. Each one stands for 10% of the range. */
const BLOCKS = Array.from({ length: 10 }, (_, index) => index + 1);

/**
 * Blocks that `value / max` fills. It floors the raw ratio instead of the
 * rounded percentage, so 999 of 1000 fills nine blocks and a complete task
 * fills all ten. The result stays between zero and the block count.
 */
function countFilledBlocks(value: number, max: number): number {
  if (max <= 0) {
    return 0;
  }
  const filled = Math.floor((value * BLOCKS.length) / max);
  return Math.min(Math.max(filled, 0), BLOCKS.length);
}

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
  /**
   * Draws the track as ten equal blocks. One block fills for each whole 10%
   * of `value / max`, so a full row means the task reached 100%.
   * `aria-valuenow` still reports the exact value. An `indeterminate` bar
   * keeps its continuous animation, and a loading bar shows ten empty blocks.
   */
  blocks?: boolean;
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
          <span className="h-5 w-16 bg-secondary rounded animate-pulse motion-reduce:animate-none" />
          <span className="h-5 w-24 bg-secondary rounded animate-pulse motion-reduce:animate-none" />
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
  "blocks" | "max" | "size" | "value"
> & {
  ariaLabel?: string;
  isIndeterminate: boolean;
  isLoading: boolean;
  labelledBy?: string;
  percent: number;
  tone: ProgressBarTone;
};

type FillProps = { style?: React.CSSProperties } & Record<string, unknown>;

/**
 * Renders the fill with the rounded percentage the header reads, where ui-sdk
 * writes the exact one.
 */
function renderFill(percent: number) {
  return (props: FillProps, state: object) =>
    renderElement(
      "div",
      { ...props, style: { ...props.style, width: `${percent}%` } },
      undefined,
      state,
    );
}

function ProgressBarTrack({
  ariaLabel,
  blocks,
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
  const showBlocks = blocks === true && !isIndeterminate;
  const filledBlocks = isValueKnown ? countFilledBlocks(value, max) : 0;

  return (
    <ProgressPrimitive
      aria-label={labelledBy ? undefined : (ariaLabel ?? "Progress")}
      className={cn(
        progressBarTrackVariants({ size }),
        showBlocks && "flex gap-0.5 bg-transparent",
      )}
      max={max}
      min={0}
      // Names the bar from the header label (or `aria-label`) and reports the
      // plain value, where ui-sdk would link a label part and read a percent.
      render={withDataAttributes("div", () => ({
        "aria-labelledby": labelledBy,
        "aria-valuetext": undefined,
      }))}
      value={isValueKnown ? value : null}
    >
      {showBlocks ? (
        BLOCKS.map((block) => (
          <div
            className={cn(
              "h-full flex-1 transition-colors duration-300 motion-reduce:transition-none",
              block <= filledBlocks
                ? progressBarFillVariants({ tone })
                : "bg-muted",
            )}
            key={block}
          />
        ))
      ) : (
        <ProgressIndicator
          className={cn(
            progressBarFillVariants({ tone }),
            isIndeterminate
              ? "w-full animate-shimmer motion-reduce:w-1/3 motion-reduce:animate-none"
              : "transition-all duration-300 motion-reduce:transition-none",
            isLoading && "w-0",
          )}
          render={isValueKnown ? renderFill(percent) : undefined}
        />
      )}
    </ProgressPrimitive>
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
const ProgressBar = /* @__PURE__ */ named(
  "ProgressBar",
  ({
    "aria-label": ariaLabel,
    blocks,
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
    const isIndeterminate =
      mode === "indeterminate" && !isLoading && !isComplete;
    const resolvedTone = tone ?? (isComplete ? "success" : "primary");
    const labelledBy =
      showLabels && !isLoading && ariaLabel === undefined ? labelId : undefined;

    return (
      <div
        className={cn(
          "border rounded-lg p-4 transition-colors motion-reduce:transition-none",
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
          blocks={blocks}
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
  },
);

export { ProgressBar };
