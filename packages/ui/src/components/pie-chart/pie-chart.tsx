import * as React from "react";

import { cn } from "../../lib/utils";

/**
 * A single slice of a {@link PieChart}.
 *
 * @public
 */
export type PieDatum = {
  /** Optional explicit slice color. Falls back to the chart palette. */
  color?: string;
  /** Slice label shown in the native tooltip. */
  label: string;
  /** Slice weight. The chart drops zero or negative values. */
  value: number;
};

/**
 * Props for {@link PieChart}.
 *
 * @public
 */
export type PieChartProps = {
  /** Base palette color. Defaults to `currentColor` to follow the text token. */
  color?: string;
  /** Explicit per-slice palette. Overrides the opacity-stepped default. */
  colors?: string[];
  /** Slices to render. */
  data: PieDatum[];
  /**
   * Inner radius as a fraction of the outer radius (`0`–`1`). `0` draws a full
   * pie; a value above `0` draws a donut.
   *
   * @defaultValue 0
   */
  innerRadius?: number;
  /** Square viewport size in pixels. @defaultValue 200 */
  size?: number;
} & React.HTMLAttributes<HTMLDivElement>;

const DEFAULT_SIZE = 200;
const TAU = Math.PI * 2;

type Point = { x: number; y: number };
type Slice = {
  color?: string;
  end: number;
  label: string;
  start: number;
  value: number;
};
type SliceGeom = { center: Point; inner: number; outer: number };

function buildSlices(data: PieDatum[]): Slice[] {
  const positive = data.filter((point) => point.value > 0);
  const total = positive.reduce((sum, point) => sum + point.value, 0);
  if (total <= 0) return [];

  return positive.reduce<{ cursor: number; slices: Slice[] }>(
    (accumulator, point) => {
      const start = accumulator.cursor;
      const end = start + (point.value / total) * TAU;
      accumulator.slices.push({
        color: point.color,
        end,
        label: point.label,
        start,
        value: point.value,
      });
      accumulator.cursor = end;
      return accumulator;
    },
    { cursor: 0, slices: [] },
  ).slices;
}

function polar(center: Point, radius: number, angle: number): Point {
  return {
    x: center.x + radius * Math.sin(angle),
    y: center.y - radius * Math.cos(angle),
  };
}

function slicePath(geom: SliceGeom, slice: Slice): string {
  const { center, inner, outer } = geom;
  const largeArc = slice.end - slice.start > Math.PI ? 1 : 0;
  const o0 = polar(center, outer, slice.start);
  const o1 = polar(center, outer, slice.end);

  if (inner <= 0) {
    return `M ${center.x} ${center.y} L ${o0.x} ${o0.y} A ${outer} ${outer} 0 ${largeArc} 1 ${o1.x} ${o1.y} Z`;
  }

  const innerEnd = polar(center, inner, slice.end);
  const innerStart = polar(center, inner, slice.start);
  return `M ${o0.x} ${o0.y} A ${outer} ${outer} 0 ${largeArc} 1 ${o1.x} ${o1.y} L ${innerEnd.x} ${innerEnd.y} A ${inner} ${inner} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y} Z`;
}

function sliceOpacity(index: number, count: number): number {
  if (count <= 1) return 1;
  return 1 - (index / count) * 0.65;
}

function PieSlice({
  fill,
  fillOpacity,
  fullCircle,
  geom,
  slice,
}: {
  fill: string;
  fillOpacity: number;
  fullCircle: boolean;
  geom: SliceGeom;
  slice: Slice;
}) {
  const title = `${slice.label}: ${slice.value.toLocaleString()}`;
  if (fullCircle) {
    const isDonut = geom.inner > 0;
    return (
      <circle
        cx={geom.center.x}
        cy={geom.center.y}
        fill={fill}
        fillOpacity={fillOpacity}
        r={isDonut ? (geom.outer + geom.inner) / 2 : geom.outer}
        stroke={isDonut ? fill : "none"}
        strokeWidth={isDonut ? geom.outer - geom.inner : 0}
      >
        <title>{title}</title>
      </circle>
    );
  }
  return (
    <path d={slicePath(geom, slice)} fill={fill} fillOpacity={fillOpacity}>
      <title>{title}</title>
    </path>
  );
}

/**
 * Token-styled SVG pie / donut chart.
 *
 * Pure SVG, no chart dependency. Colors come from `currentColor` (set via a
 * text-color token such as `text-primary`) with opacity steps, so the chart
 * follows the active theme. Pass `colors` or a per-slice `color` to set an
 * explicit palette. Returns `null` without any positive value.
 *
 * @example
 * ```tsx
 * <PieChart
 *   className="text-primary"
 *   innerRadius={0.6}
 *   data={[
 *     { label: "Direct", value: 40 },
 *     { label: "Referral", value: 25 },
 *     { label: "Organic", value: 35 },
 *   ]}
 * />
 * ```
 *
 * @public
 */
export const PieChart = ({
  className,
  color = "currentColor",
  colors,
  data,
  innerRadius = 0,
  ref,
  size = DEFAULT_SIZE,
  ...props
}: PieChartProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const slices = buildSlices(data);
  if (slices.length === 0) return null;

  const outer = size / 2 - 1;
  const geom: SliceGeom = {
    center: { x: size / 2, y: size / 2 },
    inner: Math.max(0, Math.min(innerRadius, 0.95)) * outer,
    outer,
  };
  const fullCircle = slices.length === 1;

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
        aria-label="Pie chart"
        className="h-full w-full"
        height={size}
        role="img"
        viewBox={`0 0 ${size} ${size}`}
        width={size}
      >
        {slices.map((slice, index) => (
          <PieSlice
            fill={colors?.[index] ?? slice.color ?? color}
            fillOpacity={
              colors || slice.color ? 1 : sliceOpacity(index, slices.length)
            }
            fullCircle={fullCircle}
            geom={geom}
            key={`${slice.label}-${index}`}
            slice={slice}
          />
        ))}
      </svg>
    </div>
  );
};

PieChart.displayName = "PieChart";
