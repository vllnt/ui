import * as React from "react";

import { cn } from "../../lib/utils";

type Datum = {
  label?: string;
  value: number;
};

export type AreaChartProps = {
  color?: string;
  data: Datum[];
  gradientId?: string;
  height?: number;
  strokeWidth?: number;
  width?: number;
} & React.HTMLAttributes<HTMLDivElement>;

const DEFAULT_WIDTH = 340;
const DEFAULT_HEIGHT = 150;
const DEFAULT_STROKE_WIDTH = 2;

type ChartDimensions = { height: number; strokeWidth: number; width: number };

function computePoints(data: Datum[], dimensions: ChartDimensions) {
  const { height, strokeWidth, width } = dimensions;
  const values = data.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;
  const safeWidth = Math.max(width - strokeWidth * 2, 0);
  const safeHeight = Math.max(height - strokeWidth * 2, 0);

  return data.map((point, index) => {
    const x =
      data.length === 1
        ? strokeWidth + safeWidth / 2
        : strokeWidth + (index / (data.length - 1)) * safeWidth;
    const ratio = (point.value - minValue) / range;
    const y = safeHeight - ratio * safeHeight + strokeWidth;
    return { x, y };
  });
}

function getPathCoordinates(data: Datum[], dimensions: ChartDimensions) {
  if (data.length === 0) return { area: "", line: "" };

  const points = computePoints(data, dimensions);
  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");

  const area =
    points.length === 0
      ? ""
      : `M${points[0]?.x ?? 0},${dimensions.height} ${line} L${points.at(-1)?.x ?? 0},${dimensions.height}Z`;

  return { area, line };
}

export const AreaChart = React.forwardRef<HTMLDivElement, AreaChartProps>(
  (
    {
      className,
      color = "currentColor",
      data,
      gradientId = "area-chart-gradient",
      height = DEFAULT_HEIGHT,
      strokeWidth = DEFAULT_STROKE_WIDTH,
      width = DEFAULT_WIDTH,
      ...props
    },
    reference,
  ) => {
    const { area, line } = React.useMemo(
      () => getPathCoordinates(data, { height, strokeWidth, width }),
      [data, width, height, strokeWidth],
    );

    if (!line) return null;

    return (
      <div
        className={cn(
          "rounded-2xl border border-border bg-background/40 p-3",
          className,
        )}
        ref={reference}
        {...props}
      >
        <svg
          aria-label="Area chart"
          className="h-full w-full"
          height={height}
          role="img"
          viewBox={`0 0 ${width} ${height}`}
          width={width}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.5" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={area}
            fill={`url(#${gradientId})`}
            stroke="none"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={line}
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    );
  },
);

AreaChart.displayName = "AreaChart";
