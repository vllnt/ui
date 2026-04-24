import * as React from "react";

import { cn } from "../../lib/utils";

export type OrderBookLevel = {
  price: number;
  size: number;
  total?: number;
};

export type OrderBookProps = {
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
  precision?: number;
} & React.HTMLAttributes<HTMLDivElement>;

function withCumulativeTotal(levels: OrderBookLevel[]) {
  let runningTotal = 0;
  return levels.map((level) => {
    runningTotal += level.total ?? level.size;
    return {
      ...level,
      total: level.total ?? runningTotal,
    };
  });
}

function formatNumber(value: number, precision = 2) {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: precision,
    minimumFractionDigits: precision,
  });
}

function BookSide({
  accent,
  levels,
  precision,
  title,
}: {
  accent: "ask" | "bid";
  levels: OrderBookLevel[];
  precision: number;
  title: string;
}) {
  const maxTotal = Math.max(...levels.map((level) => level.total ?? 0), 1);
  const barClassName =
    accent === "ask"
      ? "bg-rose-500/12 border-rose-500/15"
      : "bg-emerald-500/12 border-emerald-500/15";
  const priceClassName =
    accent === "ask"
      ? "text-rose-600 dark:text-rose-400"
      : "text-emerald-600 dark:text-emerald-400";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {title}
        </h3>
        <span className="text-xs text-muted-foreground">
          Depth by total size
        </span>
      </div>
      <div className="rounded-2xl border border-border/70 bg-background/60 p-2">
        <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-3 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          <span>Price</span>
          <span className="text-right">Size</span>
          <span className="text-right">Total</span>
        </div>
        <div className="space-y-1">
          {levels.map((level) => {
            const width = `${((level.total ?? 0) / maxTotal) * 100}%`;
            return (
              <div
                className="relative overflow-hidden rounded-xl border border-transparent px-3 py-2"
                key={`${accent}-${level.price}-${level.size}`}
              >
                <div
                  className={cn(
                    "absolute inset-y-0 right-0 rounded-xl border",
                    barClassName,
                  )}
                  style={{ width }}
                />
                <div className="relative grid grid-cols-[1.2fr_1fr_1fr] gap-3 text-sm tabular-nums">
                  <span className={cn("font-medium", priceClassName)}>
                    {formatNumber(level.price, precision)}
                  </span>
                  <span className="text-right text-foreground">
                    {formatNumber(level.size, 3)}
                  </span>
                  <span className="text-right text-muted-foreground">
                    {formatNumber(level.total ?? 0, 3)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const OrderBook = React.forwardRef<HTMLDivElement, OrderBookProps>(
  ({ asks, bids, className, precision = 2, ...props }, reference) => {
    if (asks.length === 0 && bids.length === 0) {
      return null;
    }

    const askLevels = withCumulativeTotal(asks);
    const bidLevels = withCumulativeTotal(bids);
    const bestAsk = askLevels[0];
    const bestBid = bidLevels[0];
    const spread =
      bestAsk && bestBid ? Math.max(bestAsk.price - bestBid.price, 0) : 0;

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
              Level II
            </p>
            <h2 className="text-lg font-semibold text-foreground">
              Order book
            </h2>
          </div>
          <div className="rounded-full border border-border bg-background/70 px-3 py-1 text-sm text-muted-foreground tabular-nums">
            Spread {formatNumber(spread, precision)}
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <BookSide
            accent="ask"
            levels={askLevels}
            precision={precision}
            title="Asks"
          />
          <BookSide
            accent="bid"
            levels={bidLevels}
            precision={precision}
            title="Bids"
          />
        </div>
      </div>
    );
  },
);

OrderBook.displayName = "OrderBook";
