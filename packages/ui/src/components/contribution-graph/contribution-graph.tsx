import * as React from "react";

import { cn } from "../../lib/utils";

/**
 * A single day cell of a {@link ContributionGraph}.
 *
 * @public
 */
export type ContributionDay = {
  /** Contribution count for the day. */
  count: number;
  /** ISO date string (`YYYY-MM-DD`). */
  date: string;
};

/**
 * Props for {@link ContributionGraph}.
 *
 * @public
 */
export type ContributionGraphProps = {
  /** Gap between cells in pixels. @defaultValue 3 */
  cellGap?: number;
  /** Square cell size in pixels. @defaultValue 12 */
  cellSize?: number;
  /** Color of the cells. Defaults to `currentColor` to follow the text token. */
  color?: string;
  /** One entry per day. Missing days render as empty cells. */
  data: ContributionDay[];
  /** Number of intensity buckets above zero. @defaultValue 4 */
  levels?: number;
  /** Optional cap on week columns; keeps the most recent weeks. */
  weeks?: number;
} & React.HTMLAttributes<HTMLDivElement>;

const DEFAULT_CELL_SIZE = 12;
const DEFAULT_CELL_GAP = 3;
const DEFAULT_LEVELS = 4;
const DAYS_PER_WEEK = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

type Cell = { count: number; date: string; level: number };

function parseDay(value: string): null | number {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return null;
  const date = new Date(parsed);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function isoFromUtc(time: number): string {
  return new Date(time).toISOString().slice(0, 10);
}

function bucket(count: number, max: number, levels: number): number {
  if (count <= 0 || max <= 0) return 0;
  return Math.min(levels, Math.ceil((count / max) * levels));
}

function countByDay(data: ContributionDay[]): Map<number, number> {
  return data.reduce<Map<number, number>>((map, entry) => {
    const time = parseDay(entry.date);
    if (time !== null) map.set(time, (map.get(time) ?? 0) + entry.count);
    return map;
  }, new Map());
}

function buildWeeks(
  data: ContributionDay[],
  levels: number,
  weeksLimit?: number,
): Cell[][] {
  const counts = countByDay(data);
  if (counts.size === 0) return [];

  const times = [...counts.keys()];
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const start = minTime - new Date(minTime).getUTCDay() * MS_PER_DAY;
  const end = maxTime + (6 - new Date(maxTime).getUTCDay()) * MS_PER_DAY;
  const maxCount = Math.max(...counts.values());
  const weekCount =
    Math.round((end - start) / (DAYS_PER_WEEK * MS_PER_DAY)) + 1;

  const weeks = Array.from({ length: weekCount }, (_week, weekIndex) =>
    Array.from({ length: DAYS_PER_WEEK }, (_day, dayIndex) => {
      const time = start + (weekIndex * DAYS_PER_WEEK + dayIndex) * MS_PER_DAY;
      const count = counts.get(time) ?? 0;
      return {
        count,
        date: isoFromUtc(time),
        level: bucket(count, maxCount, levels),
      };
    }),
  );

  if (weeksLimit && weeks.length > weeksLimit) {
    return weeks.slice(weeks.length - weeksLimit);
  }
  return weeks;
}

function cellOpacity(level: number, levels: number): number {
  if (level <= 0) return 0.1;
  return 0.25 + 0.75 * (level / levels);
}

/**
 * Token-styled SVG contribution graph (GitHub-style activity heatmap).
 *
 * Pure SVG, no chart dependency. The chart buckets days into intensity levels
 * and draws a week-by-weekday grid from `currentColor` with stepped opacity, so
 * the heatmap follows the active theme. Returns `null` without dated entries.
 *
 * @example
 * ```tsx
 * <ContributionGraph
 *   className="text-primary"
 *   data={[
 *     { date: "2026-01-01", count: 2 },
 *     { date: "2026-01-02", count: 7 },
 *   ]}
 * />
 * ```
 *
 * @public
 */
export const ContributionGraph = React.forwardRef<
  HTMLDivElement,
  ContributionGraphProps
>(
  (
    {
      cellGap = DEFAULT_CELL_GAP,
      cellSize = DEFAULT_CELL_SIZE,
      className,
      color = "currentColor",
      data,
      levels = DEFAULT_LEVELS,
      weeks,
      ...props
    },
    ref,
  ) => {
    const ringLevels = Math.max(1, levels);
    const columns = buildWeeks(data, ringLevels, weeks);
    if (columns.length === 0) return null;

    const step = cellSize + cellGap;
    const width = columns.length * step - cellGap;
    const height = DAYS_PER_WEEK * step - cellGap;

    return (
      <div
        className={cn(
          "rounded-2xl border border-border bg-background/40 p-3",
          className,
        )}
        ref={ref}
        {...props}
      >
        <svg
          aria-label="Contribution graph"
          className="h-full w-full"
          height={height}
          role="img"
          viewBox={`0 0 ${width} ${height}`}
          width={width}
        >
          {columns.map((column, weekIndex) =>
            column.map((cell, dayIndex) => (
              <rect
                fill={color}
                fillOpacity={cellOpacity(cell.level, ringLevels)}
                height={cellSize}
                key={cell.date}
                rx={2}
                width={cellSize}
                x={weekIndex * step}
                y={dayIndex * step}
              >
                <title>{`${cell.date}: ${cell.count.toLocaleString()}`}</title>
              </rect>
            )),
          )}
        </svg>
      </div>
    );
  },
);

ContributionGraph.displayName = "ContributionGraph";
