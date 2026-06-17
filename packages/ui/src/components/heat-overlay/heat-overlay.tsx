"use client";

import { type ComponentPropsWithoutRef, useId } from "react";

import { cn } from "../../lib/utils";

/**
 * Tone of the heat gradient — drives the inner circle color.
 *
 * @public
 */
export type HeatOverlayTone = "cool" | "danger" | "neutral" | "warn";

const TONE_FILL: Record<HeatOverlayTone, string> = {
  cool: "fill-blue-500",
  danger: "fill-red-500",
  neutral: "fill-foreground",
  warn: "fill-amber-500",
};

/**
 * One heat sample.
 *
 * @public
 */
export type HeatPoint = {
  /** Stable identifier — used as the React key. */
  id: string;
  /** Optional per-point tone override. */
  tone?: HeatOverlayTone;
  /** Sample weight `0..1` — drives the circle opacity + radius. */
  weight: number;
  /** X coordinate in canvas pixels. */
  x: number;
  /** Y coordinate in canvas pixels. */
  y: number;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type HeatOverlayLabels = {
  /** Aria-label override. Defaults to `"Heat overlay"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Heat overlay",
} as const satisfies Required<HeatOverlayLabels>;

/**
 * Props for {@link HeatOverlay}.
 *
 * @public
 */
export type HeatOverlayProps = {
  /** Optional global tone applied to every point that omits its own. Defaults to `"warn"`. */
  defaultTone?: HeatOverlayTone;
  /** Sample radius in pixels at full weight. Defaults to `48`. */
  intensity?: number;
  /** Localizable strings. */
  labels?: HeatOverlayLabels;
  /** Sample points in render order. */
  points: HeatPoint[];
} & ComponentPropsWithoutRef<"svg">;

const clamp01 = (v: number): number => {
  if (v < 0) {
    return 0;
  }
  if (v > 1) {
    return 1;
  }
  return v;
};

const HeatBlob = (props: {
  defaultTone: HeatOverlayTone;
  gradientId: string;
  intensity: number;
  point: HeatPoint;
}): React.ReactElement => {
  const { defaultTone, gradientId, intensity, point } = props;
  const weight = clamp01(point.weight);
  const tone = point.tone ?? defaultTone;
  return (
    <circle
      className={cn("mix-blend-multiply", TONE_FILL[tone])}
      cx={point.x}
      cy={point.y}
      data-heat-point={point.id}
      data-heat-tone={tone}
      fill={`url(#${gradientId})`}
      fillOpacity={weight * 0.6}
      r={Math.max(8, intensity * weight)}
    />
  );
};

/**
 * Heatmap-style overlay drawn on top of a canvas. Each sample renders
 * as a soft radial blob whose radius + opacity scale with its weight.
 * Pure presentation; the host computes the point list from the
 * activity stream.
 *
 * Render inside a `position: relative` parent that shares the canvas
 * pixel coordinate space; the SVG is `pointer-events: none` so host
 * gestures pass through.
 *
 * @example
 * ```tsx
 * <div className="relative h-screen w-screen">
 *   <Canvas />
 *   <HeatOverlay
 *     points={[
 *       { id: "a", x: 120, y: 80,  weight: 1.0, tone: "danger" },
 *       { id: "b", x: 320, y: 220, weight: 0.4 },
 *     ]}
 *   />
 * </div>
 * ```
 *
 * @public
 */
export const HeatOverlay = ({
  ref,
  ...props
}: HeatOverlayProps & { ref?: React.Ref<SVGSVGElement> }) => {
  const {
    className,
    defaultTone = "warn",
    intensity = 48,
    labels,
    points,
    ...rest
  } = props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  const gradientId = useId();
  if (points.length === 0) {
    return null;
  }
  return (
    <svg
      aria-label={resolvedLabels.region}
      className={cn(
        "pointer-events-none absolute inset-0 z-10 h-full w-full",
        className,
      )}
      data-heat-overlay
      ref={ref}
      role="img"
      {...rest}
    >
      <defs>
        <radialGradient cx="50%" cy="50%" id={gradientId} r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="70%" stopColor="currentColor" stopOpacity="0.4" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      {points.map((point) => (
        <HeatBlob
          defaultTone={defaultTone}
          gradientId={gradientId}
          intensity={intensity}
          key={point.id}
          point={point}
        />
      ))}
    </svg>
  );
};
HeatOverlay.displayName = "HeatOverlay";
