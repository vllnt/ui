"use client";

import * as React from "react";

import { ArrowDownRight, ArrowUpRight, Dot, Pause, Play } from "lucide-react";

import { formatChange } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { Badge } from "../../atoms/badge/badge";

export type TickerTapeItem = {
  change: number;
  price: number | string;
  symbol: string;
  volume?: string;
};

/** Localizable labels for the {@link TickerTape} pause control. */
export type TickerTapeLabels = {
  /** Accessible name of the control while scrolling. Defaults to `"Pause"`. */
  pause?: string;
  /** Accessible name of the control while paused. Defaults to `"Play"`. */
  play?: string;
};

export type TickerTapeProps = {
  items: TickerTapeItem[];
  /** Labels for the pause control. */
  labels?: TickerTapeLabels;
  /**
   * Render a keyboard-operable pause / play button (WCAG 2.2.2). Defaults to
   * `true`; set `false` when the host page offers its own control.
   */
  pauseControl?: boolean;
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

type TickerTapePauseToggleProps = {
  labels: Required<TickerTapeLabels>;
  onToggle: () => void;
  paused: boolean;
};

function TickerTapePauseToggle({
  labels,
  onToggle,
  paused,
}: TickerTapePauseToggleProps) {
  return (
    <button
      aria-label={paused ? labels.play : labels.pause}
      className="absolute right-2 top-1/2 z-10 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md border border-border bg-background/90 text-foreground shadow-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:hidden"
      onClick={onToggle}
      type="button"
    >
      {paused ? (
        <Play aria-hidden="true" className="size-3" />
      ) : (
        <Pause aria-hidden="true" className="size-3" />
      )}
    </button>
  );
}

function formatPrice(price: number | string) {
  return typeof price === "number" ? price.toLocaleString() : price;
}

function TickerTapeRow({ items }: { items: TickerTapeItem[] }) {
  return (
    <div className="flex min-w-max items-center gap-3 p-3">
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
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
              )}
              variant="outline"
            >
              <TrendIcon className="size-3" />
              {formatChange(item.change)}
            </Badge>
            {item.volume ? (
              <span className="hidden items-center text-xs text-muted-foreground sm:inline-flex">
                <Dot className="size-3.5" />
                {item.volume}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Horizontally scrolling market ticker. The scroll stops under
 * `prefers-reduced-motion`, pauses on hover or while focus is inside it, and
 * offers a pause / play button (WCAG 2.2.2 Pause, Stop, Hide).
 */
export const TickerTape = ({
  className,
  items,
  labels,
  pauseControl = true,
  pauseOnHover = true,
  ref: reference,
  speedSeconds = 28,
  ...props
}: TickerTapeProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const [paused, setPaused] = React.useState(false);
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
      {pauseControl ? (
        <TickerTapePauseToggle
          labels={{ pause: "Pause", play: "Play", ...labels }}
          onToggle={() => {
            setPaused((value) => !value);
          }}
          paused={paused}
        />
      ) : null}
      <div
        className={cn(
          "flex w-max items-stretch [animation-iteration-count:infinite] [animation-name:ticker-tape-scroll] [animation-timing-function:linear] focus-within:[animation-play-state:paused] motion-reduce:animate-none",
          pauseOnHover && "hover:[animation-play-state:paused]",
          paused && "[animation-play-state:paused]",
        )}
        data-ticker-tape-track=""
        style={{ animationDuration: `${speedSeconds.toString()}s` }}
      >
        <TickerTapeRow items={items} />
        <div aria-hidden="true">
          <TickerTapeRow items={items} />
        </div>
      </div>
    </div>
  );
};

TickerTape.displayName = "TickerTape";
