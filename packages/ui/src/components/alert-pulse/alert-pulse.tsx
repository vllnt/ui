"use client";

import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "../../lib/utils";

/**
 * Severity tone of an alert pulse — drives the ring color.
 *
 * @public
 */
export type AlertPulseSeverity = "error" | "info" | "warn";

const SEVERITY_STROKE: Record<AlertPulseSeverity, string> = {
  error: "stroke-red-500",
  info: "stroke-blue-500",
  warn: "stroke-amber-500",
};

const SEVERITY_FILL: Record<AlertPulseSeverity, string> = {
  error: "fill-red-500/20",
  info: "fill-blue-500/20",
  warn: "fill-amber-500/20",
};

const SEVERITY_LABEL: Record<AlertPulseSeverity, string> = {
  error: "Error",
  info: "Info",
  warn: "Warning",
};

/**
 * Localizable strings.
 *
 * @public
 */
export type AlertPulseLabels = {
  /** Override for the aria-label. Defaults to severity name. */
  region?: string;
};

/**
 * Props for {@link AlertPulse}.
 *
 * @public
 */
export type AlertPulseProps = {
  /** Center X of the pulse in canvas pixels. */
  cx: number;
  /** Center Y of the pulse in canvas pixels. */
  cy: number;
  /** Localizable strings. */
  labels?: AlertPulseLabels;
  /** Outer ring radius in pixels. Defaults to `36`. */
  radius?: number;
  /** Disable the pulse animation. Useful for snapshots. Defaults to `false`. */
  reducedMotion?: boolean;
  /** Severity tone. Defaults to `"warn"`. */
  severity?: AlertPulseSeverity;
} & ComponentPropsWithoutRef<"svg">;

const safeRadius = (value: number): number => (value < 6 ? 6 : value);

/**
 * Pulsing ring overlay drawn around an alerting canvas object. The
 * outer ring expands and fades to communicate "attention here";
 * the inner ring stays put so the object remains anchored. Pure
 * presentation; the host computes the center + severity from the
 * runtime alert stream.
 *
 * Render inside a `position: relative` parent that shares the canvas
 * pixel coordinate space; the SVG is `pointer-events: none` so host
 * gestures pass through.
 *
 * @example
 * ```tsx
 * <div className="relative h-screen w-screen">
 *   <Canvas />
 *   <AlertPulse cx={480} cy={320} severity="error" />
 * </div>
 * ```
 *
 * @public
 */
export const AlertPulse = forwardRef<SVGSVGElement, AlertPulseProps>(
  (props, ref) => {
    const {
      className,
      cx,
      cy,
      labels,
      radius = 36,
      reducedMotion = false,
      severity = "warn",
      ...rest
    } = props;
    const r = safeRadius(radius);
    const ariaLabel = labels?.region ?? SEVERITY_LABEL[severity];
    const size = r * 2 + 24;
    return (
      <svg
        aria-label={ariaLabel}
        className={cn(
          "pointer-events-none absolute z-20 overflow-visible",
          className,
        )}
        data-alert-pulse
        data-alert-severity={severity}
        height={size}
        ref={ref}
        role="img"
        style={{
          left: cx - size / 2,
          top: cy - size / 2,
        }}
        width={size}
        {...rest}
      >
        <circle
          className={cn("origin-center", SEVERITY_STROKE[severity])}
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={r}
          strokeOpacity={0.7}
          strokeWidth={2}
        />
        <circle
          className={cn(
            "origin-center",
            SEVERITY_STROKE[severity],
            SEVERITY_FILL[severity],
            reducedMotion ? null : "animate-ping",
          )}
          cx={size / 2}
          cy={size / 2}
          data-alert-pulse-ring
          r={r}
          strokeOpacity={0.4}
          strokeWidth={2}
        />
      </svg>
    );
  },
);
AlertPulse.displayName = "AlertPulse";
