import * as React from "react";

import { cn } from "../../lib/utils";
import { Badge } from "../badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card";

export type MetricGaugeThreshold = {
  colorClassName: string;
  label: string;
  value: number;
};

export type MetricGaugeProps = React.ComponentPropsWithoutRef<"div"> & {
  description?: string;
  label: string;
  max: number;
  min?: number;
  thresholds?: MetricGaugeThreshold[];
  unit?: string;
  value: number;
};

type Point = {
  x: number;
  y: number;
};

const DEFAULT_THRESHOLDS: MetricGaugeThreshold[] = [
  { colorClassName: "text-emerald-500", label: "Nominal", value: 60 },
  { colorClassName: "text-amber-500", label: "Elevated", value: 85 },
  { colorClassName: "text-destructive", label: "Critical", value: 100 },
];
const GAUGE_CENTER: Point = { x: 100, y: 100 };

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function polarToCartesian(radius: number, angle: number, center: Point): Point {
  const radians = ((angle - 90) * Math.PI) / 180;

  return {
    x: center.x + radius * Math.cos(radians),
    y: center.y + radius * Math.sin(radians),
  };
}

function describeArc(
  radius: number,
  angles: { end: number; start: number },
  center: Point,
) {
  const start = polarToCartesian(radius, angles.end, center);
  const end = polarToCartesian(radius, angles.start, center);
  const largeArcFlag = angles.end - angles.start <= 180 ? 0 : 1;

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function formatMetricValue(value: number, unit?: string): string {
  const rounded = Number.isInteger(value) ? value.toString() : value.toFixed(1);

  return unit ? `${rounded}${unit}` : rounded;
}

function getActiveThreshold(
  percent: number,
  thresholds: MetricGaugeThreshold[],
) {
  return (
    thresholds.find((threshold) => percent <= threshold.value) ??
    thresholds.at(-1)
  );
}

function GaugeDialSvg({
  activeThreshold,
  endAngle,
  label,
}: {
  activeThreshold: MetricGaugeThreshold;
  endAngle: number;
  label: string;
}) {
  const gaugePath = describeArc(72, { end: 90, start: -90 }, GAUGE_CENTER);
  const activePath = describeArc(
    72,
    { end: endAngle, start: -90 },
    GAUGE_CENTER,
  );
  const needlePoint = polarToCartesian(60, endAngle, GAUGE_CENTER);

  return (
    <svg aria-label={label} className="h-auto w-full" viewBox="0 0 200 128">
      <path
        d={gaugePath}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeOpacity="0.12"
        strokeWidth="14"
      />
      <path
        className={cn(activeThreshold.colorClassName)}
        d={activePath}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="14"
      />
      <line
        className={cn(activeThreshold.colorClassName)}
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="4"
        x1={GAUGE_CENTER.x}
        x2={needlePoint.x}
        y1={GAUGE_CENTER.y}
        y2={needlePoint.y}
      />
      <circle
        className="fill-background stroke-border"
        cx={GAUGE_CENTER.x}
        cy={GAUGE_CENTER.y}
        r="8"
      />
    </svg>
  );
}

function GaugeDial({
  activeThreshold,
  endAngle,
  label,
  max,
  min,
  percent,
  safeValue,
  unit,
}: {
  activeThreshold: MetricGaugeThreshold;
  endAngle: number;
  label: string;
  max: number;
  min: number;
  percent: number;
  safeValue: number;
  unit?: string;
}) {
  return (
    <>
      <div className="relative mx-auto w-full max-w-[280px]">
        <GaugeDialSvg
          activeThreshold={activeThreshold}
          endAngle={endAngle}
          label={label}
        />
        <div className="absolute inset-x-0 top-12 text-center">
          <div className="text-3xl font-semibold tracking-tight">
            {formatMetricValue(safeValue, unit)}
          </div>
          <div className="text-xs text-muted-foreground">
            Range {formatMetricValue(min, unit)}–{formatMetricValue(max, unit)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatMetricValue(min, unit)}</span>
        <span>{Math.round(percent)}%</span>
        <span>{formatMetricValue(max, unit)}</span>
      </div>
    </>
  );
}

function GaugeLegend({ thresholds }: { thresholds: MetricGaugeThreshold[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {thresholds.map((threshold) => (
        <div
          className="flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs"
          key={`${threshold.label}-${threshold.value}`}
        >
          <span
            aria-hidden="true"
            className={cn(
              "h-2 w-2 rounded-full bg-current",
              threshold.colorClassName,
            )}
          />
          <span>{threshold.label}</span>
          <span className="text-muted-foreground">≤ {threshold.value}%</span>
        </div>
      ))}
    </div>
  );
}

export const MetricGauge = React.forwardRef<HTMLDivElement, MetricGaugeProps>(
  (
    {
      className,
      description,
      label,
      max,
      min = 0,
      thresholds = DEFAULT_THRESHOLDS,
      unit,
      value,
      ...props
    },
    ref,
  ) => {
    const safeValue = clamp(value, min, max);
    const percent = max === min ? 0 : ((safeValue - min) / (max - min)) * 100;
    const endAngle = -90 + 180 * (percent / 100);
    const activeThreshold = getActiveThreshold(percent, thresholds);

    return (
      <Card className={cn("shadow-sm", className)} ref={ref} {...props}>
        <CardHeader className="space-y-2 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">{label}</CardTitle>
              {description ? (
                <CardDescription>{description}</CardDescription>
              ) : null}
            </div>
            {activeThreshold ? (
              <Badge variant="outline">{activeThreshold.label}</Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeThreshold ? (
            <GaugeDial
              activeThreshold={activeThreshold}
              endAngle={endAngle}
              label={label}
              max={max}
              min={min}
              percent={percent}
              safeValue={safeValue}
              unit={unit}
            />
          ) : null}
          <GaugeLegend thresholds={thresholds} />
        </CardContent>
      </Card>
    );
  },
);

MetricGauge.displayName = "MetricGauge";
