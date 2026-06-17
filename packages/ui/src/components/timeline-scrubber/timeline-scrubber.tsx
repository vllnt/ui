"use client";

import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type ReactNode,
  useId,
} from "react";

import { cn } from "../../lib/utils";

/**
 * One milestone tick rendered along the scrubber track.
 *
 * @public
 */
export type TimelineTick = {
  /** Stable identifier — used as the React key + analytics hook. */
  id: string;
  /** Optional accessible label (e.g. `"deploy"`, `"alert"`). */
  label?: ReactNode;
  /** Optional tone for the tick. Defaults to `"neutral"`. */
  tone?: TimelineScrubberTone;
  /** Time value of the tick. */
  value: number;
};

/**
 * Tone of the scrubber's filled track + handle.
 *
 * @public
 */
export type TimelineScrubberTone =
  | "danger"
  | "neutral"
  | "primary"
  | "success"
  | "warn";

const TONE_FILL: Record<TimelineScrubberTone, string> = {
  danger: "bg-red-500",
  neutral: "bg-foreground",
  primary: "bg-blue-500",
  success: "bg-emerald-500",
  warn: "bg-amber-500",
};

/**
 * Localizable strings.
 *
 * @public
 */
export type TimelineScrubberLabels = {
  /** Aria-label for the slider. Defaults to `"Timeline scrubber"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Timeline scrubber",
} as const satisfies Required<TimelineScrubberLabels>;

/**
 * Props for {@link TimelineScrubber}.
 *
 * @public
 */
export type TimelineScrubberProps = {
  /** End of the time range. Must be `> start`. */
  end: number;
  /** Optional formatter for the cursor + endpoint labels. Receives the raw value. */
  formatValue?: (value: number) => ReactNode;
  /** Localizable strings. */
  labels?: TimelineScrubberLabels;
  /** Change handler — receives the new clamped value. */
  onValueChange: (value: number) => void;
  /** Start of the time range. */
  start: number;
  /** Step granularity for the underlying range input. Defaults to `1`. */
  step?: number;
  /** Optional milestone ticks rendered along the track. */
  ticks?: TimelineTick[];
  /** Tone of the filled track + handle. Defaults to `"primary"`. */
  tone?: TimelineScrubberTone;
  /** Current scrub value `start..end`. */
  value: number;
} & Omit<ComponentPropsWithoutRef<"div">, "onChange">;

const clamp = (v: number, min: number, max: number): number => {
  if (v < min) {
    return min;
  }
  if (v > max) {
    return max;
  }
  return v;
};

type LabelsRow = {
  clamped: number;
  end: number;
  formatValue?: (value: number) => ReactNode;
  start: number;
};

const Labels = (props: LabelsRow): React.ReactElement => {
  const fmt = props.formatValue;
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span data-timeline-scrubber-start>
        {fmt ? fmt(props.start) : props.start}
      </span>
      <span
        className="font-semibold text-foreground"
        data-timeline-scrubber-cursor
      >
        {fmt ? fmt(props.clamped) : props.clamped}
      </span>
      <span data-timeline-scrubber-end>{fmt ? fmt(props.end) : props.end}</span>
    </div>
  );
};

type TrackInput = {
  ariaLabel: string;
  inputId: string;
  max: number;
  min: number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  ratio: number;
  scrubberId: string;
  span: number;
  start: number;
  step: number;
  ticks?: TimelineTick[];
  tone: TimelineScrubberTone;
  value: number;
};

const Track = (props: TrackInput): React.ReactElement => (
  <div className="relative h-6">
    <span
      aria-hidden="true"
      className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted"
    />
    <span
      aria-hidden="true"
      className={cn(
        "absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full",
        TONE_FILL[props.tone],
      )}
      data-timeline-scrubber-fill
      style={{ width: `${props.ratio * 100}%` }}
    />
    {props.ticks?.map((tick) => (
      <TickMark
        key={tick.id}
        scrubberId={props.scrubberId}
        span={props.span}
        start={props.start}
        tick={tick}
      />
    ))}
    <input
      aria-label={props.ariaLabel}
      className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      data-timeline-scrubber-input
      id={props.inputId}
      max={props.max}
      min={props.min}
      onChange={props.onChange}
      step={props.step}
      type="range"
      value={props.value}
    />
  </div>
);

const TickMark = (props: {
  scrubberId: string;
  span: number;
  start: number;
  tick: TimelineTick;
}): React.ReactElement => {
  const { scrubberId, span, start, tick } = props;
  const ratio = clamp((tick.value - start) / span, 0, 1);
  const tone = tick.tone ?? "neutral";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute top-1/2 h-2.5 w-px -translate-y-1/2 rounded-full",
        TONE_FILL[tone],
      )}
      data-scrubber-tick={tick.id}
      data-scrubber-tick-of={scrubberId}
      data-scrubber-tick-tone={tone}
      style={{ left: `${ratio * 100}%` }}
      title={typeof tick.label === "string" ? tick.label : undefined}
    />
  );
};

/**
 * Range slider for scrubbing through canvas state playback. Renders a
 * thin track with optional milestone ticks plus the current value
 * cursor; the underlying `<input type="range">` keeps keyboard +
 * pointer + screen-reader semantics for free.
 *
 * Pure presentation; the host owns the value + drives playback in its
 * own loop. Pair with {@link "../playback-ghost/playback-ghost".PlaybackGhost} to fade the canvas
 * back to historical state as the user scrubs.
 *
 * @example
 * ```tsx
 * <TimelineScrubber
 *   start={0} end={3600}
 *   value={cursor}
 *   onValueChange={setCursor}
 *   ticks={milestones}
 *   formatValue={(v) => formatDuration(v)}
 * />
 * ```
 *
 * @public
 */
export const TimelineScrubber = ({
  ref,
  ...props
}: TimelineScrubberProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const {
    className,
    end,
    formatValue,
    labels,
    onValueChange,
    start,
    step = 1,
    ticks,
    tone = "primary",
    value,
    ...rest
  } = props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  const inputId = useId();
  const safeEnd = end <= start ? start + 1 : end;
  const span = safeEnd - start;
  const clamped = clamp(value, start, safeEnd);
  const ratio = clamp((clamped - start) / span, 0, 1);
  const handleScrubberValueChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    onValueChange(clamp(Number(event.target.value), start, safeEnd));
  };
  return (
    <div
      aria-label={resolvedLabels.region}
      className={cn(
        "flex w-full flex-col gap-1 text-[11px] text-muted-foreground",
        className,
      )}
      data-timeline-scrubber
      data-timeline-tone={tone}
      ref={ref}
      role="group"
      {...rest}
    >
      <Labels
        clamped={clamped}
        end={safeEnd}
        formatValue={formatValue}
        start={start}
      />
      <Track
        ariaLabel={resolvedLabels.region}
        inputId={inputId}
        max={safeEnd}
        min={start}
        onChange={handleScrubberValueChange}
        ratio={ratio}
        scrubberId={inputId}
        span={span}
        start={start}
        step={step}
        ticks={ticks}
        tone={tone}
        value={clamped}
      />
    </div>
  );
};
TimelineScrubber.displayName = "TimelineScrubber";
