"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

import { cn } from "@vllnt/ui";

/**
 * Phase state — drives the bar tone.
 *
 * @public
 */
export type RunPhaseState =
  | "complete"
  | "failed"
  | "queued"
  | "running"
  | "stopped";

const STATE_FILL: Record<RunPhaseState, string> = {
  complete: "bg-emerald-500/70",
  failed: "bg-red-500/70",
  queued: "bg-amber-500/70",
  running: "bg-blue-500/70",
  stopped: "bg-muted-foreground/40",
};

const STATE_LABEL: Record<RunPhaseState, string> = {
  complete: "Complete",
  failed: "Failed",
  queued: "Queued",
  running: "Running",
  stopped: "Stopped",
};

/**
 * One lane in a multi-lane run timeline.
 *
 * @public
 */
export type RunTimelineLane = {
  /** Stable identifier — used as the React key + phase routing. */
  id: string;
  /** Display label rendered to the left of the lane. */
  label: ReactNode;
};

/**
 * One phase block in the run timeline.
 *
 * @public
 */
export type RunTimelinePhase = {
  /** End timestamp in the same units as `start` / `end`. */
  end: number;
  /** Stable identifier — used as the React key + analytics hook. */
  id: string;
  /** Optional label rendered inside the phase bar. */
  label?: ReactNode;
  /** Lane id this phase belongs to. Defaults to `"default"` (single-lane mode). */
  laneId?: string;
  /** Optional click handler — when provided, the phase becomes a button. */
  onActivate?: () => void;
  /** Start timestamp `>= timeline start`. */
  start: number;
  /** Phase state. Defaults to `"running"`. */
  state?: RunPhaseState;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type RunTimelineLabels = {
  /** Empty-state copy. Defaults to `"No phases"`. */
  empty?: string;
  /** Aria-label override. Defaults to `"Run timeline"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  empty: "No phases",
  region: "Run timeline",
} as const satisfies Required<RunTimelineLabels>;

/**
 * Props for {@link RunTimeline}.
 *
 * @public
 */
export type RunTimelineProps = {
  /** Optional cursor position in the same units as the range. Renders a vertical line. */
  cursor?: number;
  /** End of the time range. Must be `> start`. */
  end: number;
  /** Optional formatter for the start / cursor / end labels. */
  formatValue?: (value: number) => ReactNode;
  /** Localizable strings. */
  labels?: RunTimelineLabels;
  /** Optional explicit lane definitions in render order. Required for multi-lane mode. */
  lanes?: RunTimelineLane[];
  /** Phase blocks — order is irrelevant; routed to lanes by `laneId`. */
  phases: RunTimelinePhase[];
  /** Start of the time range. */
  start: number;
} & ComponentPropsWithoutRef<"section">;

const clamp = (v: number, min: number, max: number): number => {
  if (v < min) {
    return min;
  }
  if (v > max) {
    return max;
  }
  return v;
};

const Endpoints = (props: {
  cursor?: number;
  end: number;
  format?: (v: number) => ReactNode;
  start: number;
}): React.ReactElement => {
  const fmt = props.format;
  const showCursor = typeof props.cursor === "number";
  return (
    <div className="flex items-baseline justify-between gap-2 text-[11px] text-muted-foreground">
      <span data-run-timeline-start>
        {fmt ? fmt(props.start) : props.start}
      </span>
      {showCursor ? (
        <span
          className="font-semibold text-foreground"
          data-run-timeline-cursor-label
        >
          {fmt ? fmt(props.cursor ?? 0) : props.cursor}
        </span>
      ) : null}
      <span data-run-timeline-end>{fmt ? fmt(props.end) : props.end}</span>
    </div>
  );
};

const PhaseBar = (props: {
  laneIndex: number;
  laneTotal: number;
  phase: RunTimelinePhase;
  span: number;
  start: number;
}): React.ReactElement => {
  const { laneIndex, laneTotal, phase, span, start } = props;
  const left = clamp((phase.start - start) / span, 0, 1) * 100;
  const right = clamp((phase.end - start) / span, 0, 1) * 100;
  const width = Math.max(right - left, 0.5);
  const top = (laneIndex / laneTotal) * 100;
  const height = 100 / laneTotal;
  const state = phase.state ?? "running";
  const sharedStyle = {
    height: `${height}%`,
    left: `${left}%`,
    top: `${top}%`,
    width: `${width}%`,
  };
  const ariaLabel = `${STATE_LABEL[state]} ${phase.start} → ${phase.end}`;
  if (phase.onActivate) {
    const handleClick = (): void => {
      phase.onActivate?.();
    };
    return (
      <button
        aria-label={ariaLabel}
        className={cn(
          "absolute flex items-center justify-start overflow-hidden truncate rounded-sm border border-border/50 px-1 text-left text-[10px] text-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          STATE_FILL[state],
        )}
        data-run-phase={phase.id}
        data-run-phase-state={state}
        onClick={handleClick}
        style={sharedStyle}
        type="button"
      >
        {phase.label}
      </button>
    );
  }
  return (
    <span
      aria-label={ariaLabel}
      className={cn(
        "absolute flex items-center justify-start overflow-hidden truncate rounded-sm border border-border/50 px-1 text-[10px] text-foreground",
        STATE_FILL[state],
      )}
      data-run-phase={phase.id}
      data-run-phase-state={state}
      role="img"
      style={sharedStyle}
    >
      {phase.label}
    </span>
  );
};

type LaneViewInput = {
  cursor?: number;
  end: number;
  lanes: RunTimelineLane[];
  phases: RunTimelinePhase[];
  start: number;
};

const TrackBody = (props: LaneViewInput): React.ReactElement => {
  const { cursor, end, lanes, phases, start } = props;
  const span = end - start;
  const cursorRatio =
    typeof cursor === "number" ? clamp((cursor - start) / span, 0, 1) : null;
  return (
    <div className="flex items-stretch">
      <div className="flex w-24 flex-col gap-px text-[10px] uppercase tracking-wide text-muted-foreground">
        {lanes.map((lane) => (
          <div
            className="flex h-7 items-center px-2"
            data-run-timeline-lane={lane.id}
            key={lane.id}
          >
            {lane.label}
          </div>
        ))}
      </div>
      <div
        className="relative flex-1 overflow-hidden rounded-md border border-border bg-muted/20"
        data-run-timeline-track
        style={{ height: `${lanes.length * 28}px` }}
      >
        {phases.map((phase) => {
          const index = lanes.findIndex(
            (lane) => lane.id === (phase.laneId ?? "default"),
          );
          if (index === -1) {
            return null;
          }
          return (
            <PhaseBar
              key={phase.id}
              laneIndex={index}
              laneTotal={lanes.length}
              phase={phase}
              span={span}
              start={start}
            />
          );
        })}
        {cursorRatio === null ? null : (
          <span
            aria-hidden="true"
            className="absolute top-0 bottom-0 w-px bg-foreground"
            data-run-timeline-cursor
            style={{ left: `${cursorRatio * 100}%` }}
          />
        )}
      </div>
    </div>
  );
};

const resolveLanes = (
  explicit: RunTimelineLane[] | undefined,
): RunTimelineLane[] => {
  if (explicit && explicit.length > 0) {
    return explicit;
  }
  return [{ id: "default", label: "Run" }];
};

/**
 * Multi-lane execution timeline showing run phases over time. Each
 * phase renders as a colored bar positioned by its start / end and
 * routed to a lane by `laneId`. Optional cursor draws a thin vertical
 * line for the current playback position.
 *
 * Pure presentation; the host computes the phase list from the run's
 * execution history. Pair with {@link "../timeline-scrubber/timeline-scrubber".TimelineScrubber}
 * to drive the cursor.
 *
 * Distinct from `MapTimeline` (geo-aware), `Stepper` (sequential
 * steps), and the timeline family `#32`–`#35`: this primitive is
 * specifically the run history surface inside the canvas.
 *
 * @example
 * ```tsx
 * <RunTimeline
 *   start={0} end={3600}
 *   cursor={1800}
 *   lanes={[
 *     { id: "ingest", label: "Ingest" },
 *     { id: "rank",   label: "Rank" },
 *   ]}
 *   phases={[
 *     { id: "1", laneId: "ingest", start: 0,    end: 600,  state: "complete", label: "load" },
 *     { id: "2", laneId: "rank",   start: 600,  end: 2400, state: "running",  label: "score" },
 *   ]}
 * />
 * ```
 *
 * @public
 */
export const RunTimeline = forwardRef<HTMLElement, RunTimelineProps>(
  (props, ref) => {
    const {
      className,
      cursor,
      end,
      formatValue,
      labels,
      lanes,
      phases,
      start,
      ...rest
    } = props;
    const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
    const safeEnd = end <= start ? start + 1 : end;
    const resolvedLanes = resolveLanes(lanes);
    return (
      <section
        aria-label={resolvedLabels.region}
        className={cn("flex w-full flex-col gap-2", className)}
        data-run-timeline
        ref={ref}
        {...rest}
      >
        <Endpoints
          cursor={cursor}
          end={safeEnd}
          format={formatValue}
          start={start}
        />
        {phases.length === 0 ? (
          <p
            className="rounded-md border border-border bg-muted/20 px-2 py-3 text-center text-[11px] text-muted-foreground"
            data-run-timeline-state="empty"
          >
            {resolvedLabels.empty}
          </p>
        ) : (
          <TrackBody
            cursor={cursor}
            end={safeEnd}
            lanes={resolvedLanes}
            phases={phases}
            start={start}
          />
        )}
      </section>
    );
  },
);
RunTimeline.displayName = "RunTimeline";
