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
 * Geographic coordinate `[longitude, latitude]`.
 *
 * @public
 */
export type GeoPosition = [number, number];

/**
 * A single waypoint along the route.
 *
 * @public
 */
export type RouteWaypoint = {
  /** Stable identifier. */
  id: string;
  /** Human-readable label rendered next to the marker. */
  label: ReactNode;
  /** Optional 1-based ordinal. Defaults to the array index + 1. */
  order?: number;
  /** Geographic position. */
  position: GeoPosition;
};

/**
 * Color theme for the route line + waypoint markers.
 *
 * @public
 */
export type RouteColor =
  | "amber"
  | "blue"
  | "emerald"
  | "purple"
  | "red"
  | "rose";

const ROUTE_PALETTE: Record<
  RouteColor,
  { dot: string; line: string; text: string }
> = {
  amber: {
    dot: "fill-amber-500",
    line: "stroke-amber-500",
    text: "text-amber-600",
  },
  blue: {
    dot: "fill-blue-500",
    line: "stroke-blue-500",
    text: "text-blue-600",
  },
  emerald: {
    dot: "fill-emerald-500",
    line: "stroke-emerald-500",
    text: "text-emerald-600",
  },
  purple: {
    dot: "fill-purple-500",
    line: "stroke-purple-500",
    text: "text-purple-600",
  },
  red: { dot: "fill-red-500", line: "stroke-red-500", text: "text-red-600" },
  rose: {
    dot: "fill-rose-500",
    line: "stroke-rose-500",
    text: "text-rose-600",
  },
};

/**
 * Line drawing style.
 *
 * @public
 */
export type RouteLineStyle = "dashed" | "dotted" | "solid";

const LINE_DASH: Record<RouteLineStyle, string> = {
  dashed: "10,8",
  dotted: "2,6",
  solid: "0",
};

/**
 * Localizable strings.
 *
 * @public
 */
export type RouteMapLabels = {
  /** Aria-label for the route region. Defaults to `"Route map"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Route map",
} as const satisfies Required<RouteMapLabels>;

function projectEquirectangular(position: GeoPosition): {
  x: number;
  y: number;
} {
  const [lng, lat] = position;
  const x = ((lng + 180) / 360) * VIEWBOX_WIDTH;
  const y = ((90 - lat) / 180) * VIEWBOX_HEIGHT;
  return { x, y };
}

/**
 * Props for {@link RouteMap}.
 *
 * @public
 */
export type RouteMapProps = {
  /** When `true`, the route line draws progressively from start to end. */
  animated?: boolean;
  /** Animation duration in seconds. Defaults to `4`. */
  animationDurationSeconds?: number;
  /** Optional URL of a backdrop image (world map, terrain). */
  backdrop?: string;
  /** Aria-label for the backdrop image when set. */
  backdropAlt?: string;
  /** Color theme. Defaults to `"red"`. */
  color?: RouteColor;
  /** Localizable strings. */
  labels?: RouteMapLabels;
  /** Line drawing style. Defaults to `"solid"`. */
  lineStyle?: RouteLineStyle;
  /** When `true`, renders a moving indicator that travels along the route. */
  showProgressIndicator?: boolean;
  /** Ordered list of waypoints along the route. */
  waypoints: RouteWaypoint[];
} & ComponentPropsWithoutRef<"section">;

type ProjectedWaypoint = {
  ordinal: number;
  raw: RouteWaypoint;
  x: number;
  y: number;
};

function projectWaypoints(waypoints: RouteWaypoint[]): ProjectedWaypoint[] {
  return waypoints.map((waypoint, index) => {
    const point = projectEquirectangular(waypoint.position);
    return {
      ordinal: waypoint.order ?? index + 1,
      raw: waypoint,
      x: point.x,
      y: point.y,
    };
  });
}

function pathFor(points: ProjectedWaypoint[]): string {
  if (points.length === 0) return "";
  return points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${point.x.toString()},${point.y.toString()}`,
    )
    .join(" ");
}

function pathLength(points: ProjectedWaypoint[]): number {
  if (points.length < 2) return 0;
  const total = points.reduce<{ length: number; previous?: ProjectedWaypoint }>(
    (accumulator, point) => {
      if (!accumulator.previous) return { length: 0, previous: point };
      const dx = point.x - accumulator.previous.x;
      const dy = point.y - accumulator.previous.y;
      return {
        length: accumulator.length + Math.hypot(dx, dy),
        previous: point,
      };
    },
    { length: 0 },
  );
  return total.length;
}

type RouteLineProps = {
  animated: boolean;
  animationDurationSeconds: number;
  color: RouteColor;
  lineStyle: RouteLineStyle;
  pathDefinition: string;
  pathId: string;
  totalLength: number;
};

function RouteLine({
  animated,
  animationDurationSeconds,
  color,
  lineStyle,
  pathDefinition,
  pathId,
  totalLength,
}: RouteLineProps): ReactNode {
  if (!pathDefinition) return null;
  const palette = ROUTE_PALETTE[color];
  const dashArray = animated
    ? totalLength > 0
      ? `${totalLength.toString()} ${totalLength.toString()}`
      : LINE_DASH[lineStyle]
    : LINE_DASH[lineStyle];

  return (
    <g data-route-line>
      <path
        className={cn("fill-none stroke-[3]", palette.line)}
        d={pathDefinition}
        id={pathId}
        strokeDasharray={dashArray}
        strokeDashoffset={animated ? totalLength : 0}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {animated ? (
          <animate
            attributeName="stroke-dashoffset"
            dur={`${animationDurationSeconds.toString()}s`}
            fill="freeze"
            from={totalLength}
            to="0"
          />
        ) : null}
      </path>
    </g>
  );
}

type ProgressIndicatorProps = {
  animationDurationSeconds: number;
  color: RouteColor;
  pathId: string;
  visible: boolean;
};

function ProgressIndicator({
  animationDurationSeconds,
  color,
  pathId,
  visible,
}: ProgressIndicatorProps): ReactNode {
  if (!visible) return null;
  const palette = ROUTE_PALETTE[color];
  return (
    <g data-route-progress>
      <circle
        className={cn("stroke-background", palette.dot)}
        r="6"
        strokeWidth="2"
      >
        <animateMotion
          dur={`${animationDurationSeconds.toString()}s`}
          repeatCount="indefinite"
          rotate="auto"
        >
          <mpath href={`#${pathId}`} />
        </animateMotion>
      </circle>
    </g>
  );
}

type WaypointDotsProps = {
  color: RouteColor;
  waypoints: ProjectedWaypoint[];
};

function WaypointDots({ color, waypoints }: WaypointDotsProps): ReactNode {
  const palette = ROUTE_PALETTE[color];
  return (
    <g data-route-waypoints>
      {waypoints.map((point) => {
        const labelText =
          typeof point.raw.label === "string" ? point.raw.label : undefined;
        return (
          <g
            data-waypoint-id={point.raw.id}
            data-waypoint-ordinal={point.ordinal}
            key={point.raw.id}
            transform={`translate(${point.x.toString()}, ${point.y.toString()})`}
          >
            <circle
              className={cn(
                "stroke-background outline-none focus-visible:ring-2 focus-visible:ring-ring",
                palette.dot,
              )}
              r="6"
              strokeWidth="2"
            >
              {labelText ? <title>{labelText}</title> : null}
            </circle>
            <text
              className={cn(
                "select-none text-[10px] font-semibold",
                palette.text,
              )}
              dominantBaseline="middle"
              textAnchor="middle"
              y="-12"
            >
              {point.raw.label}
            </text>
            <text
              className="select-none fill-background text-[8px] font-bold"
              dominantBaseline="central"
              textAnchor="middle"
              y="0"
            >
              {point.ordinal}
            </text>
          </g>
        );
      })}
    </g>
  );
}

type DataSummaryProps = {
  titleId: string;
  waypoints: RouteWaypoint[];
};

function DataSummary({ titleId, waypoints }: DataSummaryProps): ReactNode {
  return (
    <div aria-labelledby={titleId} className="sr-only" role="region">
      <h3 id={titleId}>Route waypoint summary</h3>
      <ol>
        {waypoints.map((waypoint) => (
          <li key={waypoint.id}>
            {typeof waypoint.label === "string"
              ? waypoint.label
              : `Waypoint ${waypoint.id}`}
            {`: ${waypoint.position[0].toString()}, ${waypoint.position[1].toString()}`}
          </li>
        ))}
      </ol>
    </div>
  );
}

type StageProps = {
  animated: boolean;
  animationDurationSeconds: number;
  backdrop?: string;
  backdropAlt?: string;
  color: RouteColor;
  lineStyle: RouteLineStyle;
  pathDefinition: string;
  pathId: string;
  showProgressIndicator: boolean;
  totalLength: number;
  waypoints: ProjectedWaypoint[];
};

function Stage(props: StageProps): ReactNode {
  const {
    animated,
    animationDurationSeconds,
    backdrop,
    backdropAlt,
    color,
    lineStyle,
    pathDefinition,
    pathId,
    showProgressIndicator,
    totalLength,
    waypoints,
  } = props;
  const showProgress: boolean = showProgressIndicator && totalLength > 0;
  return (
    <svg
      aria-hidden="true"
      className="block h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      viewBox={`0 0 ${VIEWBOX_WIDTH.toString()} ${VIEWBOX_HEIGHT.toString()}`}
    >
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
      <RouteLine
        animated={animated}
        animationDurationSeconds={animationDurationSeconds}
        color={color}
        lineStyle={lineStyle}
        pathDefinition={pathDefinition}
        pathId={pathId}
        totalLength={totalLength}
      />
      <WaypointDots color={color} waypoints={waypoints} />
      <ProgressIndicator
        animationDurationSeconds={animationDurationSeconds}
        color={color}
        pathId={pathId}
        visible={showProgress}
      />
    </svg>
  );
}

/**
 * Map for animated route paths, waypoints, and journey progression.
 * Use for trade routes, military campaigns, exploration voyages,
 * migration paths, and delivery tracking. Standalone SVG primitive —
 * no external map library or tile provider required. Drop in a backdrop
 * image (Natural Earth SVG, terrain raster) to add geographic context.
 *
 * @example
 * ```tsx
 * <RouteMap
 *   animated
 *   showProgressIndicator
 *   color="red"
 *   waypoints={[
 *     { id: "chang", label: "Chang'an", position: [108.94, 34.34] },
 *     { id: "kashgar", label: "Kashgar", position: [75.99, 39.47] },
 *     { id: "samarkand", label: "Samarkand", position: [66.97, 39.65] },
 *     { id: "constantinople", label: "Constantinople", position: [28.98, 41.01] },
 *   ]}
 * />
 * ```
 *
 * @public
 */
export const RouteMap = (
  props: RouteMapProps & React.RefAttributes<HTMLElement>,
) => {
  const {
    animated = false,
    animationDurationSeconds = 4,
    backdrop,
    backdropAlt,
    children,
    className,
    color = "red",
    labels,
    lineStyle = "solid",
    ref,
    showProgressIndicator = false,
    waypoints,
    ...rest
  } = props;
  const titleId = useId();
  const pathId = useId();
  const resolvedLabels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labels }),
    [labels],
  );
  const projected = useMemo(() => projectWaypoints(waypoints), [waypoints]);
  const pathDefinition = useMemo(() => pathFor(projected), [projected]);
  const totalLength = useMemo(() => pathLength(projected), [projected]);

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
        animated={animated}
        animationDurationSeconds={animationDurationSeconds}
        backdrop={backdrop}
        backdropAlt={backdropAlt}
        color={color}
        lineStyle={lineStyle}
        pathDefinition={pathDefinition}
        pathId={pathId}
        showProgressIndicator={showProgressIndicator}
        totalLength={totalLength}
        waypoints={projected}
      />
      {children ? (
        <div className="absolute bottom-3 left-3 z-10 max-w-xs rounded-md border bg-background/95 px-3 py-2 text-xs text-foreground shadow-sm backdrop-blur">
          {children}
        </div>
      ) : null}
      <DataSummary titleId={titleId} waypoints={waypoints} />
    </section>
  );
};
RouteMap.displayName = "RouteMap";
