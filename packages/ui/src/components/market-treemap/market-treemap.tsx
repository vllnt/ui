import * as React from "react";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "../../lib/utils";

export type MarketTreemapItem = {
  change: number;
  label: string;
  sector?: string;
  value: number;
};

export type MarketTreemapProps = {
  items: MarketTreemapItem[];
} & React.HTMLAttributes<HTMLDivElement>;

function getSpan(value: number, maxValue: number) {
  const normalized = value / Math.max(maxValue, 1);

  if (normalized >= 0.7) {
    return "md:col-span-2 md:row-span-2";
  }

  if (normalized >= 0.4) {
    return "md:col-span-2";
  }

  return "";
}

function getTone(change: number) {
  const isPositive = change >= 0;

  return {
    isPositive,
    tileClassName: isPositive
      ? "border-emerald-500/30 bg-emerald-500/10"
      : "border-rose-500/30 bg-rose-500/10",
    trendClassName: isPositive
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400",
  };
}

function MarketTreemapTile({
  item,
  maxValue,
}: {
  item: MarketTreemapItem;
  maxValue: number;
}) {
  const tone = getTone(item.change);
  const TrendIcon = tone.isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <article
      className={cn(
        "flex min-h-[120px] flex-col justify-between rounded-2xl border p-4 transition-transform duration-200 hover:-translate-y-0.5",
        tone.tileClassName,
        getSpan(item.value, maxValue),
      )}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
              {item.sector ?? "Market"}
            </p>
            <h3 className="mt-1 text-xl font-semibold text-foreground">
              {item.label}
            </h3>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-1 text-sm font-medium",
              tone.trendClassName,
            )}
          >
            <TrendIcon className="h-4 w-4" />
            {item.change > 0 ? "+" : ""}
            {item.change.toFixed(2)}%
          </div>
        </div>
      </div>
      <div className="flex items-end justify-between gap-3 text-sm text-muted-foreground">
        <span>Weight {item.value.toLocaleString()}</span>
        <span className="rounded-full bg-background/70 px-2 py-1 text-xs uppercase tracking-[0.2em] text-foreground">
          {tone.isPositive ? "Advancing" : "Declining"}
        </span>
      </div>
    </article>
  );
}

export const MarketTreemap = React.forwardRef<
  HTMLDivElement,
  MarketTreemapProps
>(({ className, items, ...props }, reference) => {
  if (items.length === 0) {
    return null;
  }

  const maxValue = Math.max(...items.map((item) => item.value));

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card/80 p-4 shadow-sm",
        className,
      )}
      ref={reference}
      {...props}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
            Sector heatmap
          </p>
          <h2 className="text-lg font-semibold text-foreground">
            Market treemap
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Tile size maps market cap proxy; color reflects session change.
        </p>
      </div>
      <div className="grid auto-rows-[120px] grid-cols-1 gap-3 md:auto-rows-[120px] md:grid-cols-4">
        {items.map((item) => (
          <MarketTreemapTile item={item} key={item.label} maxValue={maxValue} />
        ))}
      </div>
    </div>
  );
});

MarketTreemap.displayName = "MarketTreemap";
