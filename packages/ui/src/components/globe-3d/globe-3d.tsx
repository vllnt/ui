"use client";

import {
  Children,
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  isValidElement,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "../../lib/utils";

const VIEWBOX = 400;
const SPHERE_RADIUS = 180;
const CENTER = VIEWBOX / 2;

/**
 * Geographic coordinate as `{ lat, lng }`.
 *
 * @public
 */
export type GlobeCoord = { lat: number; lng: number };

/**
 * Color theme for markers and arcs.
 *
 * @public
 */
export type GlobeColor =
  | "amber"
  | "blue"
  | "cyan"
  | "emerald"
  | "purple"
  | "red"
  | "rose";

const PALETTE: Record<GlobeColor, { fill: string; stroke: string }> = {
  amber: { fill: "fill-amber-500", stroke: "stroke-amber-500" },
  blue: { fill: "fill-blue-500", stroke: "stroke-blue-500" },
  cyan: { fill: "fill-cyan-500", stroke: "stroke-cyan-500" },
  emerald: { fill: "fill-emerald-500", stroke: "stroke-emerald-500" },
  purple: { fill: "fill-purple-500", stroke: "stroke-purple-500" },
  red: { fill: "fill-red-500", stroke: "stroke-red-500" },
  rose: { fill: "fill-rose-500", stroke: "stroke-rose-500" },
};

/**
 * Localizable strings.
 *
 * @public
 */
export type Globe3DLabels = {
  /** Aria-label for the globe region. Defaults to `"Globe"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Globe",
} as const satisfies Required<Globe3DLabels>;

type Vec3 = { x: number; y: number; z: number };

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function rotate(vector: Vec3, lngOffset: number, latOffset: number): Vec3 {
  const yawRad = toRadians(lngOffset);
  const pitchRad = toRadians(latOffset);
  const cosY = Math.cos(yawRad);
  const sinY = Math.sin(yawRad);
  const xy = vector.x * cosY + vector.z * sinY;
  const zy = -vector.x * sinY + vector.z * cosY;
  const cosP = Math.cos(pitchRad);
  const sinP = Math.sin(pitchRad);
  const yp = vector.y * cosP - zy * sinP;
  const zp = vector.y * sinP + zy * cosP;
  return { x: xy, y: yp, z: zp };
}

function latLngToVector({ lat, lng }: GlobeCoord): Vec3 {
  const phi = toRadians(90 - lat);
  const theta = toRadians(lng);
  return {
    x: Math.sin(phi) * Math.sin(theta),
    y: Math.cos(phi),
    z: Math.sin(phi) * Math.cos(theta),
  };
}

function project(
  coord: GlobeCoord,
  rotationLng: number,
  rotationLat: number,
): { visible: boolean; x: number; y: number; z: number } {
  const baseVector = latLngToVector(coord);
  const rotated = rotate(baseVector, rotationLng, rotationLat);
  return {
    visible: rotated.z >= 0,
    x: CENTER + rotated.x * SPHERE_RADIUS,
    y: CENTER - rotated.y * SPHERE_RADIUS,
    z: rotated.z,
  };
}

type Ctx = {
  rotationLat: number;
  rotationLng: number;
};

const GlobeContext = createContext<Ctx | null>(null);

function useGlobeContext(): Ctx {
  const ctx = useContext(GlobeContext);
  if (!ctx) {
    throw new Error("Globe3D subcomponent used outside its root.");
  }
  return ctx;
}

/**
 * Props for {@link GlobeMarker}.
 *
 * @public
 */
export type GlobeMarkerProps = {
  /** Color theme. Defaults to `"red"`. */
  color?: GlobeColor;
  /** Stable id used for analytics + React keys. */
  id?: string;
  /** Optional label rendered next to the marker. */
  label?: ReactNode;
  /** Latitude. Positive = north. */
  lat: number;
  /** Longitude. Positive = east. */
  lng: number;
} & Omit<ComponentPropsWithoutRef<"g">, "id">;

/**
 * Point marker pinned to a `[lat, lng]`. Hidden when the point falls on
 * the far side of the globe.
 *
 * @public
 */
export const GlobeMarker = forwardRef<SVGGElement, GlobeMarkerProps>(
  (props, ref) => {
    const { color = "red", id, label, lat, lng, ...rest } = props;
    const { rotationLat, rotationLng } = useGlobeContext();
    const projected = project({ lat, lng }, rotationLng, rotationLat);
    if (!projected.visible) return null;
    const palette = PALETTE[color];
    return (
      <g
        data-marker-id={id}
        data-marker-visible="true"
        ref={ref}
        transform={`translate(${projected.x.toString()}, ${projected.y.toString()})`}
        {...rest}
      >
        <circle
          className={cn("stroke-background", palette.fill)}
          r="5"
          strokeWidth="1.5"
        />
        {label ? (
          <text
            className="select-none fill-foreground text-[10px] font-semibold"
            dominantBaseline="middle"
            textAnchor="middle"
            y="-10"
          >
            {label}
          </text>
        ) : null}
      </g>
    );
  },
);
GlobeMarker.displayName = "GlobeMarker";

/**
 * Props for {@link GlobeArc}.
 *
 * @public
 */
export type GlobeArcProps = {
  /** Color theme. Defaults to `"cyan"`. */
  color?: GlobeColor;
  /** Origin coordinate. */
  from: GlobeCoord;
  /** Stable id used for analytics + React keys. */
  id?: string;
  /** Stroke width in viewBox units. Defaults to `2`. */
  strokeWidth?: number;
  /** Destination coordinate. */
  to: GlobeCoord;
} & Omit<ComponentPropsWithoutRef<"path">, "d" | "id" | "stroke">;

function buildArc(arguments_: {
  from: GlobeCoord;
  rotationLat: number;
  rotationLng: number;
  to: GlobeCoord;
}): string {
  const { from, rotationLat, rotationLng, to } = arguments_;
  const samples = 36;
  return Array.from({ length: samples + 1 })
    .map((_, index) => {
      const t = index / samples;
      const lat = from.lat + (to.lat - from.lat) * t;
      const lng = from.lng + (to.lng - from.lng) * t;
      return project({ lat, lng }, rotationLng, rotationLat);
    })
    .reduce<{ path: string; pen: "down" | "up" }>(
      (state, projected) => {
        if (!projected.visible) return { path: state.path, pen: "up" };
        const head = state.pen === "up" ? "M" : "L";
        const separator = state.path.length > 0 ? " " : "";
        return {
          path: `${state.path}${separator}${head}${projected.x.toString()},${projected.y.toString()}`,
          pen: "down",
        };
      },
      { path: "", pen: "up" },
    ).path;
}

/**
 * Great-circle-style arc between two coordinates. The component clips
 * any segment on the far side of the globe.
 *
 * @public
 */
export const GlobeArc = forwardRef<SVGPathElement, GlobeArcProps>(
  (props, ref) => {
    const { color = "cyan", from, id, strokeWidth = 2, to, ...rest } = props;
    const { rotationLat, rotationLng } = useGlobeContext();
    const path = buildArc({ from, rotationLat, rotationLng, to });
    if (!path) return null;
    const palette = PALETTE[color];
    return (
      <path
        className={cn("fill-none", palette.stroke)}
        d={path}
        data-arc-id={id}
        ref={ref}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        {...rest}
      />
    );
  },
);
GlobeArc.displayName = "GlobeArc";

type GraticuleProps = {
  rotationLat: number;
  rotationLng: number;
};

function buildLine(arguments_: {
  points: GlobeCoord[];
  rotationLat: number;
  rotationLng: number;
}): string {
  const { points, rotationLat, rotationLng } = arguments_;
  return points
    .map((coord) => project(coord, rotationLng, rotationLat))
    .reduce<{ path: string; pen: "down" | "up" }>(
      (state, projected) => {
        if (!projected.visible) return { path: state.path, pen: "up" };
        const head = state.pen === "up" ? "M" : "L";
        const separator = state.path.length > 0 ? " " : "";
        return {
          path: `${state.path}${separator}${head}${projected.x.toString()},${projected.y.toString()}`,
          pen: "down",
        };
      },
      { path: "", pen: "up" },
    ).path;
}

function range(start: number, end: number, step: number): number[] {
  const length = Math.floor((end - start) / step) + 1;
  return Array.from({ length }).map((_, index) => start + index * step);
}

function Graticule({ rotationLat, rotationLng }: GraticuleProps): ReactNode {
  const parallels = range(-60, 60, 30).map<GlobeCoord[]>((lat) =>
    range(-180, 180, 5).map((lng) => ({ lat, lng })),
  );
  const meridians = range(-150, 180, 30).map<GlobeCoord[]>((lng) =>
    range(-85, 85, 5).map((lat) => ({ lat, lng })),
  );
  const lines = [...parallels, ...meridians]
    .map((points) => buildLine({ points, rotationLat, rotationLng }))
    .filter((path) => path.length > 0);
  return (
    <g
      className="fill-none stroke-foreground/20"
      data-globe-graticule
      strokeWidth={0.5}
    >
      {lines.map((path) => (
        <path d={path} key={path} />
      ))}
    </g>
  );
}

type SphereProps = {
  children: ReactNode;
  rotationLat: number;
  rotationLng: number;
};

function Sphere({
  children,
  rotationLat,
  rotationLng,
}: SphereProps): ReactNode {
  return (
    <svg
      aria-hidden="true"
      className="block h-full w-full touch-none"
      data-rotation-lat={rotationLat}
      data-rotation-lng={rotationLng}
      preserveAspectRatio="xMidYMid meet"
      viewBox={`0 0 ${VIEWBOX.toString()} ${VIEWBOX.toString()}`}
    >
      <defs>
        <radialGradient cx="50%" cy="40%" id="globe-shade" r="60%">
          <stop offset="0%" stopColor="rgba(99, 102, 241, 0.4)" />
          <stop offset="100%" stopColor="rgba(15, 23, 42, 0.85)" />
        </radialGradient>
      </defs>
      <circle
        className="fill-[url(#globe-shade)] stroke-foreground/30"
        cx={CENTER}
        cy={CENTER}
        data-globe-sphere
        r={SPHERE_RADIUS}
        strokeWidth={1}
      />
      <Graticule rotationLat={rotationLat} rotationLng={rotationLng} />
      {children}
    </svg>
  );
}

/**
 * Props for {@link Globe3D}.
 *
 * @public
 */
export type Globe3DProps = {
  /** When `true`, the globe rotates on its own. Defaults to `true`. */
  autoRotate?: boolean;
  /** Initial view position. */
  initialPosition?: GlobeCoord;
  /** Localizable strings. */
  labels?: Globe3DLabels;
  /** Auto-rotation rate in degrees per second. Defaults to `8`. */
  rotationSpeed?: number;
} & ComponentPropsWithoutRef<"section">;

function useAutoRotation(arguments_: {
  autoRotate: boolean;
  isDragging: boolean;
  rotationSpeed: number;
  setRotationLng: (next: (current: number) => number) => void;
}): void {
  const { autoRotate, isDragging, rotationSpeed, setRotationLng } = arguments_;
  useEffect(() => {
    if (!autoRotate || isDragging) return;
    if (typeof window === "undefined") return;
    let frame = 0;
    let last: null | number = null;
    const step = (timestamp: number): void => {
      if (last !== null) {
        const delta = (timestamp - last) / 1000;
        setRotationLng((current) => current + delta * rotationSpeed);
      }
      last = timestamp;
      frame = window.requestAnimationFrame(step);
    };
    frame = window.requestAnimationFrame(step);
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [autoRotate, isDragging, rotationSpeed, setRotationLng]);
}

type DragState = null | {
  originLat: number;
  originLng: number;
  originX: number;
  originY: number;
};

type DragHandlers = {
  onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
};

function useDragRotation(arguments_: {
  rotationLat: number;
  rotationLng: number;
  setIsDragging: (next: boolean) => void;
  setRotationLat: (next: number) => void;
  setRotationLng: (next: number) => void;
}): DragHandlers {
  const {
    rotationLat,
    rotationLng,
    setIsDragging,
    setRotationLat,
    setRotationLng,
  } = arguments_;
  const dragRef = useRef<DragState>(null);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>): void => {
      dragRef.current = {
        originLat: rotationLat,
        originLng: rotationLng,
        originX: event.clientX,
        originY: event.clientY,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
    },
    [rotationLat, rotationLng, setIsDragging],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>): void => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = event.clientX - drag.originX;
      const dy = event.clientY - drag.originY;
      setRotationLng(drag.originLng + dx * 0.4);
      setRotationLat(clamp(drag.originLat - dy * 0.4, -85, 85));
    },
    [setRotationLat, setRotationLng],
  );

  const onPointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>): void => {
      const target = event.currentTarget;
      if (target.hasPointerCapture(event.pointerId)) {
        target.releasePointerCapture(event.pointerId);
      }
      dragRef.current = null;
      setIsDragging(false);
    },
    [setIsDragging],
  );

  return {
    onPointerCancel: onPointerEnd,
    onPointerDown,
    onPointerMove,
    onPointerUp: onPointerEnd,
  };
}

function useGlobeRotation(initialPosition: GlobeCoord): {
  isDragging: boolean;
  rotationLat: number;
  rotationLng: number;
  setIsDragging: (next: boolean) => void;
  setRotationLat: (next: number) => void;
  setRotationLng: (next: ((current: number) => number) | number) => void;
} {
  const [rotationLng, setRotationLng] = useState<number>(-initialPosition.lng);
  const [rotationLat, setRotationLat] = useState<number>(initialPosition.lat);
  const [isDragging, setIsDragging] = useState(false);
  return {
    isDragging,
    rotationLat,
    rotationLng,
    setIsDragging,
    setRotationLat,
    setRotationLng,
  };
}

type DataSummaryProps = {
  children: ReactNode;
  titleId: string;
};

function DataSummary({ children, titleId }: DataSummaryProps): ReactNode {
  const markers: {
    color: string;
    label: ReactNode;
    lat: number;
    lng: number;
  }[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const element = child as ReactElement<GlobeMarkerProps>;
    if (
      typeof element.props.lat === "number" &&
      typeof element.props.lng === "number"
    ) {
      markers.push({
        color: element.props.color ?? "red",
        label: element.props.label ?? null,
        lat: element.props.lat,
        lng: element.props.lng,
      });
    }
  });
  return (
    <div aria-labelledby={titleId} className="sr-only" role="region">
      <h3 id={titleId}>Globe data summary</h3>
      <p>{markers.length.toString()} marker(s) plotted on the globe.</p>
      <ul>
        {markers.map((marker, index) => (
          <li
            key={`${index.toString()}-${marker.lat.toString()}-${marker.lng.toString()}`}
          >
            {`${marker.lat.toString()}, ${marker.lng.toString()}: ${marker.label ? String(marker.label) : marker.color}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Standalone SVG pseudo-3D globe. Renders a unit sphere with
 * orthographic projection, a graticule (lat/lng lines), and any
 * {@link GlobeMarker} / {@link GlobeArc} children. Auto-rotates around
 * the Y axis; drag to rotate manually (auto-rotation pauses while
 * dragging). No external 3D library — pure SVG + React state.
 *
 * @example
 * ```tsx
 * <Globe3D autoRotate>
 *   <GlobeMarker lat={48.85} lng={2.35} label="Paris" color="blue" />
 *   <GlobeMarker lat={40.71} lng={-74} label="New York" color="red" />
 *   <GlobeArc
 *     from={{ lat: 48.85, lng: 2.35 }}
 *     to={{ lat: 40.71, lng: -74 }}
 *     color="cyan"
 *   />
 * </Globe3D>
 * ```
 *
 * @public
 */
export const Globe3D = forwardRef<HTMLElement, Globe3DProps>((props, ref) => {
  const {
    autoRotate = true,
    children,
    className,
    initialPosition = { lat: 20, lng: 0 },
    labels,
    rotationSpeed = 8,
    ...rest
  } = props;
  const titleId = useId();
  const resolvedLabels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labels }),
    [labels],
  );
  const {
    isDragging,
    rotationLat,
    rotationLng,
    setIsDragging,
    setRotationLat,
    setRotationLng,
  } = useGlobeRotation(initialPosition);

  useAutoRotation({ autoRotate, isDragging, rotationSpeed, setRotationLng });

  const handlers = useDragRotation({
    rotationLat,
    rotationLng,
    setIsDragging,
    setRotationLat,
    setRotationLng: (next) => {
      setRotationLng(next);
    },
  });

  const ctx = useMemo<Ctx>(
    () => ({ rotationLat, rotationLng }),
    [rotationLat, rotationLng],
  );

  return (
    <GlobeContext.Provider value={ctx}>
      <section
        aria-labelledby={titleId}
        className={cn(
          "relative aspect-square w-full max-w-md overflow-hidden rounded-2xl border bg-background text-foreground",
          className,
        )}
        ref={ref}
        {...rest}
      >
        <span className="sr-only" id={titleId}>
          {resolvedLabels.region}
        </span>
        <div
          className="block h-full w-full cursor-grab active:cursor-grabbing"
          data-globe-stage
          {...handlers}
        >
          <Sphere rotationLat={rotationLat} rotationLng={rotationLng}>
            {children}
          </Sphere>
        </div>
        <DataSummary titleId={titleId}>{children}</DataSummary>
      </section>
    </GlobeContext.Provider>
  );
});
Globe3D.displayName = "Globe3D";
