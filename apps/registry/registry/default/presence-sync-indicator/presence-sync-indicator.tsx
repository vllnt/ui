"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@vllnt/ui";

/**
 * Connection / sync state — drives the dot color + animation.
 *
 * @public
 */
export type PresenceSyncState =
  | "error"
  | "live"
  | "offline"
  | "reconnecting"
  | "syncing";

const STATE_LABEL: Record<PresenceSyncState, string> = {
  error: "Sync error",
  live: "Live",
  offline: "Offline",
  reconnecting: "Reconnecting",
  syncing: "Syncing",
};

const STATE_DOT: Record<PresenceSyncState, string> = {
  error: "bg-red-500",
  live: "bg-emerald-500",
  offline: "bg-muted-foreground",
  reconnecting: "bg-amber-500 animate-pulse",
  syncing: "bg-blue-500 animate-pulse",
};

const STATE_TEXT: Record<PresenceSyncState, string> = {
  error: "text-red-700 dark:text-red-300",
  live: "text-emerald-700 dark:text-emerald-300",
  offline: "text-muted-foreground",
  reconnecting: "text-amber-700 dark:text-amber-300",
  syncing: "text-blue-700 dark:text-blue-300",
};

/**
 * Localizable strings.
 *
 * @public
 */
export type PresenceSyncIndicatorLabels = {
  /** Aria-label override. Defaults to `"Presence sync"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Presence sync",
} as const satisfies Required<PresenceSyncIndicatorLabels>;

/**
 * Props for {@link PresenceSyncIndicator}.
 *
 * @public
 */
export type PresenceSyncIndicatorProps = {
  /** Optional override label (defaults to humanized state name). */
  label?: ReactNode;
  /** Localizable strings. */
  labels?: PresenceSyncIndicatorLabels;
  /** Connection state. */
  state: PresenceSyncState;
  /** Optional secondary line (peer count, latency). */
  status?: ReactNode;
} & ComponentPropsWithoutRef<"div">;

/**
 * Compact pill that surfaces live connection + sync health for the
 * canvas. Stays calm: a single dot + one-line label, with a subtle
 * pulse for transient `syncing` / `reconnecting` states.
 *
 * Pure presentation; the host owns the websocket / CRDT loop and maps
 * its diagnostics into one of five canonical states.
 *
 * @example
 * ```tsx
 * <PresenceSyncIndicator state="live" status="3 peers" />
 * <PresenceSyncIndicator state="reconnecting" status="retry 2/5" />
 * ```
 *
 * @public
 */
export const PresenceSyncIndicator = (
  props: PresenceSyncIndicatorProps & React.RefAttributes<HTMLDivElement>,
) => {
  const { className, label, labels, ref, state, status, ...rest } = props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  const text = label ?? STATE_LABEL[state];
  return (
    <div
      aria-label={`${resolvedLabels.region}: ${STATE_LABEL[state]}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2 py-1 text-[11px] shadow-sm",
        className,
      )}
      data-presence-state={state}
      data-presence-sync
      ref={ref}
      role="status"
      {...rest}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", STATE_DOT[state])}
        data-presence-sync-dot
      />
      <span className={cn("font-medium", STATE_TEXT[state])}>{text}</span>
      {status ? (
        <span
          className="text-[10px] text-muted-foreground"
          data-presence-sync-status
        >
          {status}
        </span>
      ) : null}
    </div>
  );
};
PresenceSyncIndicator.displayName = "PresenceSyncIndicator";
