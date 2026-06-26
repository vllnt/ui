"use client";

import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  useId,
  useMemo,
} from "react";

import { cn } from "../../lib/utils";

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 500;

/**
 * A heat point — geographic position plus optional weight.
 *
 * @public
 */
export type HeatMapPoint = {
  /** Stable identifier (used as React key). */
  id: string;
  /** Latitude. Positive = north. */
  lat: number;
  /** Longitude. Positive = east. */
  lng: number;
  /** Optional weight `0..1`. Drives both radius scale and color stop. Defaults to `1`. */
  weight?: number;
};

/**
 * Gradient stops `{ stop: color }`. Each stop is a `0..1` ratio.
 *
 * @public
 */
export type HeatGradient = Record<number, string>;

const DEFAULT_GRADIENT: HeatGradient = {
  0.2: "rgba(0, 0, 255, 0.6)",
  0.5: "rgba(0, 255, 0, 0.7)",
  0.8: "rgba(255, 165, 0, 0.85)",
  1: "rgba(255, 0, 0, 0.95)",
};

/**
 * Localizable strings.
 *
 * @public
 */
export type HeatMapOverlayLabels = {
  /** Aria-label for the heat map region. Defaults to `"Heat map"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Heat map",
} as const satisfies Required<HeatMapOverlayLabels>;

function projectEquirectangular(
  lng: number,
  lat: number,
): { x: number; y: number } {
  const x = ((lng + 180) / 360) * VIEWBOX_WIDTH;
  const y = ((90 - lat) / 180) * VIEWBOX_HEIGHT;
  return { x, y };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function gradientStops(
  gradient: HeatGradient,
): { color: string; offset: number }[] {
  return Object.entries(gradient)
    .map(([key, value]) => ({ color: value, offset: Number.parseFloat(key) }))
    .sort((a, b) => a.offset - b.offset);
}

/**
 * Props for {@link HeatMapOverlay}.
 *
 * @public
 */
export type HeatMapOverlayProps = {
  /** Optional backdrop image URL (world map, terrain). */
  backdrop?: string;
  /** Aria-label for the backdrop image. */
  backdropAlt?: string;
  /** Gaussian blur radius in viewBox units. Defaults to `12`. */
  blur?: number;
  /** Heat point data. */
  data: HeatMapPoint[];
  /** Color gradient stops `0..1` → CSS color. Defaults to a blue→green→orange→red ramp. */
  gradient?: HeatGradient;
  /** Localizable strings. */
  labels?: HeatMapOverlayLabels;
  /** Layer opacity `0..1`. Defaults to `0.7`. */
  opacity?: number;
  /** Top heat-blob radius in viewBox units. Defaults to `30`. Per-point radius scales with `weight`. */
  radius?: number;
} & ComponentPropsWithoutRef<"section">;

type ProjectedPoint = {
  raw: HeatMapPoint;
  weight: number;
  x: number;
  y: number;
};

function projectPoints(points: HeatMapPoint[]): ProjectedPoint[] {
  return points.map((point) => {
    const { x, y } = projectEquirectangular(point.lng, point.lat);
    return {
      raw: point,
      weight: clamp(point.weight ?? 1, 0, 1),
      x,
      y,
    };
  });
}

type HeatBlobProps = {
  gradientId: string;
  point: ProjectedPoint;
  radius: number;
};

function HeatBlob({ gradientId, point, radius }: HeatBlobProps): ReactNode {
  const blobRadius = Math.max(2, radius * (0.4 + 0.6 * point.weight));
  return (
    <circle
      cx={point.x}
      cy={point.y}
      data-point-id={point.raw.id}
      data-weight={point.weight}
      fill={`url(#${gradientId})`}
      opacity={point.weight}
      r={blobRadius}
    />
  );
}

type GradientDefsProps = {
  blurId: string;
  gradient: HeatGradient;
  gradientId: string;
};

function GradientDefs({
  blurId,
  gradient,
  gradientId,
}: GradientDefsProps): ReactNode {
  const stops = gradientStops(gradient);
  return (
    <defs>
      <radialGradient cx="50%" cy="50%" id={gradientId} r="50%">
        {stops.map((stop) => (
          <stop
            key={stop.offset}
            offset={`${(stop.offset * 100).toString()}%`}
            stopColor={stop.color}
          />
        ))}
      </radialGradient>
      <filter id={blurId}>
        <feGaussianBlur stdDeviation={12} />
      </filter>
    </defs>
  );
}

type DataSummaryProps = {
  data: HeatMapPoint[];
  titleId: string;
};

function DataSummary({ data, titleId }: DataSummaryProps): ReactNode {
  return (
    <div aria-labelledby={titleId} className="sr-only" role="region">
      <h3 id={titleId}>Heat map data summary</h3>
      <p>
        {data.length.toString()} point{data.length === 1 ? "" : "s"} plotted on
        the heat map.
      </p>
      <ul>
        {data.map((point) => (
          <li key={point.id}>
            {`${point.lat.toString()}, ${point.lng.toString()}: weight ${(point.weight ?? 1).toString()}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

type StageProps = {
  backdrop?: string;
  backdropAlt?: string;
  blur: number;
  blurId: string;
  data: ProjectedPoint[];
  gradient: HeatGradient;
  gradientId: string;
  opacity: number;
  radius: number;
};

function Stage({
  backdrop,
  backdropAlt,
  blur,
  blurId,
  data,
  gradient,
  gradientId,
  opacity,
  radius,
}: StageProps): ReactNode {
  return (
    <svg
      aria-hidden="true"
      className="block h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      viewBox={`0 0 ${VIEWBOX_WIDTH.toString()} ${VIEWBOX_HEIGHT.toString()}`}
    >
      <GradientDefs
        blurId={blurId}
        gradient={gradient}
        gradientId={gradientId}
      />
      <rect
        className="fill-muted"
        height={VIEWBOX_HEIGHT}
        width={VIEWBOX_WIDTH}
        x="0"
        y="0"
      />
      {backdrop ? (
        <image
          aria-label={backdropAlt}
          height={VIEWBOX_HEIGHT}
          href={backdrop}
          preserveAspectRatio="xMidYMid slice"
          width={VIEWBOX_WIDTH}
          x="0"
          y="0"
        />
      ) : null}
      <g
        data-heat-layer
        filter={blur > 0 ? `url(#${blurId})` : undefined}
        opacity={opacity}
      >
        {data.map((point) => (
          <HeatBlob
            gradientId={gradientId}
            key={point.raw.id}
            point={point}
            radius={radius}
          />
        ))}
      </g>
    </svg>
  );
}

/**
 * Standalone SVG heat-map overlay for geographic density / intensity
 * data. Plot heat points by `[lng, lat]` with optional `weight`. Each
 * point renders as a radial-gradient blob; the layer is Gaussian-blurred
 * to merge neighbours into smooth heat clouds.
 *
 * Use for: troop concentrations, population density, event / incident
 * hotspots, archaeological site density, environmental pollution maps.
 *
 * @example
 * ```tsx
 * <HeatMapOverlay
 *   data={[
 *     { id: "a", lat: 40.7, lng: -74, weight: 0.9 },
 *     { id: "b", lat: 51.5, lng: -0.13, weight: 0.6 },
 *   ]}
 *   radius={40}
 *   blur={18}
 * />
 * ```
 *
 * @public
 */
export const HeatMapOverlay = ({
  ref,
  ...props
}: HeatMapOverlayProps & { ref?: React.Ref<HTMLElement> }) => {
  const {
    backdrop,
    backdropAlt,
    blur = 12,
    children,
    className,
    data,
    gradient = DEFAULT_GRADIENT,
    labels,
    opacity = 0.7,
    radius = 30,
    ...rest
  } = props;
  const titleId = useId();
  const gradientId = useId();
  const blurId = useId();

  const resolvedLabels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labels }),
    [labels],
  );
  const projected = useMemo(() => projectPoints(data), [data]);

  return (
    <section
      aria-label={resolvedLabels.region}
      className={cn(
        "relative aspect-[2/1] w-full overflow-hidden rounded-2xl border bg-background text-foreground",
        className,
      )}
      ref={ref}
      {...rest}
    >
      <Stage
        backdrop={backdrop}
        backdropAlt={backdropAlt}
        blur={blur}
        blurId={blurId}
        data={projected}
        gradient={gradient}
        gradientId={gradientId}
        opacity={opacity}
        radius={radius}
      />
      {children ? (
        <div className="absolute bottom-3 left-3 z-10 max-w-xs rounded-md border bg-background/95 px-3 py-2 text-xs text-foreground shadow-sm backdrop-blur">
          {children}
        </div>
      ) : null}
      <DataSummary data={data} titleId={titleId} />
    </section>
  );
};
HeatMapOverlay.displayName = "HeatMapOverlay";
