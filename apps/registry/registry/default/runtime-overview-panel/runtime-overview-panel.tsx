"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@vllnt/ui";

/**
 * Trend direction for a runtime metric.
 *
 * @public
 */
export type RuntimeMetricTrend = "down" | "flat" | "up";

/**
 * Tone of the metric value — drives the dot color.
 *
 * @public
 */
export type RuntimeMetricTone = "danger" | "neutral" | "success" | "warn";

/**
 * One metric tile in the runtime overview.
 *
 * @public
 */
export type RuntimeMetric = {
  /** Optional secondary line (delta, target, owner). */
  detail?: ReactNode;
  /** Stable identifier — used as the React key. */
  id: string;
  /** Short label (e.g. `"Active runs"`). */
  label: ReactNode;
  /** Optional tone for the dot. Defaults to `"neutral"`. */
  tone?: RuntimeMetricTone;
  /** Optional trend arrow next to the value. */
  trend?: RuntimeMetricTrend;
  /** Display value (already formatted by the host). */
  value: ReactNode;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type RuntimeOverviewPanelLabels = {
  /** Empty-state copy. Defaults to `"No runtime metrics"`. */
  empty?: string;
  /** Aria-label for the panel. Defaults to `"Runtime overview"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  empty: "No runtime metrics",
  region: "Runtime overview",
} as const satisfies Required<RuntimeOverviewPanelLabels>;

const TONE_DOT: Record<RuntimeMetricTone, string> = {
  danger: "bg-red-500",
  neutral: "bg-muted-foreground",
  success: "bg-emerald-500",
  warn: "bg-amber-500",
};

const TREND_GLYPH: Record<RuntimeMetricTrend, string> = {
  down: "↓",
  flat: "·",
  up: "↑",
};

/**
 * Props for {@link RuntimeOverviewPanel}.
 *
 * @public
 */
export type RuntimeOverviewPanelProps = {
  /** Localizable strings. */
  labels?: RuntimeOverviewPanelLabels;
  /** Metric tiles in render order. */
  metrics: RuntimeMetric[];
  /** Panel title. Defaults to `"Runtime"`. */
  title?: ReactNode;
} & ComponentPropsWithoutRef<"section">;

const Tile = (props: { metric: RuntimeMetric }): React.ReactElement => {
  const { metric } = props;
  const tone = metric.tone ?? "neutral";
  return (
    <li
      className="flex flex-col gap-1 rounded-md border border-border/60 bg-muted/20 px-2.5 py-2"
      data-runtime-metric={metric.id}
      data-runtime-tone={tone}
    >
      <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        <span
          aria-hidden="true"
          className={cn("size-1.5 rounded-full", TONE_DOT[tone])}
        />
        {metric.label}
      </span>
      <span className="flex items-baseline gap-1.5 text-sm font-semibold text-foreground">
        <span>{metric.value}</span>
        {metric.trend ? (
          <span
            aria-hidden="true"
            className="text-[10px] text-muted-foreground"
          >
            {TREND_GLYPH[metric.trend]}
          </span>
        ) : null}
      </span>
      {metric.detail ? (
        <span className="text-[10px] text-muted-foreground">
          {metric.detail}
        </span>
      ) : null}
    </li>
  );
};

/**
 * Top-of-dock summary for the runtime when nothing on the canvas is
 * selected. Renders a compact grid of metric tiles (active runs,
 * throughput, error rate, etc.). Pure presentation; the host computes
 * the metric list from the runtime stream.
 *
 * @example
 * ```tsx
 * <RuntimeOverviewPanel
 *   metrics={[
 *     { id: "runs",  label: "Active runs", value: 3, tone: "success" },
 *     { id: "errs",  label: "Errors / hr", value: 0, tone: "neutral", trend: "flat" },
 *     { id: "tps",   label: "Throughput", value: "120 / s", tone: "success", trend: "up" },
 *   ]}
 * />
 * ```
 *
 * @public
 */
export const RuntimeOverviewPanel = ({
  ref,
  ...props
}: RuntimeOverviewPanelProps & { ref?: React.Ref<HTMLElement> }) => {
  const { className, labels, metrics, title = "Runtime", ...rest } = props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  return (
    <section
      aria-label={resolvedLabels.region}
      className={cn(
        "flex w-full flex-col gap-2 rounded-2xl border bg-background p-3 text-foreground",
        className,
      )}
      data-runtime-overview-panel
      ref={ref}
      {...rest}
    >
      <header>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
      </header>
      {metrics.length === 0 ? (
        <p
          className="px-2 py-3 text-center text-xs text-muted-foreground"
          data-runtime-state="empty"
        >
          {resolvedLabels.empty}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-1.5" data-runtime-grid>
          {metrics.map((metric) => (
            <Tile key={metric.id} metric={metric} />
          ))}
        </ul>
      )}
    </section>
  );
};
RuntimeOverviewPanel.displayName = "RuntimeOverviewPanel";
