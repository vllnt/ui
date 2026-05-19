"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@vllnt/ui";

/**
 * Beacon urgency.
 *
 * @public
 */
export type HandoffBeaconLevel = "info" | "request" | "urgent";

const LEVEL_RING: Record<HandoffBeaconLevel, string> = {
  info: "ring-blue-500",
  request: "ring-amber-500",
  urgent: "ring-red-500 animate-pulse",
};

const LEVEL_DOT: Record<HandoffBeaconLevel, string> = {
  info: "bg-blue-500",
  request: "bg-amber-500",
  urgent: "bg-red-500",
};

/**
 * Localizable strings.
 *
 * @public
 */
export type HandoffBeaconLabels = {
  /** Aria-label for the beacon. Defaults to `"Attention"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Attention",
} as const satisfies Required<HandoffBeaconLabels>;

/**
 * Props for {@link HandoffBeacon}.
 *
 * @public
 */
export type HandoffBeaconProps = {
  /** Localizable strings. */
  labels?: HandoffBeaconLabels;
  /** Urgency level. Defaults to `"info"`. */
  level?: HandoffBeaconLevel;
  /** Optional message body rendered inside the beacon. */
  message?: ReactNode;
  /** Origin participant name (who is requesting attention). */
  source?: ReactNode;
  /** X coordinate in container px. */
  x: number;
  /** Y coordinate in container px. */
  y: number;
} & Omit<ComponentPropsWithoutRef<"div">, "style">;

/**
 * Attention-routing beacon. Drop a beacon at the position a remote
 * participant wants to redirect attention to — the local user sees a
 * pulsing ring + optional message at that coordinate. Pure
 * presentation; the host pipes the request through your realtime
 * channel and unmounts the beacon on dismiss.
 *
 * @example
 * ```tsx
 * <HandoffBeacon
 *   x={120}
 *   y={80}
 *   level="urgent"
 *   source="Sam"
 *   message="Take this — schema mismatch"
 * />
 * ```
 *
 * @public
 */
export const HandoffBeacon = (
  props: HandoffBeaconProps & React.RefAttributes<HTMLDivElement>,
) => {
  const {
    className,
    labels,
    level = "info",
    message,
    ref,
    source,
    x,
    y,
    ...rest
  } = props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  return (
    <div
      aria-label={resolvedLabels.region}
      className={cn(
        "pointer-events-none absolute z-30 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1",
        className,
      )}
      data-handoff-level={level}
      ref={ref}
      role="status"
      style={{ left: `${x.toString()}px`, top: `${y.toString()}px` }}
      {...rest}
    >
      <span
        aria-hidden="true"
        className={cn(
          "block size-3 rounded-full ring-2 ring-offset-2 ring-offset-background",
          LEVEL_DOT[level],
          LEVEL_RING[level],
        )}
      />
      {source || message ? (
        <div
          className="pointer-events-auto rounded-md border border-border bg-popover px-2 py-1 text-center text-[11px] font-medium shadow-md"
          data-handoff-card
        >
          {source ? (
            <p className="text-foreground">
              <span className="font-semibold">{source}</span>
              {message ? (
                <span className="text-muted-foreground"> · </span>
              ) : null}
              {message ? <span>{message}</span> : null}
            </p>
          ) : message ? (
            <p className="text-foreground">{message}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
HandoffBeacon.displayName = "HandoffBeacon";
