import * as React from "react";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "../../lib/utils";

export type SparklineGridItem = {
  change: number;
  data: number[];
  label: string;
  value: string;
};

export type SparklineGridProps = {
  columns?: 2 | 3 | 4;
  items: SparklineGridItem[];
} & React.HTMLAttributes<HTMLDivElement>;

function buildSparklinePath(data: number[], width: number, height: number) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  return data
    .map((value, index) => {
      const x =
        data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

const gridColumns = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 xl:grid-cols-3",
  4: "md:grid-cols-2 xl:grid-cols-4",
};

export const SparklineGrid = React.forwardRef<
  HTMLDivElement,
  SparklineGridProps
>(({ className, columns = 2, items, ...props }, reference) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("grid grid-cols-1 gap-4", gridColumns[columns], className)}
      ref={reference}
      {...props}
    >
      {items.map((item) => {
        const isPositive = item.change >= 0;
        const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
        const stroke = isPositive ? "hsl(142 71% 45%)" : "hsl(348 83% 47%)";

        return (
          <section
            className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm"
            key={item.label}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                  {item.value}
                </p>
              </div>
              <div
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium tabular-nums",
                  isPositive
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
                )}
              >
                <TrendIcon className="h-3.5 w-3.5" />
                {item.change > 0 ? "+" : ""}
                {item.change.toFixed(2)}%
              </div>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <svg
                aria-label={`${item.label} sparkline`}
                className="h-16 w-full"
                role="img"
                viewBox="0 0 120 48"
              >
                <path
                  d={buildSparklinePath(item.data, 120, 48)}
                  fill="none"
                  stroke={stroke}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </section>
        );
      })}
    </div>
  );
});

SparklineGrid.displayName = "SparklineGrid";
