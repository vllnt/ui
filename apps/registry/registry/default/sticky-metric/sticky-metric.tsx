"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@vllnt/ui";

/**
 * Tone of the metric — drives the dot color.
 *
 * @public
 */
export type StickyMetricTone = "danger" | "neutral" | "success" | "warn";

/**
 * Anchor corner relative to the canvas object the metric sticks to.
 *
 * @public
 */
export type StickyMetricAnchor =
  | "bottom-left"
  | "bottom-right"
  | "top-left"
  | "top-right";

const TONE_DOT: Record<StickyMetricTone, string> = {
  danger: "bg-red-500",
  neutral: "bg-muted-foreground",
  success: "bg-emerald-500",
  warn: "bg-amber-500",
};

const ANCHOR_OFFSET: Record<StickyMetricAnchor, { transform: string }> = {
  "bottom-left": { transform: "translate(-100%, 100%)" },
  "bottom-right": { transform: "translate(0%, 100%)" },
  "top-left": { transform: "translate(-100%, -100%)" },
  "top-right": { transform: "translate(0%, -100%)" },
};

/**
 * Localizable strings.
 *
 * @public
 */
export type StickyMetricLabels = {
  /** Aria-label override. Defaults to `"Sticky metric"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Sticky metric",
} as const satisfies Required<StickyMetricLabels>;

/**
 * Props for {@link StickyMetric}.
 *
 * @public
 */
export type StickyMetricProps = {
  /** Anchor corner. Defaults to `"top-right"`. */
  anchor?: StickyMetricAnchor;
  /** Optional secondary slot rendered after the value (delta, unit). */
  detail?: ReactNode;
  /** Short metric label (e.g. `"errs/min"`). */
  label: ReactNode;
  /** Localizable strings. */
  labels?: StickyMetricLabels;
  /** Tone for the leading dot. Defaults to `"neutral"`. */
  tone?: StickyMetricTone;
  /** Display value (already formatted by host). */
  value: ReactNode;
  /** Anchor X in canvas pixels. */
  x: number;
  /** Anchor Y in canvas pixels. */
  y: number;
} & ComponentPropsWithoutRef<"div">;

/**
 * Pinned metric pill that sticks to a canvas object's corner. Use to
 * overlay a single live value (errors / min, p95 latency, queue depth)
 * on a runtime object without consuming card real-estate. Pure
 * presentation; the host computes the anchor coords from the object's
 * bounding box and the value from the runtime stream.
 *
 * The wrapper is `pointer-events: none` — host gestures pass through.
 *
 * @example
 * ```tsx
 * <div className="relative h-screen w-screen">
 *   <Canvas />
 *   <StickyMetric
 *     x={420} y={180}
 *     anchor="top-right"
 *     label="errs / min"
 *     value="14"
 *     tone="danger"
 *   />
 * </div>
 * ```
 *
 * @public
 */
export const StickyMetric = (
  props: StickyMetricProps & React.RefAttributes<HTMLDivElement>,
) => {
  const {
    anchor = "top-right",
    className,
    detail,
    label,
    labels,
    ref,
    tone = "neutral",
    value,
    x,
    y,
    ...rest
  } = props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  return (
    <div
      aria-label={resolvedLabels.region}
      className={cn(
        "pointer-events-none absolute z-20 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/90 px-2 py-1 text-[11px] shadow-sm backdrop-blur",
        className,
      )}
      data-sticky-anchor={anchor}
      data-sticky-metric
      data-sticky-tone={tone}
      ref={ref}
      role="status"
      style={{
        left: x,
        top: y,
        transform: ANCHOR_OFFSET[anchor].transform,
      }}
      {...rest}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", TONE_DOT[tone])}
        data-sticky-metric-dot
      />
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
      {detail ? (
        <span
          className="text-[10px] text-muted-foreground"
          data-sticky-metric-detail
        >
          {detail}
        </span>
      ) : null}
    </div>
  );
};
StickyMetric.displayName = "StickyMetric";
