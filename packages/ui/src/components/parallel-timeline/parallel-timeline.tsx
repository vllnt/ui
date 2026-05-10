"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  useMemo,
} from "react";

import { cn } from "../../lib/utils";

const DEFAULT_TICK_COUNT = 8;

/**
 * Color theme for a {@link ParallelTimelineTrack} accent strip and
 * {@link ParallelTimelineEvent} markers.
 *
 * @public
 */
export type ParallelTimelineColor =
  | "amber"
  | "blue"
  | "emerald"
  | "neutral"
  | "purple"
  | "red"
  | "rose";

const COLOR_CLASSES: Record<
  ParallelTimelineColor,
  { accent: string; chip: string; marker: string }
> = {
  amber: {
    accent: "bg-amber-500",
    chip: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    marker: "border-amber-500 bg-amber-500",
  },
  blue: {
    accent: "bg-blue-500",
    chip: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
    marker: "border-blue-500 bg-blue-500",
  },
  emerald: {
    accent: "bg-emerald-500",
    chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    marker: "border-emerald-500 bg-emerald-500",
  },
  neutral: {
    accent: "bg-muted-foreground/40",
    chip: "bg-muted text-muted-foreground",
    marker: "border-muted-foreground bg-muted-foreground",
  },
  purple: {
    accent: "bg-purple-500",
    chip: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
    marker: "border-purple-500 bg-purple-500",
  },
  red: {
    accent: "bg-red-500",
    chip: "bg-red-500/15 text-red-700 dark:text-red-300",
    marker: "border-red-500 bg-red-500",
  },
  rose: {
    accent: "bg-rose-500",
    chip: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    marker: "border-rose-500 bg-rose-500",
  },
};

/**
 * One event marker on a {@link ParallelTimelineTrack}.
 *
 * @public
 */
export type ParallelTimelineEvent = {
  /** Stable identifier within the track. */
  id: string;
  /** Optional secondary line (date detail, place, etc.). */
  meta?: ReactNode;
  /** Event title. */
  title: ReactNode;
  /** Year. Negative for BCE / positive for CE. */
  year: number;
};

/**
 * Single horizontal track inside a {@link ParallelTimeline}.
 *
 * @public
 */
export type ParallelTimelineTrack = {
  /** Color theme. Defaults to `"neutral"`. */
  color?: ParallelTimelineColor;
  /** Event markers. */
  events: ParallelTimelineEvent[];
  /** Stable identifier. */
  id: string;
  /** Display name. */
  name: ReactNode;
  /** Optional region label rendered next to the name. */
  region?: ReactNode;
};

/**
 * Background era band rendered behind every track.
 *
 * @public
 */
export type ParallelTimelineEra = {
  /** Color theme — drives the band tint. Defaults to `"neutral"`. */
  color?: ParallelTimelineColor;
  /** End year (inclusive). */
  end: number;
  /** Stable identifier. */
  id: string;
  /** Display name. */
  name: ReactNode;
  /** Start year (inclusive). */
  start: number;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type ParallelTimelineLabels = {
  /** Aria-label for the timeline region. Defaults to `"Parallel timeline"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Parallel timeline",
} as const satisfies Required<ParallelTimelineLabels>;

/**
 * Props for {@link ParallelTimeline}.
 *
 * @public
 */
export type ParallelTimelineProps = {
  /** End year (positive for CE). */
  endYear: number;
  /** Optional background era bands shared across tracks. */
  eras?: ParallelTimelineEra[];
  /** Localizable strings. */
  labels?: ParallelTimelineLabels;
  /** Start year (negative for BCE). */
  startYear: number;
  /** Number of axis ticks to render. Defaults to `8`. */
  tickCount?: number;
  /** Track list, rendered in order. */
  tracks: ParallelTimelineTrack[];
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
  eras: ParallelTimelineEra[];
  startYear: number;
};

function EraBands({ endYear, eras, startYear }: EraBandsProps): ReactNode {
  if (eras.length === 0) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {eras.map((era) => {
        const left = yearToPercent(era.start, startYear, endYear);
        const right = yearToPercent(era.end, startYear, endYear);
        const width = Math.max(0, right - left);
        if (width <= 0) return null;
        const palette = COLOR_CLASSES[era.color ?? "neutral"];
        return (
          <div
            className={cn("absolute inset-y-0", palette.chip)}
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

type EventMarkerProps = {
  color: ParallelTimelineColor;
  endYear: number;
  event: ParallelTimelineEvent;
  startYear: number;
};

function EventMarker({
  color,
  endYear,
  event,
  startYear,
}: EventMarkerProps): ReactNode {
  if (event.year < startYear || event.year > endYear) return null;
  const left = yearToPercent(event.year, startYear, endYear);
  const palette = COLOR_CLASSES[color];
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
      <div className="absolute left-1/2 top-4 w-40 -translate-x-1/2 text-center">
        <p className="truncate text-xs font-medium text-foreground">
          {event.title}
        </p>
        <p className="truncate text-[10px] text-muted-foreground">
          {formatYear(event.year)}
          {event.meta ? <span> · {event.meta}</span> : null}
        </p>
      </div>
    </div>
  );
}

type TrackRowProps = {
  endYear: number;
  startYear: number;
  track: ParallelTimelineTrack;
};

function TrackRow({ endYear, startYear, track }: TrackRowProps): ReactNode {
  const color = track.color ?? "neutral";
  const palette = COLOR_CLASSES[color];
  return (
    <div className="relative flex items-stretch gap-3 border-t border-border first:border-t-0">
      <div className="flex w-32 shrink-0 flex-col gap-1 border-r border-border bg-muted/20 px-3 py-3">
        <span
          aria-hidden="true"
          className={cn("h-1 w-8 rounded-full", palette.accent)}
        />
        <p className="text-sm font-semibold tracking-tight text-foreground">
          {track.name}
        </p>
        {track.region ? (
          <p className="text-xs text-muted-foreground">{track.region}</p>
        ) : null}
      </div>
      <div
        aria-label={typeof track.name === "string" ? track.name : undefined}
        className="relative h-16 min-w-0 flex-1"
        data-track-id={track.id}
      >
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
        {track.events.map((event) => (
          <EventMarker
            color={color}
            endYear={endYear}
            event={event}
            key={event.id}
            startYear={startYear}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Multi-track timeline with a shared time axis. Renders each track as a
 * horizontal lane with event markers positioned by year. Negative years
 * render as `BCE`, positive as `CE`. Background era bands span every
 * track when the consumer passes `eras`.
 *
 * Cross-track connectors, synchronized pan/zoom, collapsible tracks,
 * and click-to-compare are intentionally **out of scope** — drive them
 * from consumer code via the data slots.
 *
 * @example
 * ```tsx
 * <ParallelTimeline
 *   startYear={-500}
 *   endYear={500}
 *   eras={[{ id: "antiquity", name: "Antiquity", start: -500, end: 500, color: "neutral" }]}
 *   tracks={[
 *     {
 *       id: "rome",
 *       name: "Rome",
 *       color: "red",
 *       events: [
 *         { id: "augustus", year: -27, title: "Augustus becomes Emperor" },
 *         { id: "fall", year: 476, title: "Fall of Western Rome" },
 *       ],
 *     },
 *     {
 *       id: "china",
 *       name: "China",
 *       color: "amber",
 *       events: [
 *         { id: "qin", year: -221, title: "Qin unifies China" },
 *         { id: "han-end", year: 220, title: "End of Han Dynasty" },
 *       ],
 *     },
 *   ]}
 * />
 * ```
 *
 * @public
 */
export const ParallelTimeline = forwardRef<HTMLElement, ParallelTimelineProps>(
  (props, ref) => {
    const {
      className,
      endYear,
      eras = [],
      labels,
      startYear,
      tickCount = DEFAULT_TICK_COUNT,
      tracks,
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
          "flex w-full flex-col overflow-x-auto rounded-2xl border bg-background text-foreground",
          className,
        )}
        ref={ref}
        {...rest}
      >
        <div className="flex items-stretch gap-3 border-b border-border">
          <div aria-hidden="true" className="w-32 shrink-0" />
          <Axis ticks={ticks} />
        </div>
        <div className="relative">
          <EraBands endYear={endYear} eras={eras} startYear={startYear} />
          {tracks.map((track) => (
            <TrackRow
              endYear={endYear}
              key={track.id}
              startYear={startYear}
              track={track}
            />
          ))}
        </div>
      </section>
    );
  },
);
ParallelTimeline.displayName = "ParallelTimeline";
