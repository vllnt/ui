"use client";

import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@vllnt/ui";

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 500;

/**
 * Geographic coordinate `[longitude, latitude]`.
 *
 * @public
 */
export type GeoPosition = [number, number];

/**
 * Color theme for layers and event markers.
 *
 * @public
 */
export type MapTimelineColor =
  | "amber"
  | "blue"
  | "emerald"
  | "purple"
  | "red"
  | "rose";

const PALETTE: Record<
  MapTimelineColor,
  { dot: string; fill: string; stroke: string }
> = {
  amber: {
    dot: "fill-amber-500",
    fill: "rgba(245, 158, 11, 0.25)",
    stroke: "#b45309",
  },
  blue: {
    dot: "fill-blue-500",
    fill: "rgba(59, 130, 246, 0.25)",
    stroke: "#1d4ed8",
  },
  emerald: {
    dot: "fill-emerald-500",
    fill: "rgba(16, 185, 129, 0.25)",
    stroke: "#047857",
  },
  purple: {
    dot: "fill-purple-500",
    fill: "rgba(168, 85, 247, 0.25)",
    stroke: "#7c3aed",
  },
  red: {
    dot: "fill-red-500",
    fill: "rgba(239, 68, 68, 0.25)",
    stroke: "#b91c1c",
  },
  rose: {
    dot: "fill-rose-500",
    fill: "rgba(244, 63, 94, 0.25)",
    stroke: "#be123c",
  },
};

/**
 * Localizable strings.
 *
 * @public
 */
export type MapTimelineLabels = {
  /** Pause-button label. Defaults to `"Pause"`. */
  pause?: string;
  /** Play-button label. Defaults to `"Play"`. */
  play?: string;
  /** Aria-label for the map region. Defaults to `"Map timeline"`. */
  region?: string;
  /** Aria-label for the timeline slider. Defaults to `"Year"`. */
  slider?: string;
};

const DEFAULT_LABELS = {
  pause: "Pause",
  play: "Play",
  region: "Map timeline",
  slider: "Year",
} as const satisfies Required<MapTimelineLabels>;

type Ctx = {
  endYear: number;
  isPlaying: boolean;
  labels: Required<MapTimelineLabels>;
  setIsPlaying: (next: boolean) => void;
  setYear: (next: number) => void;
  speed: number;
  startYear: number;
  year: number;
};

const TimelineContext = createContext<Ctx | null>(null);

function useTimelineContext(): Ctx {
  const ctx = use(TimelineContext);
  if (!ctx) {
    throw new Error("MapTimeline subcomponent used outside its root.");
  }
  return ctx;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function projectEquirectangular(position: GeoPosition): {
  x: number;
  y: number;
} {
  const [lng, lat] = position;
  return {
    x: ((lng + 180) / 360) * VIEWBOX_WIDTH,
    y: ((90 - lat) / 180) * VIEWBOX_HEIGHT,
  };
}

function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year).toString()} BCE`;
  return `${year.toString()} CE`;
}

function ringToPath(ring: GeoPosition[]): string {
  return ring
    .map((position, index) => {
      const projected = projectEquirectangular(position);
      return `${index === 0 ? "M" : "L"}${projected.x.toString()},${projected.y.toString()}`;
    })
    .join(" ");
}

/**
 * GeoJSON-style polygon for a {@link MapTimelineLayer}. Pass either a
 * `polygon` (single ring) or a `polygons` array (multi-polygon).
 *
 * @public
 */
export type MapTimelineGeometry =
  | { polygon: GeoPosition[]; polygons?: never; type: "polygon" }
  | { polygon?: never; polygons: GeoPosition[][]; type: "multipolygon" };

/**
 * Props for {@link MapTimelineLayer}.
 *
 * @public
 */
export type MapTimelineLayerProps = {
  /** Color theme. Defaults to `"blue"`. */
  color?: MapTimelineColor;
  /** Year (inclusive) when the layer disappears. */
  endYear: number;
  /** Polygon geometry. */
  geometry: MapTimelineGeometry;
  /** Stable id used for analytics + React keys. */
  id?: string;
  /**
   * Display label shown in the centroid when visible. Must be a plain
   * string: an SVG `<text>` element renders this content and cannot display
   * arbitrary React elements.
   */
  label?: string;
  /** Year (inclusive) when the layer first appears. */
  startYear: number;
} & Omit<ComponentPropsWithoutRef<"g">, "id">;

function geometryRings(geometry: MapTimelineGeometry): GeoPosition[][] {
  if (geometry.type === "polygon") return [geometry.polygon];
  return geometry.polygons;
}

function ringCentroid(ring: GeoPosition[]): { x: number; y: number } {
  if (ring.length === 0) return { x: 0, y: 0 };
  const total = ring.reduce<{ x: number; y: number }>(
    (accumulator, position) => {
      const projected = projectEquirectangular(position);
      return { x: accumulator.x + projected.x, y: accumulator.y + projected.y };
    },
    { x: 0, y: 0 },
  );
  return { x: total.x / ring.length, y: total.y / ring.length };
}

/**
 * Geographic layer pinned to a year window.
 *
 * @public
 */
export const MapTimelineLayer = ({
  ref,
  ...props
}: MapTimelineLayerProps & { ref?: React.Ref<SVGGElement> }) => {
  const {
    color = "blue",
    endYear,
    geometry,
    id,
    label,
    startYear,
    ...rest
  } = props;
  const { year } = useTimelineContext();
  if (year < startYear || year > endYear) return null;
  const palette = PALETTE[color];
  const rings = geometryRings(geometry);
  const centroid = rings[0] ? ringCentroid(rings[0]) : { x: 0, y: 0 };
  return (
    <g data-layer-id={id} data-state="visible" ref={ref} {...rest}>
      {rings.map((ring, index) => (
        <path
          d={`${ringToPath(ring)} Z`}
          fill={palette.fill}
          key={`${id ?? "layer"}-ring-${index.toString()}`}
          stroke={palette.stroke}
          strokeWidth={1.5}
        />
      ))}
      {label ? (
        <text
          className="select-none fill-foreground text-[11px] font-semibold"
          dominantBaseline="middle"
          textAnchor="middle"
          x={centroid.x}
          y={centroid.y}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
};
MapTimelineLayer.displayName = "MapTimelineLayer";

/**
 * Props for {@link MapTimelineEvent}.
 *
 * @public
 */
export type MapTimelineEventProps = {
  /** Color theme. Defaults to `"red"`. */
  color?: MapTimelineColor;
  /**
   * Optional description shown in the tooltip. Must be a plain string: an
   * SVG `<text>` element renders this content and cannot display arbitrary
   * React elements.
   */
  description?: string;
  /** Stable identifier. */
  id?: string;
  /** Geographic position. */
  position: GeoPosition;
  /**
   * Title shown in the tooltip. Must be a plain string: an SVG `<text>`
   * element renders this content and cannot display arbitrary React
   * elements.
   */
  title?: string;
  /** Inclusive ± window in years around `year` when the marker shows. Defaults to `0` (exact match). */
  toleranceYears?: number;
  /** Year the event happened. */
  year: number;
} & Omit<ComponentPropsWithoutRef<"g">, "id">;

/**
 * Year-pinned event marker.
 *
 * @public
 */
export const MapTimelineEvent = ({
  ref,
  ...props
}: MapTimelineEventProps & { ref?: React.Ref<SVGGElement> }) => {
  const {
    color = "red",
    description,
    id,
    position,
    title,
    toleranceYears = 0,
    year: eventYear,
    ...rest
  } = props;
  const { year } = useTimelineContext();
  const visible = Math.abs(year - eventYear) <= toleranceYears;
  if (!visible) return null;
  const palette = PALETTE[color];
  const projected = projectEquirectangular(position);
  return (
    <g
      data-event-id={id}
      data-event-year={eventYear}
      ref={ref}
      transform={`translate(${projected.x.toString()}, ${projected.y.toString()})`}
      {...rest}
    >
      <circle
        className={cn("stroke-background", palette.dot)}
        r="6"
        strokeWidth="2"
      >
        {title ? <title>{title}</title> : null}
      </circle>
      {title ? (
        <text
          className="select-none fill-foreground text-[10px] font-semibold"
          dominantBaseline="middle"
          textAnchor="middle"
          y="-12"
        >
          {title}
        </text>
      ) : null}
      {description ? (
        <text
          className="select-none fill-muted-foreground text-[9px]"
          dominantBaseline="middle"
          textAnchor="middle"
          y="20"
        >
          {description}
        </text>
      ) : null}
    </g>
  );
};
MapTimelineEvent.displayName = "MapTimelineEvent";

/**
 * Container for the slider + play button row.
 *
 * @public
 */
export const MapTimelineControls = ({
  children,
  className,
  ref,
  ...rest
}: ComponentPropsWithoutRef<"div"> & { ref?: React.Ref<HTMLDivElement> }) => (
  <div
    className={cn(
      "flex items-center gap-3 border-t border-border bg-muted/40 px-4 py-2",
      className,
    )}
    ref={ref}
    {...rest}
  >
    {children}
  </div>
);
MapTimelineControls.displayName = "MapTimelineControls";

/**
 * Range-input slider bound to the current year.
 *
 * @public
 */
export const MapTimelineSlider = ({
  className,
  ref,
  ...rest
}: Omit<
  ComponentPropsWithoutRef<"input">,
  "max" | "min" | "onChange" | "type" | "value"
> & { ref?: React.Ref<HTMLInputElement> }) => {
  const { endYear, labels, setYear, startYear, year } = useTimelineContext();
  const sliderId = useId();
  const handleYearChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setYear(Number.parseInt(event.target.value, 10));
  };
  return (
    <div className="flex flex-1 items-center gap-2 text-xs font-medium text-muted-foreground">
      <span aria-hidden="true">{formatYear(startYear)}</span>
      <input
        aria-label={labels.slider}
        aria-valuemax={endYear}
        aria-valuemin={startYear}
        aria-valuenow={year}
        className={cn("flex-1 accent-primary", className)}
        id={sliderId}
        max={endYear}
        min={startYear}
        onChange={handleYearChange}
        ref={ref}
        type="range"
        value={year}
        {...rest}
      />
      <span aria-hidden="true">{formatYear(endYear)}</span>
      <span
        className="ml-2 inline-flex min-w-20 justify-center rounded-md border border-border bg-background px-2 py-0.5 text-foreground"
        data-current-year={year}
      >
        {formatYear(year)}
      </span>
    </div>
  );
};
MapTimelineSlider.displayName = "MapTimelineSlider";

/**
 * Play / pause toggle that auto-advances the year on `requestAnimationFrame`.
 *
 * @public
 */
export const MapTimelinePlayButton = ({
  className,
  ref,
  ...rest
}: Omit<
  ComponentPropsWithoutRef<"button">,
  "aria-pressed" | "onClick" | "type"
> & { ref?: React.Ref<HTMLButtonElement> }) => {
  const { isPlaying, labels, setIsPlaying } = useTimelineContext();
  const handleTogglePlayback = (): void => {
    setIsPlaying(!isPlaying);
  };
  return (
    <button
      aria-label={isPlaying ? labels.pause : labels.play}
      aria-pressed={isPlaying}
      className={cn(
        "inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      data-playing={isPlaying ? "true" : undefined}
      onClick={handleTogglePlayback}
      ref={ref}
      type="button"
      {...rest}
    >
      <span aria-hidden="true">{isPlaying ? "❚❚" : "▶"}</span>
    </button>
  );
};
MapTimelinePlayButton.displayName = "MapTimelinePlayButton";

/**
 * Props for {@link MapTimeline}.
 *
 * @public
 */
export type MapTimelineProps = {
  /** Optional URL of a backdrop image (world map, terrain). */
  backdrop?: string;
  /** Aria-label for the backdrop image. */
  backdropAlt?: string;
  /** End of the timeline window (inclusive). */
  endYear: number;
  /** Initial year. Defaults to `startYear`. */
  initialYear?: number;
  /** Localizable strings. */
  labels?: MapTimelineLabels;
  /** Fires when the year changes (slider drag, play tick, or programmatic). */
  onYearChange?: (next: number) => void;
  /** Years per second when playing. Defaults to `25`. */
  speed?: number;
  /** Start of the timeline window (inclusive). Negative for BCE. */
  startYear: number;
} & Omit<ComponentPropsWithoutRef<"section">, "onChange">;

function useTimelineCtx(arguments_: {
  endYear: number;
  isPlaying: boolean;
  labels: Required<MapTimelineLabels>;
  setIsPlaying: (next: boolean) => void;
  setYear: (next: number) => void;
  speed: number;
  startYear: number;
  year: number;
}): Ctx {
  const {
    endYear,
    isPlaying,
    labels,
    setIsPlaying,
    setYear,
    speed,
    startYear,
    year,
  } = arguments_;
  return useMemo<Ctx>(
    () => ({
      endYear,
      isPlaying,
      labels,
      setIsPlaying,
      setYear,
      speed,
      startYear,
      year,
    }),
    [endYear, isPlaying, labels, setIsPlaying, setYear, speed, startYear, year],
  );
}

function useTimelineState(arguments_: {
  endYear: number;
  initialYear?: number;
  onYearChange?: (next: number) => void;
  speed: number;
  startYear: number;
}): {
  isPlaying: boolean;
  setIsPlaying: (next: boolean) => void;
  setYear: (next: number) => void;
  year: number;
} {
  const { endYear, initialYear, onYearChange, startYear } = arguments_;
  const [year, setYear] = useState<number>(() =>
    clamp(initialYear ?? startYear, startYear, endYear),
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const updateYear = useCallback(
    (next: number) => {
      const clamped = clamp(next, startYear, endYear);
      setYear((current) => {
        if (clamped >= endYear) setIsPlaying(false);
        if (current === clamped) return current;
        onYearChange?.(clamped);
        return clamped;
      });
    },
    [endYear, onYearChange, startYear],
  );

  return { isPlaying, setIsPlaying, setYear: updateYear, year };
}

function usePlayback(arguments_: {
  endYear: number;
  isPlaying: boolean;
  setIsPlaying: (next: boolean) => void;
  setYear: (next: number) => void;
  speed: number;
  startYear: number;
  year: number;
}): void {
  const { endYear, isPlaying, setIsPlaying, setYear, speed, year } = arguments_;
  const yearRef = useRef(year);
  useEffect(() => {
    yearRef.current = year;
  }, [year]);
  useEffect(() => {
    if (!isPlaying) return;
    if (typeof window === "undefined") return;
    let frame = 0;
    let last: null | number = null;
    const step = (timestamp: number): void => {
      if (last !== null) {
        const delta = (timestamp - last) / 1000;
        const next = yearRef.current + delta * speed;
        if (next >= endYear) {
          setYear(endYear);
          setIsPlaying(false);
          return;
        }
        setYear(next);
      }
      last = timestamp;
      frame = window.requestAnimationFrame(step);
    };
    frame = window.requestAnimationFrame(step);
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [endYear, isPlaying, setIsPlaying, setYear, speed]);
}

type StageProps = {
  backdrop?: string;
  backdropAlt?: string;
  children: ReactNode;
};

function Stage({ backdrop, backdropAlt, children }: StageProps): ReactNode {
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
      {children}
    </svg>
  );
}

type ChildBuckets = {
  footer: ReactNode[];
  stage: ReactNode[];
};

function bucketChildren(children: ReactNode): ChildBuckets {
  const list: ReactNode[] = Array.isArray(children) ? children : [children];
  return list.reduce<ChildBuckets>(
    (accumulator, child) => {
      const name = displayName(child);
      if (name === MapTimelineControls.displayName)
        accumulator.footer.push(child);
      else accumulator.stage.push(child);
      return accumulator;
    },
    { footer: [], stage: [] },
  );
}

function displayName(child: ReactNode): string | undefined {
  if (typeof child !== "object" || child === null) return undefined;
  if (!("type" in child)) return undefined;
  const type = (child as { type: unknown }).type;
  if (typeof type !== "object" && typeof type !== "function") return undefined;
  const name = (type as { displayName?: unknown }).displayName;
  return typeof name === "string" ? name : undefined;
}

type ShellProps = {
  backdrop?: string;
  backdropAlt?: string;
  buckets: ChildBuckets;
  className?: string;
  region: string;
  titleId: string;
  year: number;
};

const Shell = function Shell({
  ref,
  ...props
}: ShellProps & { ref?: React.Ref<HTMLElement> }) {
  const { backdrop, backdropAlt, buckets, className, region, titleId, year } =
    props;
  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-2xl border bg-background text-foreground",
        className,
      )}
      ref={ref}
    >
      <span className="sr-only" id={titleId}>
        {region}
      </span>
      <div
        className="relative aspect-[2/1] w-full overflow-hidden"
        data-current-year={year}
      >
        <Stage backdrop={backdrop} backdropAlt={backdropAlt}>
          {buckets.stage}
        </Stage>
      </div>
      {buckets.footer}
    </section>
  );
};

/**
 * Combined map + timeline. Pass {@link MapTimelineLayer} (era polygons),
 * {@link MapTimelineEvent} (year-pinned markers), and
 * {@link MapTimelineControls} as children. The slider scrubs the
 * current year; layers and events appear / disappear as the year
 * crosses their windows.
 *
 * Standalone SVG primitive — no external map library required.
 *
 * @example
 * ```tsx
 * <MapTimeline startYear={-500} endYear={2025} initialYear={1}>
 *   <MapTimelineLayer
 *     startYear={-27}
 *     endYear={476}
 *     color="red"
 *     label="Roman Empire"
 *     geometry={{ type: 'polygon', polygon: romanRing }}
 *   />
 *   <MapTimelineEvent
 *     year={79}
 *     position={[14.48, 40.75]}
 *     title="Vesuvius"
 *     description="Pompeii destroyed"
 *   />
 *   <MapTimelineControls>
 *     <MapTimelinePlayButton />
 *     <MapTimelineSlider />
 *   </MapTimelineControls>
 * </MapTimeline>
 * ```
 *
 * @public
 */
export const MapTimeline = ({
  ref,
  ...props
}: MapTimelineProps & { ref?: React.Ref<HTMLElement> }) => {
  const {
    backdrop,
    backdropAlt,
    children,
    className,
    endYear,
    initialYear,
    labels,
    onYearChange,
    speed = 25,
    startYear,
    ...rest
  } = props;
  const titleId = useId();
  const resolvedLabels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labels }),
    [labels],
  );

  const { isPlaying, setIsPlaying, setYear, year } = useTimelineState({
    endYear,
    initialYear,
    onYearChange,
    speed,
    startYear,
  });

  usePlayback({
    endYear,
    isPlaying,
    setIsPlaying,
    setYear,
    speed,
    startYear,
    year,
  });

  const ctx = useTimelineCtx({
    endYear,
    isPlaying,
    labels: resolvedLabels,
    setIsPlaying,
    setYear,
    speed,
    startYear,
    year,
  });

  const buckets = bucketChildren(children);
  return (
    <TimelineContext.Provider value={ctx}>
      <Shell
        backdrop={backdrop}
        backdropAlt={backdropAlt}
        buckets={buckets}
        className={className}
        ref={ref}
        region={resolvedLabels.region}
        titleId={titleId}
        year={year}
        {...rest}
      />
    </TimelineContext.Provider>
  );
};
MapTimeline.displayName = "MapTimeline";
