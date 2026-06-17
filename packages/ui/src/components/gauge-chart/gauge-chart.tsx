import * as React from "react";

import { cn } from "../../lib/utils";

/**
 * Props for {@link GaugeChart}.
 *
 * @public
 */
export type GaugeChartProps = {
  /** Color of the filled arc. Defaults to `currentColor`. */
  color?: string;
  /** Optional caption under the value. */
  label?: string;
  /** Upper bound of the scale. @defaultValue 100 */
  max?: number;
  /** Lower bound of the scale. @defaultValue 0 */
  min?: number;
  /** Draw the value in the center. @defaultValue true */
  showValue?: boolean;
  /** Square viewport width in pixels; the height spans about half. @defaultValue 200 */
  size?: number;
  /** Arc thickness in pixels. @defaultValue 16 */
  thickness?: number;
  /** Current value. The chart clamps it to `[min, max]`. */
  value: number;
} & React.HTMLAttributes<HTMLDivElement>;

const DEFAULT_SIZE = 200;
const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_THICKNESS = 16;

type Point = { x: number; y: number };
type ArcGeom = { center: Point; end: number; radius: number; start: number };

function clamp(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), high);
}

function polar(center: Point, radius: number, degrees: number): Point {
  const radians = (degrees * Math.PI) / 180;
  return {
    x: center.x + radius * Math.cos(radians),
    y: center.y + radius * Math.sin(radians),
  };
}

function arc(geom: ArcGeom): string {
  const from = polar(geom.center, geom.radius, geom.start);
  const to = polar(geom.center, geom.radius, geom.end);
  const largeArc = geom.end - geom.start > 180 ? 1 : 0;
  return `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} A ${geom.radius} ${geom.radius} 0 ${largeArc} 1 ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
}

function GaugeText({
  center,
  label,
  showValue,
  size,
  value,
}: {
  center: Point;
  label?: string;
  showValue: boolean;
  size: number;
  value: number;
}) {
  return (
    <>
      {showValue ? (
        <text
          className="fill-foreground font-semibold"
          dominantBaseline="middle"
          fontSize={size * 0.16}
          textAnchor="middle"
          x={center.x}
          y={center.y - size * 0.06}
        >
          {Math.round(value).toLocaleString()}
        </text>
      ) : null}
      {label ? (
        <text
          className="fill-muted-foreground text-xs"
          dominantBaseline="middle"
          textAnchor="middle"
          x={center.x}
          y={center.y + size * 0.1}
        >
          {label}
        </text>
      ) : null}
    </>
  );
}

/**
 * Token-styled SVG gauge (semicircular meter).
 *
 * Pure SVG, no chart dependency. The track uses the `muted` token and the
 * filled arc uses `currentColor`, so the gauge follows the active theme. The
 * chart clamps `value` to `[min, max]`.
 *
 * @example
 * ```tsx
 * <GaugeChart className="text-primary" label="CPU load" value={72} />
 * ```
 *
 * @public
 */
export const GaugeChart = ({
  className,
  color = "currentColor",
  label,
  max = DEFAULT_MAX,
  min = DEFAULT_MIN,
  ref,
  showValue = true,
  size = DEFAULT_SIZE,
  thickness = DEFAULT_THICKNESS,
  value,
  ...props
}: GaugeChartProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const span = max - min;
  const fraction = span > 0 ? clamp((value - min) / span, 0, 1) : 0;
  const center: Point = { x: size / 2, y: size / 2 };
  const radius = size / 2 - thickness / 2;
  const viewHeight = size / 2 + thickness + 28;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-background/40 p-3",
        className,
      )}
      ref={ref}
      {...props}
    >
      <svg
        aria-label="Gauge chart"
        className="h-full w-full"
        height={viewHeight}
        role="img"
        viewBox={`0 0 ${size} ${viewHeight}`}
        width={size}
      >
        <path
          className="stroke-muted"
          d={arc({ center, end: 360, radius, start: 180 })}
          fill="none"
          strokeLinecap="round"
          strokeWidth={thickness}
        />
        {fraction > 0 ? (
          <path
            d={arc({ center, end: 180 + fraction * 180, radius, start: 180 })}
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeWidth={thickness}
          />
        ) : null}
        <GaugeText
          center={center}
          label={label}
          showValue={showValue}
          size={size}
          value={value}
        />
      </svg>
    </div>
  );
};

GaugeChart.displayName = "GaugeChart";
