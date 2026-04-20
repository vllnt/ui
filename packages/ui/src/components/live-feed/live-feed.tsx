"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { Badge } from "../badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card";
import {
  SeverityBadge,
  type SeverityBadgeLevel,
} from "../severity-badge/severity-badge";

export type LiveFeedEvent = {
  id: string;
  message?: string;
  severity: SeverityBadgeLevel;
  source?: string;
  timestamp: Date | number | string;
  title: string;
};

export type LiveFeedProps = React.ComponentPropsWithoutRef<"div"> & {
  description?: string;
  emptyLabel?: string;
  events: LiveFeedEvent[];
  maxItems?: number;
  now?: Date | number | string;
  tickMs?: number;
  title?: string;
};

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function normalizeDate(input: Date | number | string): Date {
  if (input instanceof Date) {
    return new Date(input.getTime());
  }

  return new Date(input);
}

function useLiveDate(now: LiveFeedProps["now"], tickMs: number) {
  const fixedNow = React.useMemo(
    () => (now ? normalizeDate(now) : undefined),
    [now],
  );
  const [liveNow, setLiveNow] = React.useState<Date>(fixedNow ?? new Date());

  React.useEffect(() => {
    if (fixedNow) {
      setLiveNow(fixedNow);
      return;
    }

    const interval = window.setInterval(() => {
      setLiveNow(new Date());
    }, tickMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [fixedNow, tickMs]);

  return liveNow;
}

function formatRelative(eventDate: Date, now: Date): string {
  const deltaMs = now.getTime() - eventDate.getTime();

  if (deltaMs < 5 * SECOND_MS) {
    return "just now";
  }

  if (deltaMs < MINUTE_MS) {
    return `${Math.floor(deltaMs / SECOND_MS)}s ago`;
  }

  if (deltaMs < HOUR_MS) {
    return `${Math.floor(deltaMs / MINUTE_MS)}m ago`;
  }

  if (deltaMs < DAY_MS) {
    return `${Math.floor(deltaMs / HOUR_MS)}h ago`;
  }

  if (deltaMs < 7 * DAY_MS) {
    return `${Math.floor(deltaMs / DAY_MS)}d ago`;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(eventDate);
}

function formatAbsolute(eventDate: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    second: "2-digit",
  }).format(eventDate);
}

function sortEventsDesc(events: LiveFeedEvent[]): LiveFeedEvent[] {
  return [...events].sort(
    (a, b) =>
      normalizeDate(b.timestamp).getTime() -
      normalizeDate(a.timestamp).getTime(),
  );
}

function LiveFeedRow({
  event,
  isLatest,
  now,
}: {
  event: LiveFeedEvent;
  isLatest: boolean;
  now: Date;
}) {
  const eventDate = normalizeDate(event.timestamp);

  return (
    <li className="flex gap-3 border-b border-border/60 py-3 last:border-b-0">
      <div className="pt-1">
        <SeverityBadge
          level={event.severity}
          pulse={isLatest ? event.severity === "critical" : undefined}
          tone="soft"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-medium">{event.title}</p>
          <time
            className="whitespace-nowrap text-xs text-muted-foreground"
            dateTime={eventDate.toISOString()}
            title={formatAbsolute(eventDate)}
          >
            {formatRelative(eventDate, now)}
          </time>
        </div>
        {event.message ? (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {event.message}
          </p>
        ) : null}
        {event.source ? (
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {event.source}
          </p>
        ) : null}
      </div>
    </li>
  );
}

export const LiveFeed = React.forwardRef<HTMLDivElement, LiveFeedProps>(
  (
    {
      className,
      description,
      emptyLabel = "No events yet",
      events,
      maxItems = 50,
      now,
      tickMs = 30_000,
      title = "Live feed",
      ...props
    },
    ref,
  ) => {
    const liveNow = useLiveDate(now, tickMs);
    const visibleEvents = React.useMemo(
      () => sortEventsDesc(events).slice(0, maxItems),
      [events, maxItems],
    );

    return (
      <Card className={cn("shadow-sm", className)} ref={ref} {...props}>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-base">{title}</CardTitle>
            {description ? (
              <CardDescription>{description}</CardDescription>
            ) : null}
          </div>
          <Badge variant="outline">
            <span
              aria-hidden="true"
              className="relative mr-1.5 inline-flex h-2 w-2"
            >
              <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-500 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>{" "}
            Live
          </Badge>
        </CardHeader>
        <CardContent className="pt-0">
          {visibleEvents.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {emptyLabel}
            </div>
          ) : (
            <ul className="max-h-[360px] divide-y divide-border/60 overflow-y-auto">
              {visibleEvents.map((event, index) => (
                <LiveFeedRow
                  event={event}
                  isLatest={index === 0}
                  key={event.id}
                  now={liveNow}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    );
  },
);

LiveFeed.displayName = "LiveFeed";
