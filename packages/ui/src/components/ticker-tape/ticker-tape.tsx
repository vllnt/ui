import * as React from "react";

import { ArrowDownRight, ArrowUpRight, Dot } from "lucide-react";

import { cn } from "../../lib/utils";
import { Badge } from "../badge";

export type TickerTapeItem = {
  change: number;
  price: number | string;
  symbol: string;
  volume?: string;
};

export type TickerTapeProps = {
  items: TickerTapeItem[];
  pauseOnHover?: boolean;
  speedSeconds?: number;
} & React.HTMLAttributes<HTMLDivElement>;

const tickerTapeKeyframes = `
@keyframes ticker-tape-scroll {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}
`;

function formatPrice(price: number | string) {
  return typeof price === "number" ? price.toLocaleString() : price;
}

function formatChange(change: number) {
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}

function TickerTapeRow({ items }: { items: TickerTapeItem[] }) {
  return (
    <div className="flex min-w-max items-center gap-3 px-3 py-3">
      {items.map((item) => {
        const isPositive = item.change >= 0;
        const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

        return (
          <div
            className="flex min-w-[12rem] items-center gap-3 rounded-full border border-border/70 bg-background/80 px-3 py-2 shadow-sm"
            key={`${item.symbol}-${item.price}-${item.change}`}
          >
            <div className="flex min-w-0 flex-col">
              <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                {item.symbol}
              </span>
              <span className="truncate text-sm font-semibold text-foreground">
                {formatPrice(item.price)}
              </span>
            </div>
            <Badge
              className={cn(
                "ml-auto gap-1 rounded-full border px-2 py-0.5 text-[11px] tabular-nums",
                isPositive
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
              )}
              variant="outline"
            >
              <TrendIcon className="h-3 w-3" />
              {formatChange(item.change)}
            </Badge>
            {item.volume ? (
              <span className="hidden items-center text-xs text-muted-foreground sm:inline-flex">
                <Dot className="h-3.5 w-3.5" />
                {item.volume}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export const TickerTape = React.forwardRef<HTMLDivElement, TickerTapeProps>(
  (
    { className, items, pauseOnHover = true, speedSeconds = 28, ...props },
    reference,
  ) => {
    if (items.length === 0) {
      return null;
    }

    return (
      <div
        aria-label="TickerTape"
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border bg-card/70 backdrop-blur-sm",
          className,
        )}
        ref={reference}
        role="region"
        {...props}
      >
        <style>{tickerTapeKeyframes}</style>
        <div
          className={cn(
            "flex w-max items-stretch",
            pauseOnHover && "hover:[animation-play-state:paused]",
          )}
          style={{
            animationDuration: `${speedSeconds}s`,
            animationIterationCount: "infinite",
            animationName: "ticker-tape-scroll",
            animationTimingFunction: "linear",
          }}
        >
          <TickerTapeRow items={items} />
          <div aria-hidden="true">
            <TickerTapeRow items={items} />
          </div>
        </div>
      </div>
    );
  },
);

TickerTape.displayName = "TickerTape";
