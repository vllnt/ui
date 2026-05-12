"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

import { cn } from "@vllnt/ui";

/**
 * Tone of an event — drives the leading dot color.
 *
 * @public
 */
export type ActivityStripTone =
  | "danger"
  | "info"
  | "neutral"
  | "success"
  | "warn";

const TONE_DOT: Record<ActivityStripTone, string> = {
  danger: "bg-red-500",
  info: "bg-blue-500",
  neutral: "bg-muted-foreground",
  success: "bg-emerald-500",
  warn: "bg-amber-500",
};

/**
 * One event in the strip.
 *
 * @public
 */
export type ActivityEvent = {
  /** Stable identifier — used as the React key + analytics hook. */
  id: string;
  /** Short label (e.g. `"deploy completed"`). */
  label: ReactNode;
  /** Optional click handler — when provided, the chip becomes a button. */
  onActivate?: () => void;
  /** Optional tone for the leading dot. Defaults to `"neutral"`. */
  tone?: ActivityStripTone;
  /** Pre-formatted timestamp (host owns formatting). */
  ts: ReactNode;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type BottomActivityStripLabels = {
  /** Empty-state copy. Defaults to `"No recent activity"`. */
  empty?: string;
  /** Aria-label for the strip. Defaults to `"Recent activity"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  empty: "No recent activity",
  region: "Recent activity",
} as const satisfies Required<BottomActivityStripLabels>;

/**
 * Props for {@link BottomActivityStrip}.
 *
 * @public
 */
export type BottomActivityStripProps = {
  /** Event entries — newest first. */
  events: ActivityEvent[];
  /** Localizable strings. */
  labels?: BottomActivityStripLabels;
  /** Cap the rendered events. The component drops the tail without warning. */
  maxEvents?: number;
} & ComponentPropsWithoutRef<"section">;

const ChipBody = (props: { event: ActivityEvent }): React.ReactElement => {
  const { event } = props;
  const tone = event.tone ?? "neutral";
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap">
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", TONE_DOT[tone])}
      />
      <span className="text-foreground">{event.label}</span>
      <span className="text-[10px] text-muted-foreground" data-strip-event-ts>
        {event.ts}
      </span>
    </span>
  );
};

const Chip = (props: { event: ActivityEvent }): React.ReactElement => {
  const { event } = props;
  const tone = event.tone ?? "neutral";
  if (event.onActivate) {
    const handleActivateEvent = (): void => {
      event.onActivate?.();
    };
    return (
      <button
        className="flex items-center rounded-full border border-border bg-background px-2 py-1 text-[11px] transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        data-strip-event={event.id}
        data-strip-event-tone={tone}
        onClick={handleActivateEvent}
        type="button"
      >
        <ChipBody event={event} />
      </button>
    );
  }
  return (
    <span
      className="flex items-center rounded-full border border-border bg-background px-2 py-1 text-[11px]"
      data-strip-event={event.id}
      data-strip-event-tone={tone}
    >
      <ChipBody event={event} />
    </span>
  );
};

/**
 * Slim bottom strip showing a horizontally-scrolling row of recent
 * canvas events. The lowest-noise live execution surface — keep
 * `ObjectCard`, panels, and overlays for high-value surfaces; let the
 * strip carry the steady drip of activity.
 *
 * Pure presentation; the host computes the event list (newest first)
 * and supplies an optional `onActivate` per event to jump to the
 * related object.
 *
 * Distinct from `ActivityLog` (vertical, persistent) and `LiveFeed`
 * (full-height feed): this primitive is a single horizontal row that
 * lives at the bottom of the canvas.
 *
 * @example
 * ```tsx
 * <BottomActivityStrip
 *   events={[
 *     { id: "1", label: "deploy ok", ts: "12s", tone: "success" },
 *     { id: "2", label: "queue spike", ts: "1m", tone: "warn" },
 *   ]}
 *   maxEvents={20}
 * />
 * ```
 *
 * @public
 */
export const BottomActivityStrip = forwardRef<
  HTMLElement,
  BottomActivityStripProps
>((props, ref) => {
  const { className, events, labels, maxEvents, ...rest } = props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  const visible =
    maxEvents === undefined || maxEvents >= events.length
      ? events
      : events.slice(0, maxEvents);
  return (
    <section
      aria-label={resolvedLabels.region}
      className={cn(
        "flex w-full items-center gap-2 overflow-x-auto rounded-md border border-border bg-background/90 px-2 py-1 text-foreground",
        className,
      )}
      data-bottom-activity-strip
      ref={ref}
      {...rest}
    >
      {visible.length === 0 ? (
        <span
          className="px-2 text-[11px] text-muted-foreground"
          data-strip-state="empty"
        >
          {resolvedLabels.empty}
        </span>
      ) : (
        visible.map((event) => <Chip event={event} key={event.id} />)
      )}
    </section>
  );
});
BottomActivityStrip.displayName = "BottomActivityStrip";
