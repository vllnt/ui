"use client";

import { type ComponentPropsWithoutRef, type ReactNode, useMemo } from "react";

import { cn } from "@vllnt/ui";

const DEFAULT_TICK_COUNT = 8;

/**
 * Color theme for eras and event categories.
 *
 * @public
 */
export type HistoricColor =
  | "amber"
  | "blue"
  | "emerald"
  | "neutral"
  | "purple"
  | "red"
  | "rose";

const COLOR_PALETTE: Record<
  HistoricColor,
  { band: string; chip: string; marker: string }
> = {
  amber: {
    band: "bg-amber-500/15",
    chip: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    marker: "border-amber-500 bg-amber-500",
  },
  blue: {
    band: "bg-blue-500/15",
    chip: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
    marker: "border-blue-500 bg-blue-500",
  },
  emerald: {
    band: "bg-emerald-500/15",
    chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    marker: "border-emerald-500 bg-emerald-500",
  },
  neutral: {
    band: "bg-muted",
    chip: "bg-muted text-muted-foreground",
    marker: "border-muted-foreground bg-muted-foreground",
  },
  purple: {
    band: "bg-purple-500/15",
    chip: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
    marker: "border-purple-500 bg-purple-500",
  },
  red: {
    band: "bg-red-500/15",
    chip: "bg-red-500/15 text-red-700 dark:text-red-300",
    marker: "border-red-500 bg-red-500",
  },
  rose: {
    band: "bg-rose-500/15",
    chip: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    marker: "border-rose-500 bg-rose-500",
  },
};

/**
 * Background era band rendered behind the timeline.
 *
 * @public
 */
export type HistoricEra = {
  /** Color theme. Defaults to `"neutral"`. */
  color?: HistoricColor;
  /** End year (inclusive). */
  endYear: number;
  /** Stable identifier. */
  id: string;
  /** Display name. */
  name: ReactNode;
  /** Start year (inclusive). */
  startYear: number;
};

/**
 * Mapping from category id to color theme + display label.
 *
 * @public
 */
export type HistoricCategory = {
  /** Color theme. Defaults to `"neutral"`. */
  color?: HistoricColor;
  /** Stable identifier; matches {@link HistoricEvent.category}. */
  id: string;
  /** Display label. */
  label: ReactNode;
};

/**
 * Point-in-time event marker.
 *
 * @public
 */
export type HistoricEvent = {
  /** Optional category id. Drives the marker color when provided. */
  category?: string;
  /** Optional description. */
  description?: ReactNode;
  /** Optional anchor href. Renders the event title as a link. */
  href?: string;
  /** Stable identifier. */
  id: string;
  /** Event title. */
  title: ReactNode;
  /** Year. Negative for BCE / positive for CE. */
  year: number;
};

/**
 * Span event (a period or duration).
 *
 * @public
 */
export type HistoricPeriod = {
  /** Optional category id. Drives the band color when provided. */
  category?: string;
  /** End year (inclusive). */
  endYear: number;
  /** Stable identifier. */
  id: string;
  /** Start year (inclusive). */
  startYear: number;
  /** Display title. */
  title: ReactNode;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type HistoricTimelineLabels = {
  /** Aria-label for the timeline section. Defaults to `"Historic timeline"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Historic timeline",
} as const satisfies Required<HistoricTimelineLabels>;

/**
 * Props for {@link HistoricTimeline}.
 *
 * @public
 */
export type HistoricTimelineProps = {
  /** Optional category list — drives event marker colors and the legend. */
  categories?: HistoricCategory[];
  /** End year of the visible window. */
  endYear: number;
  /** Eras rendered as background bands. */
  eras?: HistoricEra[];
  /** Point-in-time event markers. */
  events?: HistoricEvent[];
  /** Localizable strings. */
  labels?: HistoricTimelineLabels;
  /** Span events (durations). */
  periods?: HistoricPeriod[];
  /** Start year of the visible window (negative for BCE). */
  startYear: number;
  /** Number of axis ticks. Defaults to `8`. */
  tickCount?: number;
} & ComponentPropsWithoutRef<"section">;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year).toString()} BCE`;
  return `${year.toString()} CE`;
}

function yearToPercent(year: number, start: number, end: number): number {
  const span = end - start;
  if (span <= 0) return 0;
  return clamp(((year - start) / span) * 100, 0, 100);
}

function buildTicks(
  start: number,
  end: number,
  count: number,
): { label: string; offset: number }[] {
  const safeCount = Math.max(2, count);
  const span = end - start;
  if (span <= 0) return [];
  const step = span / (safeCount - 1);
  return Array.from({ length: safeCount }).map((_, index) => {
    const year = Math.round(start + step * index);
    return {
      label: formatYear(year),
      offset: yearToPercent(year, start, end),
    };
  });
}

function resolveCategoryColor(
  categoryId: string | undefined,
  categories: HistoricCategory[],
): HistoricColor {
  if (!categoryId) return "neutral";
  const match = categories.find((category) => category.id === categoryId);
  return match?.color ?? "neutral";
}

type AxisProps = {
  ticks: { label: string; offset: number }[];
};

function Axis({ ticks }: AxisProps): ReactNode {
  return (
    <div
      aria-hidden="true"
      className="relative h-7 border-b border-border text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
    >
      {ticks.map((tick) => (
        <span
          className="absolute top-1 -translate-x-1/2"
          key={tick.label}
          style={{ left: `${tick.offset.toString()}%` }}
        >
          {tick.label}
        </span>
      ))}
    </div>
  );
}

type EraBandsProps = {
  endYear: number;
  eras: HistoricEra[];
  startYear: number;
};

function EraBands({ endYear, eras, startYear }: EraBandsProps): ReactNode {
  if (eras.length === 0) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {eras.map((era) => {
        const left = yearToPercent(era.startYear, startYear, endYear);
        const right = yearToPercent(era.endYear, startYear, endYear);
        const width = Math.max(0, right - left);
        if (width <= 0) return null;
        const palette = COLOR_PALETTE[era.color ?? "neutral"];
        return (
          <div
            className={cn("absolute inset-y-0", palette.band)}
            data-era-id={era.id}
            key={era.id}
            style={{
              left: `${left.toString()}%`,
              width: `${width.toString()}%`,
            }}
          />
        );
      })}
    </div>
  );
}

type EraLabelsProps = {
  endYear: number;
  eras: HistoricEra[];
  startYear: number;
};

function EraLabels({ endYear, eras, startYear }: EraLabelsProps): ReactNode {
  if (eras.length === 0) return null;
  return (
    <div className="relative flex h-6 border-b border-border">
      {eras.map((era) => {
        const left = yearToPercent(era.startYear, startYear, endYear);
        const right = yearToPercent(era.endYear, startYear, endYear);
        const width = Math.max(0, right - left);
        if (width <= 0) return null;
        const palette = COLOR_PALETTE[era.color ?? "neutral"];
        return (
          <span
            className={cn(
              "absolute top-1 truncate rounded px-1 text-[10px] font-semibold uppercase tracking-wide",
              palette.chip,
            )}
            key={`${era.id}-label`}
            style={{
              left: `${left.toString()}%`,
              width: `${width.toString()}%`,
            }}
          >
            {era.name}
          </span>
        );
      })}
    </div>
  );
}

type PeriodLaneProps = {
  categories: HistoricCategory[];
  endYear: number;
  periods: HistoricPeriod[];
  startYear: number;
};

function PeriodLane({
  categories,
  endYear,
  periods,
  startYear,
}: PeriodLaneProps): ReactNode {
  if (periods.length === 0) return null;
  return (
    <div className="relative flex h-7 items-center border-b border-border/60">
      {periods.map((period) => {
        const left = yearToPercent(period.startYear, startYear, endYear);
        const right = yearToPercent(period.endYear, startYear, endYear);
        const width = Math.max(0, right - left);
        if (width <= 0) return null;
        const color = resolveCategoryColor(period.category, categories);
        const palette = COLOR_PALETTE[color];
        const titleText = typeof period.title === "string" ? period.title : "";
        return (
          <div
            aria-label={
              titleText
                ? `${titleText}, ${formatYear(period.startYear)} – ${formatYear(period.endYear)}`
                : undefined
            }
            className={cn(
              "absolute top-1 flex h-5 items-center overflow-hidden rounded-sm px-1 text-[10px] font-medium",
              palette.chip,
            )}
            data-period-id={period.id}
            key={period.id}
            style={{
              left: `${left.toString()}%`,
              width: `${width.toString()}%`,
            }}
          >
            <span className="truncate">{period.title}</span>
          </div>
        );
      })}
    </div>
  );
}

type EventMarkerProps = {
  categories: HistoricCategory[];
  endYear: number;
  event: HistoricEvent;
  startYear: number;
};

function EventMarker({
  categories,
  endYear,
  event,
  startYear,
}: EventMarkerProps): ReactNode {
  if (event.year < startYear || event.year > endYear) return null;
  const left = yearToPercent(event.year, startYear, endYear);
  const color = resolveCategoryColor(event.category, categories);
  const palette = COLOR_PALETTE[color];
  const titleText = typeof event.title === "string" ? event.title : "";
  const ariaLabel = titleText
    ? `${titleText}, ${formatYear(event.year)}`
    : undefined;
  return (
    <div
      aria-label={ariaLabel}
      className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
      data-event-id={event.id}
      data-event-year={event.year}
      style={{ left: `${left.toString()}%` }}
    >
      <div
        aria-hidden="true"
        className={cn(
          "size-3 rounded-full border-2 ring-2 ring-background",
          palette.marker,
        )}
      />
      <div className="absolute left-1/2 top-4 w-44 -translate-x-1/2 text-center">
        {event.href ? (
          <a
            className="block truncate text-xs font-medium text-foreground underline-offset-4 hover:underline"
            href={event.href}
          >
            {event.title}
          </a>
        ) : (
          <p className="truncate text-xs font-medium text-foreground">
            {event.title}
          </p>
        )}
        <p className="truncate text-[10px] text-muted-foreground">
          {formatYear(event.year)}
          {event.description ? <span> · {event.description}</span> : null}
        </p>
      </div>
    </div>
  );
}

type EventLaneProps = {
  categories: HistoricCategory[];
  endYear: number;
  events: HistoricEvent[];
  startYear: number;
};

function EventLane({
  categories,
  endYear,
  events,
  startYear,
}: EventLaneProps): ReactNode {
  return (
    <div className="relative h-20">
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
      {events.map((event) => (
        <EventMarker
          categories={categories}
          endYear={endYear}
          event={event}
          key={event.id}
          startYear={startYear}
        />
      ))}
    </div>
  );
}

type LegendProps = {
  categories: HistoricCategory[];
};

function Legend({ categories }: LegendProps): ReactNode {
  if (categories.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 border-t border-border px-3 py-2 text-xs">
      {categories.map((category) => {
        const palette = COLOR_PALETTE[category.color ?? "neutral"];
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
              palette.chip,
            )}
            data-category-id={category.id}
            key={category.id}
          >
            <span
              aria-hidden="true"
              className={cn("size-2 rounded-full", palette.marker)}
            />
            {category.label}
          </span>
        );
      })}
    </div>
  );
}

/**
 * Specialized timeline for historical events spanning centuries or
 * millennia. Renders era bands as a background layer, period bars in a
 * lane, and point events as markers. Negative years format as `BCE`,
 * positive as `CE`. Composes nothing — pure CSS.
 *
 * @example
 * ```tsx
 * <HistoricTimeline
 *   startYear={-500}
 *   endYear={2025}
 *   eras={[{ id: "ancient", name: "Ancient", startYear: -3000, endYear: 476, color: "amber" }]}
 *   periods={[{ id: "100yr", title: "Hundred Years' War", startYear: 1337, endYear: 1453, category: "conflict" }]}
 *   events={[
 *     { id: "olympics", year: -776, title: "First Olympic Games", category: "culture" },
 *     { id: "moon", year: 1969, title: "Moon landing", category: "science" },
 *   ]}
 *   categories={[
 *     { id: "culture", label: "Culture", color: "amber" },
 *     { id: "science", label: "Science", color: "blue" },
 *     { id: "conflict", label: "Conflict", color: "red" },
 *   ]}
 * />
 * ```
 *
 * @public
 */
export const HistoricTimeline = (
  props: HistoricTimelineProps & React.RefAttributes<HTMLElement>,
) => {
  const {
    categories = [],
    className,
    endYear,
    eras = [],
    events = [],
    labels,
    periods = [],
    ref,
    startYear,
    tickCount = DEFAULT_TICK_COUNT,
    ...rest
  } = props;
  const resolvedLabels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labels }),
    [labels],
  );
  const ticks = useMemo(
    () => buildTicks(startYear, endYear, tickCount),
    [endYear, startYear, tickCount],
  );

  return (
    <section
      aria-label={resolvedLabels.region}
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-2xl border bg-background text-foreground",
        className,
      )}
      ref={ref}
      {...rest}
    >
      <Axis ticks={ticks} />
      <EraLabels endYear={endYear} eras={eras} startYear={startYear} />
      <PeriodLane
        categories={categories}
        endYear={endYear}
        periods={periods}
        startYear={startYear}
      />
      <div className="relative">
        <EraBands endYear={endYear} eras={eras} startYear={startYear} />
        <EventLane
          categories={categories}
          endYear={endYear}
          events={events}
          startYear={startYear}
        />
      </div>
      <Legend categories={categories} />
    </section>
  );
};
HistoricTimeline.displayName = "HistoricTimeline";
