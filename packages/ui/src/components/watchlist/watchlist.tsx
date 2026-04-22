import * as React from "react";

import { ArrowDownRight, ArrowUpRight, Star } from "lucide-react";

import { cn } from "../../lib/utils";

export type WatchlistItem = {
  change: number;
  name?: string;
  price: number | string;
  starred?: boolean;
  symbol: string;
  volume?: string;
};

export type WatchlistProps = {
  eyebrow?: string;
  items: WatchlistItem[];
  title?: string;
} & React.HTMLAttributes<HTMLDivElement>;

function formatPrice(price: number | string): string {
  return typeof price === "number"
    ? price.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      })
    : price;
}

function formatChange(change: number): string {
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}

function WatchlistRow({ item }: { item: WatchlistItem }): React.JSX.Element {
  const isPositive = item.change >= 0;
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/40">
      <span
        aria-hidden="true"
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full border",
          item.starred
            ? "border-amber-400/40 bg-amber-400/10 text-amber-500"
            : "border-border bg-background text-muted-foreground",
        )}
      >
        <Star
          className={cn("h-3.5 w-3.5", item.starred && "fill-current")}
          strokeWidth={1.75}
        />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {item.symbol}
        </p>
        {item.name ? (
          <p className="truncate text-xs text-muted-foreground">{item.name}</p>
        ) : null}
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold tabular-nums text-foreground">
          {formatPrice(item.price)}
        </p>
        {item.volume ? (
          <p className="text-[11px] text-muted-foreground tabular-nums">
            {item.volume}
          </p>
        ) : null}
      </div>
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium tabular-nums",
          isPositive
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
        )}
      >
        <TrendIcon className="h-3 w-3" />
        {formatChange(item.change)}
      </span>
    </li>
  );
}

export const Watchlist = React.forwardRef<HTMLDivElement, WatchlistProps>(
  (
    {
      className,
      eyebrow = "Tracked symbols",
      items,
      title = "Watchlist",
      ...props
    },
    reference,
  ) => {
    if (items.length === 0) {
      return null;
    }

    const advancing = items.filter((item) => item.change >= 0).length;
    const declining = items.length - advancing;

    return (
      <section
        aria-label={title}
        className={cn(
          "rounded-2xl border border-border bg-card/80 p-4 shadow-sm",
          className,
        )}
        ref={reference}
        {...props}
      >
        <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-3 w-3" />
              {advancing} up
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-rose-600 dark:text-rose-400">
              <ArrowDownRight className="h-3 w-3" />
              {declining} down
            </span>
          </div>
        </header>
        <ul className="divide-y divide-border/60">
          {items.map((item) => (
            <WatchlistRow item={item} key={item.symbol} />
          ))}
        </ul>
      </section>
    );
  },
);

Watchlist.displayName = "Watchlist";
