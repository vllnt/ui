import * as React from "react";

import { cn } from "../../lib/utils";

/**
 * A single axis of a {@link RadarChart}.
 *
 * @public
 */
export type RadarDatum = {
  /** Axis label drawn around the perimeter. */
  label: string;
  /** Value plotted along the axis (`0`–`max`). */
  value: number;
};

/**
 * Props for {@link RadarChart}.
 *
 * @public
 */
export type RadarChartProps = {
  /** Stroke and fill color. Defaults to `currentColor` to follow the text token. */
  color?: string;
  /** One entry per axis. The chart needs at least three to form a polygon. */
  data: RadarDatum[];
  /** Number of concentric grid rings. @defaultValue 4 */
  levels?: number;
  /** Upper bound of the scale. Defaults to the largest value in `data`. */
  max?: number;
  /** Square viewport size in pixels. @defaultValue 240 */
  size?: number;
} & React.HTMLAttributes<HTMLDivElement>;

const DEFAULT_SIZE = 240;
const DEFAULT_LEVELS = 4;
const LABEL_MARGIN = 26;
const TAU = Math.PI * 2;

type Point = { x: number; y: number };
type Spoke = { center: Point; count: number; index: number; radius: number };

function vertex(spoke: Spoke): Point {
  const angle = -Math.PI / 2 + (spoke.index / spoke.count) * TAU;
  return {
    x: spoke.center.x + spoke.radius * Math.cos(angle),
    y: spoke.center.y + spoke.radius * Math.sin(angle),
  };
}

function toPolygon(points: Point[]): string {
  return points
    .map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`)
    .join(" ");
}

function anchorFor(cosine: number): "end" | "middle" | "start" {
  if (cosine > 0.2) return "start";
  if (cosine < -0.2) return "end";
  return "middle";
}

function RadarGrid({
  center,
  count,
  levels,
  radius,
}: {
  center: Point;
  count: number;
  levels: number;
  radius: number;
}) {
  return (
    <>
      {Array.from({ length: levels }, (_unused, level) => {
        const ringRadius = ((level + 1) / levels) * radius;
        const ring = Array.from({ length: count }, (_inner, index) =>
          vertex({ center, count, index, radius: ringRadius }),
        );
        return (
          <polygon
            className="stroke-border"
            fill="none"
            key={`ring-${level}`}
            points={toPolygon(ring)}
            strokeWidth={1}
          />
        );
      })}
    </>
  );
}

function RadarAxes({
  center,
  data,
  radius,
}: {
  center: Point;
  data: RadarDatum[];
  radius: number;
}) {
  const count = data.length;
  return (
    <>
      {data.map((point, index) => {
        const tip = vertex({ center, count, index, radius });
        const label = vertex({
          center,
          count,
          index,
          radius: radius + LABEL_MARGIN / 2,
        });
        const angle = -Math.PI / 2 + (index / count) * TAU;
        return (
          <React.Fragment key={`axis-${point.label}-${index}`}>
            <line
              className="stroke-border"
              strokeWidth={1}
              x1={center.x}
              x2={tip.x}
              y1={center.y}
              y2={tip.y}
            />
            <text
              className="fill-muted-foreground text-[10px]"
              dominantBaseline="middle"
              textAnchor={anchorFor(Math.cos(angle))}
              x={label.x}
              y={label.y}
            >
              {point.label}
            </text>
          </React.Fragment>
        );
      })}
    </>
  );
}

function RadarShape({
  color,
  data,
  points,
}: {
  color: string;
  data: RadarDatum[];
  points: Point[];
}) {
  return (
    <>
      <polygon
        fill={color}
        fillOpacity={0.2}
        points={toPolygon(points)}
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={2}
      />
      {points.map((point, index) => (
        <circle
          cx={point.x}
          cy={point.y}
          fill={color}
          key={`dot-${index}`}
          r={3}
        >
          <title>{`${data[index]?.label ?? ""}: ${(data[index]?.value ?? 0).toLocaleString()}`}</title>
        </circle>
      ))}
    </>
  );
}

/**
 * Token-styled SVG radar (spider) chart.
 *
 * Pure SVG, no chart dependency. Grid rings and axes use the `border` and
 * `muted-foreground` tokens; the data polygon uses `currentColor`, so the chart
 * follows the active theme. Returns `null` for fewer than three axes or a scale
 * at or below zero.
 *
 * @example
 * ```tsx
 * <RadarChart
 *   className="text-primary"
 *   max={100}
 *   data={[
 *     { label: "Speed", value: 80 },
 *     { label: "Power", value: 60 },
 *     { label: "Range", value: 90 },
 *     { label: "Agility", value: 70 },
 *     { label: "Defense", value: 50 },
 *   ]}
 * />
 * ```
 *
 * @public
 */
export const RadarChart = ({
  className,
  color = "currentColor",
  data,
  levels = DEFAULT_LEVELS,
  max,
  ref,
  size = DEFAULT_SIZE,
  ...props
}: RadarChartProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const count = data.length;
  const scaleMax = max ?? Math.max(...data.map((point) => point.value), 0);
  if (count < 3 || scaleMax <= 0) return null;

  const center: Point = { x: size / 2, y: size / 2 };
  const radius = size / 2 - LABEL_MARGIN;
  const points = data.map((point, index) =>
    vertex({
      center,
      count,
      index,
      radius: (point.value / scaleMax) * radius,
    }),
  );

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
        aria-label="Radar chart"
        className="h-full w-full"
        height={size}
        role="img"
        viewBox={`0 0 ${size} ${size}`}
        width={size}
      >
        <RadarGrid
          center={center}
          count={count}
          levels={Math.max(1, levels)}
          radius={radius}
        />
        <RadarAxes center={center} data={data} radius={radius} />
        <RadarShape color={color} data={data} points={points} />
      </svg>
    </div>
  );
};

RadarChart.displayName = "RadarChart";
