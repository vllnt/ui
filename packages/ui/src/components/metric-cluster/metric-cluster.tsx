"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

import { cn } from "../../lib/utils";

/**
 * Tone of a single metric line — drives the dot color.
 *
 * @public
 */
export type MetricClusterTone = "danger" | "neutral" | "success" | "warn";

const TONE_DOT: Record<MetricClusterTone, string> = {
  danger: "bg-red-500",
  neutral: "bg-muted-foreground",
  success: "bg-emerald-500",
  warn: "bg-amber-500",
};

/**
 * Anchor corner relative to the canvas object the cluster attaches to.
 *
 * @public
 */
export type MetricClusterAnchor =
  | "bottom-left"
  | "bottom-right"
  | "top-left"
  | "top-right";

const ANCHOR_TRANSFORM: Record<MetricClusterAnchor, string> = {
  "bottom-left": "translate(-100%, 100%)",
  "bottom-right": "translate(0%, 100%)",
  "top-left": "translate(-100%, -100%)",
  "top-right": "translate(0%, -100%)",
};

/**
 * One metric in the cluster.
 *
 * @public
 */
export type MetricClusterEntry = {
  /** Stable identifier — used as the React key + analytics hook. */
  id: string;
  /** Short label (e.g. `"errs/min"`). */
  label: ReactNode;
  /** Optional tone for the leading dot. Defaults to `"neutral"`. */
  tone?: MetricClusterTone;
  /** Display value (already formatted by host). */
  value: ReactNode;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type MetricClusterLabels = {
  /** Aria-label override. Defaults to `"Metric cluster"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Metric cluster",
} as const satisfies Required<MetricClusterLabels>;

/**
 * Props for {@link MetricCluster}.
 *
 * @public
 */
export type MetricClusterProps = {
  /** Anchor corner. Defaults to `"top-right"`. */
  anchor?: MetricClusterAnchor;
  /** Localizable strings. */
  labels?: MetricClusterLabels;
  /** Metric entries in render order. */
  metrics: MetricClusterEntry[];
  /** Optional cluster title rendered above the rows. */
  title?: ReactNode;
  /** Anchor X in canvas pixels. */
  x: number;
  /** Anchor Y in canvas pixels. */
  y: number;
} & ComponentPropsWithoutRef<"div">;

const Row = (props: { entry: MetricClusterEntry }): React.ReactElement => {
  const { entry } = props;
  const tone = entry.tone ?? "neutral";
  return (
    <li
      className="flex items-center justify-between gap-2 text-[11px]"
      data-metric-cluster-row={entry.id}
      data-metric-cluster-tone={tone}
    >
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <span
          aria-hidden="true"
          className={cn("size-1.5 rounded-full", TONE_DOT[tone])}
        />
        {entry.label}
      </span>
      <span className="font-semibold text-foreground">{entry.value}</span>
    </li>
  );
};

/**
 * Compact stack of related metrics pinned to a canvas object's corner.
 * Use when a single `StickyMetric` doesn't carry enough signal — for
 * runs whose throughput, latency, and error rate must all be visible
 * at once. Pure presentation; the host supplies the anchor coords + the
 * metric list.
 *
 * The wrapper is `pointer-events: none` — host gestures pass through.
 *
 * @example
 * ```tsx
 * <MetricCluster
 *   x={420} y={180}
 *   anchor="top-right"
 *   title="research-2025"
 *   metrics={[
 *     { id: "qps",  label: "qps",   value: "240", tone: "success" },
 *     { id: "errs", label: "errs",  value: "14",  tone: "danger" },
 *     { id: "p95",  label: "p95",   value: "180ms" },
 *   ]}
 * />
 * ```
 *
 * @public
 */
export const MetricCluster = forwardRef<HTMLDivElement, MetricClusterProps>(
  (props, ref) => {
    const {
      anchor = "top-right",
      className,
      labels,
      metrics,
      title,
      x,
      y,
      ...rest
    } = props;
    const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
    return (
      <div
        aria-label={resolvedLabels.region}
        className={cn(
          "pointer-events-none absolute z-20 flex flex-col gap-1 rounded-md border border-border bg-background/90 p-2 shadow-sm backdrop-blur",
          className,
        )}
        data-metric-cluster
        data-metric-cluster-anchor={anchor}
        ref={ref}
        role="status"
        style={{
          left: x,
          top: y,
          transform: ANCHOR_TRANSFORM[anchor],
        }}
        {...rest}
      >
        {title ? (
          <header
            className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
            data-metric-cluster-title
          >
            {title}
          </header>
        ) : null}
        <ul className="space-y-0.5">
          {metrics.map((entry) => (
            <Row entry={entry} key={entry.id} />
          ))}
        </ul>
      </div>
    );
  },
);
MetricCluster.displayName = "MetricCluster";
