"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

import { cn } from "../../lib/utils";

/**
 * Sync health states.
 *
 * @public
 */
export type SyncStatus = "connected" | "offline" | "reconnecting" | "syncing";

const STATUS_DOT: Record<SyncStatus, string> = {
  connected: "bg-emerald-500",
  offline: "bg-red-500",
  reconnecting: "bg-amber-500 animate-pulse",
  syncing: "bg-blue-500 animate-pulse",
};

const STATUS_LABEL: Record<SyncStatus, string> = {
  connected: "Connected",
  offline: "Offline",
  reconnecting: "Reconnecting",
  syncing: "Syncing",
};

/**
 * Localizable strings.
 *
 * @public
 */
export type PresenceSyncIndicatorLabels = Partial<
  Record<SyncStatus, string>
> & {
  /** Aria-label for the indicator. Defaults to `"Sync status"`. */
  region?: string;
};

const DEFAULT_REGION = "Sync status";

/**
 * Props for {@link PresenceSyncIndicator}.
 *
 * @public
 */
export type PresenceSyncIndicatorProps = {
  /** Optional detail rendered after the label (e.g. latency, last sync time). */
  detail?: ReactNode;
  /** When `true`, hides the status label and shows the colored dot. */
  iconOnly?: boolean;
  /** Localizable strings. */
  labels?: PresenceSyncIndicatorLabels;
  /** Live sync status. */
  status: SyncStatus;
} & ComponentPropsWithoutRef<"div">;

/**
 * Calm sync-health indicator. Pair with a presence channel to surface
 * connection state without alerting on every transient blip — the
 * indicator renders the current status; debounce or animate transitions
 * externally to suppress flicker.
 *
 * @example
 * ```tsx
 * <PresenceSyncIndicator status="connected" detail="42ms" />
 * <PresenceSyncIndicator status="reconnecting" detail="Retrying…" />
 * <PresenceSyncIndicator status="offline" iconOnly />
 * ```
 *
 * @public
 */
export const PresenceSyncIndicator = forwardRef<
  HTMLDivElement,
  PresenceSyncIndicatorProps
>((props, ref) => {
  const {
    className,
    detail,
    iconOnly = false,
    labels,
    status,
    ...rest
  } = props;
  const region = labels?.region ?? DEFAULT_REGION;
  const statusLabel = labels?.[status] ?? STATUS_LABEL[status];
  return (
    <div
      aria-label={region}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-background/95 px-2 py-0.5 text-[11px] font-medium text-foreground shadow-sm backdrop-blur",
        className,
      )}
      data-sync-status={status}
      ref={ref}
      role="status"
      {...rest}
    >
      <span
        aria-hidden="true"
        className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_DOT[status])}
      />
      {iconOnly ? (
        <span className="sr-only">{statusLabel}</span>
      ) : (
        <span>{statusLabel}</span>
      )}
      {!iconOnly && detail ? (
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {detail}
        </span>
      ) : null}
    </div>
  );
});
PresenceSyncIndicator.displayName = "PresenceSyncIndicator";
