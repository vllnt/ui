"use client";

import { type ComponentPropsWithoutRef, type ReactNode, useMemo } from "react";

import { cn } from "../../lib/utils";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_LOCALE = "en-US";

/**
 * Color theme for a {@link GanttTask}'s bar.
 *
 * @public
 */
export type GanttColor =
  | "amber"
  | "blue"
  | "emerald"
  | "neutral"
  | "purple"
  | "red"
  | "rose";

const COLOR_CLASSES: Record<GanttColor, { bar: string; progress: string }> = {
  amber: {
    bar: "bg-amber-500/30",
    progress: "bg-amber-600 dark:bg-amber-500",
  },
  blue: {
    bar: "bg-blue-500/30",
    progress: "bg-blue-600 dark:bg-blue-500",
  },
  emerald: {
    bar: "bg-emerald-500/30",
    progress: "bg-emerald-600 dark:bg-emerald-500",
  },
  neutral: {
    bar: "bg-muted",
    progress: "bg-muted-foreground",
  },
  purple: {
    bar: "bg-purple-500/30",
    progress: "bg-purple-600 dark:bg-purple-500",
  },
  red: {
    bar: "bg-red-500/30",
    progress: "bg-red-600 dark:bg-red-500",
  },
  rose: {
    bar: "bg-rose-500/30",
    progress: "bg-rose-600 dark:bg-rose-500",
  },
};

/**
 * Time-axis scale.
 *
 * @public
 */
export type GanttScale = "day" | "month" | "quarter" | "week";

/**
 * Localizable strings.
 *
 * @public
 */
export type GanttChartLabels = {
  /** Aria-label prefix for milestone diamonds. Defaults to `"Milestone"`. */
  milestone?: string;
  /** Caption for the today line. Defaults to `"Today"`. */
  today?: string;
};

const DEFAULT_LABELS = {
  milestone: "Milestone",
  today: "Today",
} as const satisfies Required<GanttChartLabels>;

/**
 * One task bar inside a {@link GanttGroup}.
 *
 * @public
 */
export type GanttTask = {
  /** Optional assignee label rendered next to the task title. */
  assignee?: ReactNode;
  /** Optional color theme. Defaults to `"blue"`. */
  color?: GanttColor;
  /** End date (inclusive). ISO string or `Date`. */
  end: Date | string;
  /** Stable identifier. */
  id: string;
  /** Optional progress percentage 0–100. */
  progress?: number;
  /** Start date (inclusive). ISO string or `Date`. */
  start: Date | string;
  /** Task title. */
  title: ReactNode;
};

/**
 * Group of related {@link GanttTask}s.
 *
 * @public
 */
export type GanttGroup = {
  /** Stable identifier. */
  id: string;
  /** Group display name. */
  name: ReactNode;
  /** Tasks rendered in this group. */
  tasks: GanttTask[];
};

/**
 * Vertical milestone marker rendered on the timeline.
 *
 * @public
 */
export type GanttMilestone = {
  /** Date the milestone falls on. */
  date: Date | string;
  /** Stable identifier. */
  id: string;
  /** Milestone title. */
  title: ReactNode;
};

/**
 * Props for {@link GanttChart}.
 *
 * @public
 */
export type GanttChartProps = {
  /** End of the visible time window. */
  endDate: Date | string;
  /** Task groups, rendered in order. */
  groups: GanttGroup[];
  /** Localizable strings. */
  labels?: GanttChartLabels;
  /** BCP-47 locale tag. Defaults to `"en-US"`. */
  locale?: string;
  /** Optional milestone markers. */
  milestones?: GanttMilestone[];
  /** Optional override for the "today" date. Defaults to the current date. */
  now?: Date | string;
  /** Time-axis scale. Drives the tick interval and label format. Defaults to `"month"`. */
  scale?: GanttScale;
  /** Start of the visible time window. */
  startDate: Date | string;
  /** Width allocated to the task name column (left side). Defaults to `200`. */
  taskColumnWidth?: number;
} & ComponentPropsWithoutRef<"div">;

function toDate(value: Date | string): Date {
  return value instanceof Date ? new Date(value.getTime()) : new Date(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function diffInDays(later: Date, earlier: Date): number {
  return (later.getTime() - earlier.getTime()) / MS_PER_DAY;
}

const TICK_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();
function getTickDateTimeFormatter(
  locale: string,
  scale: "day" | "month" | "week",
): Intl.DateTimeFormat {
  const key = `${locale}|${scale}`;
  let formatter = TICK_FORMATTER_CACHE.get(key);
  if (!formatter) {
    const options: Intl.DateTimeFormatOptions =
      scale === "month"
        ? { month: "short", year: "numeric" }
        : { day: "2-digit", month: "short" };
    formatter = new Intl.DateTimeFormat(locale, options);
    TICK_FORMATTER_CACHE.set(key, formatter);
  }
  return formatter;
}

function buildTickFormatter(
  scale: GanttScale,
  locale: string,
): (date: Date) => string {
  switch (scale) {
    case "day":
      return getTickDateTimeFormatter(locale, "day").format;
    case "week":
      return getTickDateTimeFormatter(locale, "week").format;
    case "month":
      return getTickDateTimeFormatter(locale, "month").format;
    case "quarter":
      return (date: Date) => {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter.toString()} ${date.getFullYear().toString()}`;
      };
  }
}

function getTickStep(scale: GanttScale): number {
  switch (scale) {
    case "day":
      return 1;
    case "week":
      return 7;
    case "month":
      return 30;
    case "quarter":
      return 91;
  }
}

type ChartGeometry = {
  end: Date;
  pxPerDay: number;
  start: Date;
  ticks: { label: string; offset: number }[];
  totalDays: number;
};

type TicksInput = {
  end: Date;
  locale: string;
  scale: GanttScale;
  start: Date;
  totalDays: number;
};

function buildTicks(input: TicksInput): { label: string; offset: number }[] {
  const { end, locale, scale, start, totalDays } = input;
  const formatter = buildTickFormatter(scale, locale);
  const stepDays = getTickStep(scale);
  const tickCount = Math.floor(totalDays / stepDays);
  return Array.from({ length: tickCount + 1 })
    .map((_, index) => {
      const day = index * stepDays;
      return {
        date: new Date(start.getTime() + day * MS_PER_DAY),
        offset: day,
      };
    })
    .filter((tick) => tick.date.getTime() <= end.getTime())
    .map((tick) => ({ label: formatter(tick.date), offset: tick.offset }));
}

type GeometryOptions = {
  endDate: Date | string;
  locale: string;
  scale: GanttScale;
  startDate: Date | string;
};

function useChartGeometry(options: GeometryOptions): ChartGeometry {
  const { endDate, locale, scale, startDate } = options;
  return useMemo<ChartGeometry>(() => {
    const start = toDate(startDate);
    const end = toDate(endDate);
    const totalDays = Math.max(1, diffInDays(end, start));
    const ticks = buildTicks({ end, locale, scale, start, totalDays });
    return {
      end,
      pxPerDay: 1 / totalDays,
      start,
      ticks,
      totalDays,
    };
  }, [endDate, locale, scale, startDate]);
}

type TaskBarProps = {
  geometry: ChartGeometry;
  task: GanttTask;
};

function TaskBar({ geometry, task }: TaskBarProps): ReactNode {
  const start = toDate(task.start);
  const end = toDate(task.end);
  const offsetDays = diffInDays(start, geometry.start);
  const durationDays = Math.max(0.5, diffInDays(end, start));
  const leftRatio = clamp(offsetDays / geometry.totalDays, 0, 1);
  const widthRatio = clamp(durationDays / geometry.totalDays, 0, 1 - leftRatio);
  const palette = COLOR_CLASSES[task.color ?? "blue"];
  const progress = clamp(task.progress ?? 0, 0, 100);
  const ariaLabel =
    typeof task.title === "string"
      ? `${task.title} from ${start.toISOString().slice(0, 10)} to ${end.toISOString().slice(0, 10)}, ${progress.toString()} percent complete`
      : undefined;
  return (
    <div
      aria-label={ariaLabel}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={progress}
      className={cn(
        "absolute top-1.5 flex h-5 items-center overflow-hidden rounded-md ring-1 ring-border",
        palette.bar,
      )}
      data-task-id={task.id}
      role="progressbar"
      style={{
        left: `${(leftRatio * 100).toString()}%`,
        width: `${(widthRatio * 100).toString()}%`,
      }}
    >
      <span
        aria-hidden="true"
        className={cn("h-full rounded-md", palette.progress)}
        style={{ width: `${progress.toString()}%` }}
      />
    </div>
  );
}

type MilestoneMarkerProps = {
  geometry: ChartGeometry;
  label: string;
  milestone: GanttMilestone;
};

function MilestoneMarker({
  geometry,
  label,
  milestone,
}: MilestoneMarkerProps): ReactNode {
  const date = toDate(milestone.date);
  const offsetDays = diffInDays(date, geometry.start);
  if (offsetDays < 0 || offsetDays > geometry.totalDays) return null;
  const leftRatio = offsetDays / geometry.totalDays;
  const titleText = typeof milestone.title === "string" ? milestone.title : "";
  return (
    <div
      aria-label={`${label}: ${titleText}`}
      className="absolute top-0 z-10 -ml-1.5 flex flex-col items-center"
      data-milestone-id={milestone.id}
      style={{ left: `${(leftRatio * 100).toString()}%` }}
    >
      <div
        aria-hidden="true"
        className="size-3 rotate-45 bg-amber-500 ring-2 ring-background"
      />
      {titleText ? (
        <span className="mt-0.5 whitespace-nowrap rounded bg-amber-500/20 px-1 text-[10px] font-medium text-amber-900 dark:text-amber-200">
          {titleText}
        </span>
      ) : null}
    </div>
  );
}

type TodayLineProps = {
  geometry: ChartGeometry;
  label: string;
  now: Date;
};

function TodayLine({ geometry, label, now }: TodayLineProps): ReactNode {
  const offsetDays = diffInDays(now, geometry.start);
  if (offsetDays < 0 || offsetDays > geometry.totalDays) return null;
  const leftRatio = offsetDays / geometry.totalDays;
  return (
    <div
      aria-label={label}
      className="pointer-events-none absolute inset-y-0 z-10"
      style={{ left: `${(leftRatio * 100).toString()}%` }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-destructive"
      />
      <span className="absolute -top-5 -translate-x-1/2 whitespace-nowrap rounded bg-destructive/15 px-1 text-[10px] font-semibold uppercase tracking-wide text-destructive">
        {label}
      </span>
    </div>
  );
}

type AxisProps = {
  geometry: ChartGeometry;
};

function Axis({ geometry }: AxisProps): ReactNode {
  return (
    <div className="relative flex h-7 items-end border-b border-border text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {geometry.ticks.map((tick) => (
        <span
          className="absolute -translate-x-1/2 px-1"
          key={tick.offset}
          style={{
            left: `${((tick.offset / geometry.totalDays) * 100).toString()}%`,
          }}
        >
          {tick.label}
        </span>
      ))}
    </div>
  );
}

type TaskRowProps = {
  geometry: ChartGeometry;
  task: GanttTask;
};

function TaskRow({ geometry, task }: TaskRowProps): ReactNode {
  return (
    <div className="relative flex h-8 items-center border-b border-border/40">
      <TaskBar geometry={geometry} task={task} />
    </div>
  );
}

type LeftColumnProps = {
  groups: GanttGroup[];
  taskColumnWidth: number;
};

function LeftColumn({ groups, taskColumnWidth }: LeftColumnProps): ReactNode {
  return (
    <div
      className="flex flex-col border-r border-border bg-background"
      style={{
        minWidth: `${taskColumnWidth.toString()}px`,
        width: `${taskColumnWidth.toString()}px`,
      }}
    >
      <div className="h-7 border-b border-border" />
      {groups.map((group) => (
        <div className="flex flex-col" key={group.id}>
          <div className="flex h-7 items-center border-b border-border/60 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.name}
          </div>
          {group.tasks.map((task) => (
            <div
              className="flex h-8 items-center justify-between gap-2 border-b border-border/40 px-3 text-sm text-foreground"
              key={task.id}
            >
              <span className="truncate">{task.title}</span>
              {task.assignee ? (
                <span className="text-xs text-muted-foreground">
                  {task.assignee}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

type TimelineColumnProps = {
  geometry: ChartGeometry;
  groups: GanttGroup[];
  labels: Required<GanttChartLabels>;
  milestones: GanttMilestone[];
  now: Date;
};

function TimelineColumn({
  geometry,
  groups,
  labels,
  milestones,
  now,
}: TimelineColumnProps): ReactNode {
  return (
    <div className="relative min-w-0 flex-1">
      <Axis geometry={geometry} />
      <div className="relative">
        {groups.map((group) => (
          <div className="flex flex-col" key={group.id}>
            <div className="h-7 border-b border-border/60 bg-muted/20" />
            {group.tasks.map((task) => (
              <TaskRow geometry={geometry} key={task.id} task={task} />
            ))}
          </div>
        ))}
        {milestones.map((milestone) => (
          <MilestoneMarker
            geometry={geometry}
            key={milestone.id}
            label={labels.milestone}
            milestone={milestone}
          />
        ))}
        <TodayLine geometry={geometry} label={labels.today} now={now} />
      </div>
    </div>
  );
}

/**
 * Pure-SVG-free Gantt chart for project planning. Renders task bars with
 * progress overlays, milestone diamonds, and a today indicator across a
 * configurable time scale (day / week / month / quarter). The left column
 * shows group headers and task names; the right column is the timeline.
 *
 * Drag-to-edit, dependency arrows, critical-path highlighting, and
 * virtualization for large datasets are intentionally **out of scope** —
 * the consumer drives those externally and feeds data through `groups`.
 *
 * @example
 * ```tsx
 * <GanttChart
 *   startDate="2026-01-01"
 *   endDate="2026-12-31"
 *   scale="month"
 *   groups={[
 *     {
 *       id: "phase-1",
 *       name: "Phase 1",
 *       tasks: [
 *         { id: "design", title: "Design system", start: "2026-01-15", end: "2026-02-28", progress: 100, color: "blue" },
 *         { id: "core", title: "Core components", start: "2026-02-01", end: "2026-04-15", progress: 65, color: "emerald" },
 *       ],
 *     },
 *   ]}
 *   milestones={[{ id: "v1", date: "2026-04-15", title: "v1.0" }]}
 * />
 * ```
 *
 * @public
 */
export const GanttChart = (
  props: GanttChartProps & React.RefAttributes<HTMLDivElement>,
) => {
  const {
    className,
    endDate,
    groups,
    labels,
    locale = DEFAULT_LOCALE,
    milestones = [],
    now,
    ref,
    scale = "month",
    startDate,
    taskColumnWidth = 200,
    ...rest
  } = props;
  const resolvedLabels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labels }),
    [labels],
  );
  const geometry = useChartGeometry({ endDate, locale, scale, startDate });
  const nowDate = useMemo(() => (now ? toDate(now) : new Date()), [now]);

  return (
    <div
      className={cn(
        "flex w-full overflow-x-auto rounded-2xl border bg-background text-foreground",
        className,
      )}
      ref={ref}
      {...rest}
    >
      <LeftColumn groups={groups} taskColumnWidth={taskColumnWidth} />
      <TimelineColumn
        geometry={geometry}
        groups={groups}
        labels={resolvedLabels}
        milestones={milestones}
        now={nowDate}
      />
    </div>
  );
};
GanttChart.displayName = "GanttChart";
