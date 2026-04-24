import * as React from "react";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "../../lib/utils";

export type CandlestickDatum = {
  close: number;
  high: number;
  label: string;
  low: number;
  open: number;
};

export type CandlestickChartProps = {
  data: CandlestickDatum[];
  height?: number;
  showGrid?: boolean;
  width?: number;
} & React.HTMLAttributes<HTMLDivElement>;

type ChartMetrics = {
  bodyWidth: number;
  bottomPadding: number;
  chartHeight: number;
  columnWidth: number;
  maxPrice: number;
  minPrice: number;
  range: number;
  topPadding: number;
};

const DEFAULT_WIDTH = 760;
const DEFAULT_HEIGHT = 260;

function formatValue(value: number) {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

function buildMetrics(
  data: CandlestickDatum[],
  height: number,
  width: number,
): ChartMetrics {
  const allValues = data.flatMap((candle) => [
    candle.high,
    candle.low,
    candle.open,
    candle.close,
  ]);
  const minPrice = Math.min(...allValues);
  const maxPrice = Math.max(...allValues);
  const range = maxPrice - minPrice || 1;
  const topPadding = 20;
  const bottomPadding = 30;
  const chartHeight = height - topPadding - bottomPadding;
  const columnWidth = width / data.length;
  const bodyWidth = Math.max(columnWidth * 0.56, 8);

  return {
    bodyWidth,
    bottomPadding,
    chartHeight,
    columnWidth,
    maxPrice,
    minPrice,
    range,
    topPadding,
  };
}

function getYForPrice(price: number, metrics: ChartMetrics) {
  const ratio = (price - metrics.minPrice) / metrics.range;
  return metrics.topPadding + metrics.chartHeight - ratio * metrics.chartHeight;
}

function PriceGrid({
  metrics,
  showGrid,
  width,
}: {
  metrics: ChartMetrics;
  showGrid: boolean;
  width: number;
}) {
  if (!showGrid) {
    return null;
  }

  const ticks = Array.from({ length: 4 }, (_, index) => {
    const ratio = index / 3;
    return {
      value: metrics.maxPrice - ratio * metrics.range,
      y: metrics.topPadding + ratio * metrics.chartHeight,
    };
  });

  return ticks.map((tick) => (
    <g key={tick.value}>
      <line
        stroke="hsl(var(--border))"
        strokeDasharray="4 6"
        strokeOpacity="0.8"
        x1="0"
        x2={width}
        y1={tick.y}
        y2={tick.y}
      />
      <text
        fill="hsl(var(--muted-foreground))"
        fontSize="11"
        textAnchor="end"
        x={width - 6}
        y={tick.y - 4}
      >
        {formatValue(tick.value)}
      </text>
    </g>
  ));
}

function CandleMarks({
  data,
  height,
  metrics,
}: {
  data: CandlestickDatum[];
  height: number;
  metrics: ChartMetrics;
}) {
  return data.map((candle, index) => {
    const centerX = metrics.columnWidth * index + metrics.columnWidth / 2;
    const wickTop = getYForPrice(candle.high, metrics);
    const wickBottom = getYForPrice(candle.low, metrics);
    const openY = getYForPrice(candle.open, metrics);
    const closeY = getYForPrice(candle.close, metrics);
    const bodyY = Math.min(openY, closeY);
    const bodyHeight = Math.max(Math.abs(openY - closeY), 3);
    const isBullish = candle.close >= candle.open;
    const fill = isBullish ? "hsl(142 71% 45%)" : "hsl(348 83% 47%)";

    return (
      <g key={candle.label}>
        <line
          stroke={fill}
          strokeLinecap="round"
          strokeWidth={2}
          x1={centerX}
          x2={centerX}
          y1={wickTop}
          y2={wickBottom}
        />
        <rect
          fill={fill}
          fillOpacity={isBullish ? 0.25 : 0.18}
          height={bodyHeight}
          rx={4}
          stroke={fill}
          strokeWidth={1.5}
          width={metrics.bodyWidth}
          x={centerX - metrics.bodyWidth / 2}
          y={bodyY}
        >
          <title>
            {`${candle.label}: O ${formatValue(candle.open)} H ${formatValue(candle.high)} L ${formatValue(candle.low)} C ${formatValue(candle.close)}`}
          </title>
        </rect>
        <text
          fill="hsl(var(--muted-foreground))"
          fontSize="11"
          textAnchor="middle"
          x={centerX}
          y={height - 8}
        >
          {candle.label}
        </text>
      </g>
    );
  });
}

function SessionPill({ sessionChange }: { sessionChange: number }) {
  const isPositive = sessionChange >= 0;
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium",
        isPositive
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
      )}
    >
      <TrendIcon className="h-4 w-4" />
      {sessionChange >= 0 ? "+" : ""}
      {formatValue(sessionChange)}
    </div>
  );
}

export const CandlestickChart = React.forwardRef<
  HTMLDivElement,
  CandlestickChartProps
>(
  (
    {
      className,
      data,
      height = DEFAULT_HEIGHT,
      showGrid = true,
      width = DEFAULT_WIDTH,
      ...props
    },
    reference,
  ) => {
    const firstCandle = data[0];
    const finalCandle = data.at(-1);

    if (!firstCandle || !finalCandle) {
      return null;
    }

    const metrics = buildMetrics(data, height, width);
    const sessionChange = finalCandle.close - firstCandle.open;

    return (
      <div
        className={cn(
          "rounded-2xl border border-border bg-card/80 p-4 shadow-sm",
          className,
        )}
        ref={reference}
        {...props}
      >
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
              OHLC session
            </p>
            <h3 className="text-lg font-semibold text-foreground">
              Candlestick chart
            </h3>
          </div>
          <SessionPill sessionChange={sessionChange} />
        </div>
        <svg
          aria-label="Candlestick chart"
          className="h-full w-full"
          height={height}
          role="img"
          viewBox={`0 0 ${width} ${height}`}
          width={width}
        >
          <PriceGrid metrics={metrics} showGrid={showGrid} width={width} />
          <CandleMarks data={data} height={height} metrics={metrics} />
        </svg>
      </div>
    );
  },
);

CandlestickChart.displayName = "CandlestickChart";
