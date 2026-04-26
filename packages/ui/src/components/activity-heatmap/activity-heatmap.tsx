import * as React from "react";

import { cn } from "../../lib/utils";

export type ActivityHeatmapItem = {
  count: number;
  date: string;
};

export type ActivityHeatmapProps = React.ComponentPropsWithoutRef<"div"> & {
  data: ActivityHeatmapItem[];
  description?: string;
  endDate?: Date | number | string;
  title?: string;
  weeks?: number;
};

type DayCell = {
  count: number;
  date: Date;
  key: string;
  level: number;
};

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const VISIBLE_DAY_LABELS = new Set(["Mon", "Wed", "Fri"]);
const LEVEL_CLASS_NAMES = [
  "bg-muted",
  "bg-emerald-500/25",
  "bg-emerald-500/45",
  "bg-emerald-500/65",
  "bg-emerald-500",
];

function normalizeDate(input: Date | number | string): Date {
  if (input instanceof Date) {
    return new Date(input.getTime());
  }

  return new Date(input);
}

function toUtcDate(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function addUtcDays(date: Date, days: number): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + days,
    ),
  );
}

function formatDayKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function getIntensityLevel(count: number, maxCount: number): number {
  if (count <= 0 || maxCount <= 0) {
    return 0;
  }

  const ratio = count / maxCount;

  if (ratio < 0.25) {
    return 1;
  }

  if (ratio < 0.5) {
    return 2;
  }

  if (ratio < 0.75) {
    return 3;
  }

  return 4;
}

function getGridData(
  data: ActivityHeatmapItem[],
  endDate: Date,
  weeks: number,
): DayCell[][] {
  const normalizedEnd = toUtcDate(endDate);
  const startDate = addUtcDays(normalizedEnd, -(weeks * 7 - 1));
  const countsByDate = new Map<string, number>();

  data.forEach((item) => {
    const normalizedDate = toUtcDate(normalizeDate(item.date));
    countsByDate.set(formatDayKey(normalizedDate), item.count);
  });

  const maxCount = Math.max(...data.map((item) => item.count), 0);

  return Array.from({ length: weeks }, (_, weekIndex) => {
    return Array.from({ length: 7 }, (_, dayIndex) => {
      const date = addUtcDays(startDate, weekIndex * 7 + dayIndex);
      const key = formatDayKey(date);
      const count = countsByDate.get(key) ?? 0;

      return {
        count,
        date,
        key,
        level: getIntensityLevel(count, maxCount),
      };
    });
  });
}

function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

function formatTooltip(date: Date, count: number): string {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);

  return `${count} activity ${count === 1 ? "event" : "events"} on ${formattedDate}`;
}

function HeatmapGrid({
  gridData,
  weeks,
}: {
  gridData: DayCell[][];
  weeks: number;
}) {
  return (
    <div className="min-w-[640px] space-y-3">
      <div
        className="grid gap-2 text-xs text-muted-foreground"
        style={{ gridTemplateColumns: `40px repeat(${weeks}, minmax(0, 1fr))` }}
      >
        <span />
        {gridData.map((week) => (
          <span className="text-center" key={`month-${week[0]?.key}`}>
            {week[0] && week[0].date.getUTCDate() <= 7
              ? formatMonthLabel(week[0].date)
              : ""}
          </span>
        ))}
      </div>

      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `40px repeat(${weeks}, minmax(0, 1fr))` }}
      >
        <div className="grid grid-rows-7 gap-2 pt-1 text-xs text-muted-foreground">
          {WEEKDAY_LABELS.map((label) => (
            <span className="h-4 leading-4" key={label}>
              {VISIBLE_DAY_LABELS.has(label) ? label : ""}
            </span>
          ))}
        </div>

        {gridData.map((week) => (
          <div className="grid grid-rows-7 gap-2" key={`week-${week[0]?.key}`}>
            {week.map((day) => (
              <div
                className={cn(
                  "h-4 rounded-sm border border-border/40 transition-colors",
                  LEVEL_CLASS_NAMES[day.level],
                )}
                key={day.key}
                role="img"
                title={formatTooltip(day.date, day.count)}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        {LEVEL_CLASS_NAMES.map((className, index) => (
          <span
            className={cn(
              "h-3 w-3 rounded-[3px] border border-border/40",
              className,
            )}
            key={`legend-${index}`}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export const ActivityHeatmap = React.forwardRef<
  HTMLDivElement,
  ActivityHeatmapProps
>(
  (
    {
      className,
      data,
      description,
      endDate = new Date(),
      title = "Activity heatmap",
      weeks = 12,
      ...props
    },
    ref,
  ) => {
    const normalizedEndDate = normalizeDate(endDate);
    const gridData = getGridData(data, normalizedEndDate, weeks);

    return (
      <div className={cn("space-y-4", className)} ref={ref} {...props}>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>

        <div className="overflow-x-auto rounded-lg border bg-card p-4 shadow-sm">
          <HeatmapGrid gridData={gridData} weeks={weeks} />
        </div>
      </div>
    );
  },
);

ActivityHeatmap.displayName = "ActivityHeatmap";
