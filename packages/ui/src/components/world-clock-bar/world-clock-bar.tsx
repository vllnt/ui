"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { Badge } from "../badge";

export type WorldClockBarZone = {
  city: string;
  locale?: string;
  timeZone: string;
};

export type WorldClockBarProps = React.ComponentPropsWithoutRef<"div"> & {
  now?: Date | number | string;
  showDate?: boolean;
  title?: string;
  updateIntervalMs?: number;
  zones: WorldClockBarZone[];
};

function normalizeDate(input: Date | number | string): Date {
  if (input instanceof Date) {
    return new Date(input.getTime());
  }

  return new Date(input);
}

function useLiveDate(now: WorldClockBarProps["now"], updateIntervalMs: number) {
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
    }, updateIntervalMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [fixedNow, updateIntervalMs]);

  return liveNow;
}

function formatZoneDateTime(
  zone: WorldClockBarZone,
  date: Date,
  showDate: boolean,
) {
  const locale = zone.locale ?? "en-US";
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: zone.timeZone,
    timeZoneName: "short",
  });
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    timeZone: zone.timeZone,
    weekday: "short",
  });

  return {
    date: showDate ? dateFormatter.format(date) : "",
    time: timeFormatter.format(date),
  };
}

function WorldClockCard({
  date,
  showDate,
  zone,
}: {
  date: Date;
  showDate: boolean;
  zone: WorldClockBarZone;
}) {
  const formatted = formatZoneDateTime(zone, date, showDate);

  return (
    <div className="min-w-[190px] rounded-lg border bg-card px-4 py-3 shadow-sm">
      <div className="text-sm font-medium">{zone.city}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">
        {formatted.time}
      </div>
      {showDate ? (
        <div className="mt-1 text-xs text-muted-foreground">
          {formatted.date}
        </div>
      ) : null}
      <div className="mt-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {zone.timeZone}
      </div>
    </div>
  );
}

export const WorldClockBar = React.forwardRef<
  HTMLDivElement,
  WorldClockBarProps
>(
  (
    {
      className,
      now,
      showDate = true,
      title = "World clock",
      updateIntervalMs = 60_000,
      zones,
      ...props
    },
    ref,
  ) => {
    const liveNow = useLiveDate(now, updateIntervalMs);

    return (
      <div className={cn("space-y-3", className)} ref={ref} {...props}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">
              Synchronized time across distributed teams and regions.
            </p>
          </div>
          <Badge variant="outline">{zones.length} zones</Badge>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1">
          {zones.map((zone) => (
            <WorldClockCard
              date={liveNow}
              key={`${zone.city}-${zone.timeZone}`}
              showDate={showDate}
              zone={zone}
            />
          ))}
        </div>
      </div>
    );
  },
);

WorldClockBar.displayName = "WorldClockBar";
