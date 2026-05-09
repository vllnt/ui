"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

import { cn } from "../../lib/utils";

/**
 * Tone of the active arc — drives its stroke color.
 *
 * @public
 */
export type ThresholdRingTone = "danger" | "neutral" | "success" | "warn";

const TONE_STROKE: Record<ThresholdRingTone, string> = {
  danger: "stroke-red-500",
  neutral: "stroke-foreground",
  success: "stroke-emerald-500",
  warn: "stroke-amber-500",
};

/**
 * Localizable strings.
 *
 * @public
 */
export type ThresholdRingLabels = {
  /** Aria-label override. Defaults to `"Threshold ring"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Threshold ring",
} as const satisfies Required<ThresholdRingLabels>;

/**
 * Props for {@link ThresholdRing}.
 *
 * @public
 */
export type ThresholdRingProps = {
  /** Optional center label (formatted by host — e.g. `"82%"`). */
  centerLabel?: ReactNode;
  /** Localizable strings. */
  labels?: ThresholdRingLabels;
  /** Upper bound of the ring's value range. Defaults to `1`. */
  max?: number;
  /** Outer diameter in pixels. Defaults to `64`. */
  size?: number;
  /** Stroke width in pixels. Defaults to `6`. */
  stroke?: number;
  /** Optional threshold marker `0..max` rendered as a small notch. */
  threshold?: number;
  /** Tone of the active arc. Defaults to `"neutral"`. */
  tone?: ThresholdRingTone;
  /** Current value `0..max`. */
  value: number;
} & ComponentPropsWithoutRef<"svg">;

const clamp = (v: number, min: number, max: number): number => {
  if (v < min) {
    return min;
  }
  if (v > max) {
    return max;
  }
  return v;
};

const polar = (input: {
  angle: number;
  cx: number;
  cy: number;
  r: number;
}): { x: number; y: number } => {
  const rad = (input.angle - 90) * (Math.PI / 180);
  return {
    x: input.cx + input.r * Math.cos(rad),
    y: input.cy + input.r * Math.sin(rad),
  };
};

type Geometry = {
  circumference: number;
  cx: number;
  cy: number;
  r: number;
  ratio: number;
  size: number;
  stroke: number;
  tickAngle: null | number;
};

const computeGeometry = (input: {
  max: number;
  size: number;
  stroke: number;
  threshold?: number;
  value: number;
}): Geometry => {
  const safeMax = input.max <= 0 ? 1 : input.max;
  const ratio = clamp(input.value / safeMax, 0, 1);
  const cx = input.size / 2;
  const cy = input.size / 2;
  const r = (input.size - input.stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const tickAngle =
    input.threshold === undefined
      ? null
      : clamp(input.threshold / safeMax, 0, 1) * 360;
  return {
    circumference,
    cx,
    cy,
    r,
    ratio,
    size: input.size,
    stroke: input.stroke,
    tickAngle,
  };
};

const Tick = (props: { geom: Geometry }): null | React.ReactElement => {
  const { geom } = props;
  if (geom.tickAngle === null) {
    return null;
  }
  const inner = polar({
    angle: geom.tickAngle,
    cx: geom.cx,
    cy: geom.cy,
    r: geom.r - geom.stroke / 2,
  });
  const outer = polar({
    angle: geom.tickAngle,
    cx: geom.cx,
    cy: geom.cy,
    r: geom.r + geom.stroke / 2,
  });
  return (
    <line
      className="stroke-foreground/80"
      data-threshold-ring-tick
      strokeLinecap="round"
      strokeWidth={2}
      x1={inner.x}
      x2={outer.x}
      y1={inner.y}
      y2={outer.y}
    />
  );
};

/**
 * Compact ring gauge expressing how close a value is to a threshold.
 * Pure presentation; the host supplies the value, threshold, and tone.
 * Use to overlay budget / quota / SLA indicators on canvas objects
 * without consuming card real-estate.
 *
 * Distinct from `MetricGauge`: this primitive is small, headless, and
 * meant to attach to a runtime object — not a dashboard tile.
 *
 * @example
 * ```tsx
 * <ThresholdRing value={0.82} threshold={0.7} tone="warn" centerLabel="82%" />
 * ```
 *
 * @public
 */
export const ThresholdRing = forwardRef<SVGSVGElement, ThresholdRingProps>(
  (props, ref) => {
    const {
      centerLabel,
      className,
      labels,
      max = 1,
      size = 64,
      stroke = 6,
      threshold,
      tone = "neutral",
      value,
      ...rest
    } = props;
    const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
    const geom = computeGeometry({ max, size, stroke, threshold, value });
    const dash = `${geom.ratio * geom.circumference} ${geom.circumference}`;
    return (
      <svg
        aria-label={resolvedLabels.region}
        className={cn("inline-block", className)}
        data-threshold-ring
        data-threshold-tone={tone}
        height={geom.size}
        ref={ref}
        role="img"
        viewBox={`0 0 ${geom.size} ${geom.size}`}
        width={geom.size}
        {...rest}
      >
        <circle
          className="stroke-muted"
          cx={geom.cx}
          cy={geom.cy}
          fill="none"
          r={geom.r}
          strokeWidth={geom.stroke}
        />
        <circle
          className={cn("transition-all duration-300", TONE_STROKE[tone])}
          cx={geom.cx}
          cy={geom.cy}
          data-threshold-ring-arc
          fill="none"
          r={geom.r}
          strokeDasharray={dash}
          strokeLinecap="round"
          strokeWidth={geom.stroke}
          transform={`rotate(-90 ${geom.cx} ${geom.cy})`}
        />
        <Tick geom={geom} />
        {centerLabel ? (
          <text
            className="fill-foreground text-[10px] font-semibold"
            data-threshold-ring-label
            dominantBaseline="central"
            textAnchor="middle"
            x={geom.cx}
            y={geom.cy}
          >
            {centerLabel}
          </text>
        ) : null}
      </svg>
    );
  },
);
ThresholdRing.displayName = "ThresholdRing";
