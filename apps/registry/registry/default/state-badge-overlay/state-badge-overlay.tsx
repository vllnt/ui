"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@vllnt/ui";

/**
 * State name — drives the badge tone.
 *
 * @public
 */
export type StateBadgeState =
  | "complete"
  | "failed"
  | "idle"
  | "queued"
  | "running"
  | "stopped";

const STATE_LABEL: Record<StateBadgeState, string> = {
  complete: "Complete",
  failed: "Failed",
  idle: "Idle",
  queued: "Queued",
  running: "Running",
  stopped: "Stopped",
};

const STATE_TONE: Record<StateBadgeState, string> = {
  complete:
    "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  failed: "border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-300",
  idle: "border-border bg-muted/40 text-muted-foreground",
  queued:
    "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300",
  running: "border-blue-500/40 bg-blue-500/15 text-blue-700 dark:text-blue-300",
  stopped: "border-border bg-background text-foreground",
};

const STATE_DOT: Record<StateBadgeState, string> = {
  complete: "bg-emerald-500",
  failed: "bg-red-500",
  idle: "bg-muted-foreground",
  queued: "bg-amber-500",
  running: "bg-blue-500 animate-pulse",
  stopped: "bg-muted-foreground",
};

/**
 * Anchor corner relative to the canvas object the badge attaches to.
 *
 * @public
 */
export type StateBadgeAnchor =
  | "bottom-left"
  | "bottom-right"
  | "top-left"
  | "top-right";

const ANCHOR_TRANSFORM: Record<StateBadgeAnchor, string> = {
  "bottom-left": "translate(-100%, 100%)",
  "bottom-right": "translate(0%, 100%)",
  "top-left": "translate(-100%, -100%)",
  "top-right": "translate(0%, -100%)",
};

/**
 * Localizable strings.
 *
 * @public
 */
export type StateBadgeOverlayLabels = {
  /** Aria-label override. Defaults to `"State"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "State",
} as const satisfies Required<StateBadgeOverlayLabels>;

/**
 * Props for {@link StateBadgeOverlay}.
 *
 * @public
 */
export type StateBadgeOverlayProps = {
  /** Anchor corner. Defaults to `"top-right"`. */
  anchor?: StateBadgeAnchor;
  /** Optional override label (defaults to humanized state name). */
  label?: ReactNode;
  /** Localizable strings. */
  labels?: StateBadgeOverlayLabels;
  /** State to display. */
  state: StateBadgeState;
  /** Anchor X in canvas pixels. */
  x: number;
  /** Anchor Y in canvas pixels. */
  y: number;
} & ComponentPropsWithoutRef<"div">;

/**
 * State chip pinned to a canvas object's corner. Use when a single-
 * letter glyph in `ObjectCard` doesn't carry enough signal — for
 * runs that have transitioned, jobs that failed, agents idling. Pure
 * presentation; the host computes the anchor from the object's
 * bounding box.
 *
 * The wrapper is `pointer-events: none` — host gestures pass through.
 *
 * @example
 * ```tsx
 * <div className="relative h-screen w-screen">
 *   <Canvas />
 *   <StateBadgeOverlay state="running" x={420} y={180} anchor="top-right" />
 * </div>
 * ```
 *
 * @public
 */
export const StateBadgeOverlay = (
  props: StateBadgeOverlayProps & React.RefAttributes<HTMLDivElement>,
) => {
  const {
    anchor = "top-right",
    className,
    label,
    labels,
    ref,
    state,
    x,
    y,
    ...rest
  } = props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  const text = label ?? STATE_LABEL[state];
  return (
    <div
      aria-label={`${resolvedLabels.region}: ${STATE_LABEL[state]}`}
      className={cn(
        "pointer-events-none absolute z-20 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide shadow-sm backdrop-blur",
        STATE_TONE[state],
        className,
      )}
      data-state-anchor={anchor}
      data-state-badge-overlay
      data-state-name={state}
      ref={ref}
      role="status"
      style={{
        left: x,
        top: y,
        transform: ANCHOR_TRANSFORM[anchor],
      }}
      {...rest}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", STATE_DOT[state])}
        data-state-badge-dot
      />
      {text}
    </div>
  );
};
StateBadgeOverlay.displayName = "StateBadgeOverlay";
