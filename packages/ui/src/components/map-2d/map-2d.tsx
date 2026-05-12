"use client";

import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "../../lib/utils";

const MIN_ZOOM = 1;
const MAX_ZOOM = 32;
const ZOOM_STEP = 1.5;
const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 500;

/**
 * Geographic coordinate `[longitude, latitude]`.
 *
 * @public
 */
export type GeoPosition = [number, number];

/**
 * Localizable strings.
 *
 * @public
 */
export type Map2DLabels = {
  /** Aria-label for the map region. Defaults to `"Map"`. */
  region?: string;
  /** Aria-label for the zoom-in button. Defaults to `"Zoom in"`. */
  zoomIn?: string;
  /** Aria-label for the zoom-out button. Defaults to `"Zoom out"`. */
  zoomOut?: string;
};

const DEFAULT_LABELS = {
  region: "Map",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
} as const satisfies Required<Map2DLabels>;

type MapCtx = {
  height: number;
  labels: Required<Map2DLabels>;
  pan: { x: number; y: number };
  project: (position: GeoPosition) => { x: number; y: number };
  setPan: (next: { x: number; y: number }) => void;
  width: number;
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
};

const MapContext = createContext<MapCtx | null>(null);

function useMapContext(): MapCtx {
  const ctx = useContext(MapContext);
  if (!ctx) {
    throw new Error("Map2D subcomponent used outside its root.");
  }
  return ctx;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function projectEquirectangular(
  position: GeoPosition,
  width: number,
  height: number,
): { x: number; y: number } {
  const [lng, lat] = position;
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
}

/**
 * Props for {@link Map2D}.
 *
 * @public
 */
export type Map2DProps = {
  /** Optional URL of a backdrop image (world map, terrain, etc.). */
  backdrop?: string;
  /** Aria-label for an optional backdrop image. */
  backdropAlt?: string;
  /** Initial center as `[lng, lat]`. Defaults to `[0, 20]`. */
  center?: GeoPosition;
  /** Localizable strings. */
  labels?: Map2DLabels;
  /** Initial zoom factor. Defaults to `1`. */
  zoom?: number;
} & ComponentPropsWithoutRef<"section">;

function useMapState(arguments_: {
  center: GeoPosition;
  initialZoom: number;
  resolvedLabels: Required<Map2DLabels>;
}): MapCtx {
  const { center, initialZoom, resolvedLabels } = arguments_;
  const initialPan = useMemo(() => {
    const target = projectEquirectangular(
      center,
      VIEWBOX_WIDTH,
      VIEWBOX_HEIGHT,
    );
    return {
      x: VIEWBOX_WIDTH / 2 - target.x,
      y: VIEWBOX_HEIGHT / 2 - target.y,
    };
  }, [center]);
  const [pan, setPan] = useState<{ x: number; y: number }>(initialPan);
  const [zoom, setZoom] = useState<number>(() =>
    clamp(initialZoom, MIN_ZOOM, MAX_ZOOM),
  );

  const zoomIn = useCallback(() => {
    setZoom((current) => clamp(current * ZOOM_STEP, MIN_ZOOM, MAX_ZOOM));
  }, []);
  const zoomOut = useCallback(() => {
    setZoom((current) => clamp(current / ZOOM_STEP, MIN_ZOOM, MAX_ZOOM));
  }, []);

  const project = useCallback(
    (position: GeoPosition) =>
      projectEquirectangular(position, VIEWBOX_WIDTH, VIEWBOX_HEIGHT),
    [],
  );

  return useMemo(
    () => ({
      height: VIEWBOX_HEIGHT,
      labels: resolvedLabels,
      pan,
      project,
      setPan,
      width: VIEWBOX_WIDTH,
      zoom,
      zoomIn,
      zoomOut,
    }),
    [pan, project, resolvedLabels, zoom, zoomIn, zoomOut],
  );
}

/**
 * Container for `MapZoomIn` / `MapZoomOut` controls.
 *
 * @public
 */
export const MapControls = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ children, className, ...rest }, ref) => (
  <div
    aria-label="Map controls"
    className={cn(
      "absolute right-3 top-3 z-20 flex flex-col gap-1 rounded-md border border-border bg-background/95 p-1 shadow-sm backdrop-blur",
      className,
    )}
    ref={ref}
    {...rest}
  >
    {children}
  </div>
));
MapControls.displayName = "MapControls";

type ControlButtonProps = {
  ariaLabel: string;
  glyph: ReactNode;
  onActivate: () => void;
} & Omit<ComponentPropsWithoutRef<"button">, "aria-label" | "onClick" | "type">;

const ControlButton = forwardRef<HTMLButtonElement, ControlButtonProps>(
  ({ ariaLabel, className, glyph, onActivate, ...rest }, ref) => (
    <button
      aria-label={ariaLabel}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded text-sm font-semibold hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      onClick={onActivate}
      ref={ref}
      type="button"
      {...rest}
    >
      {glyph}
    </button>
  ),
);
ControlButton.displayName = "ControlButton";

/**
 * Zoom-in button. Multiplies the zoom factor up to a max.
 *
 * @public
 */
export const MapZoomIn = forwardRef<
  HTMLButtonElement,
  Omit<ComponentPropsWithoutRef<"button">, "aria-label" | "onClick" | "type">
>(({ ...rest }, ref) => {
  const { labels, zoomIn } = useMapContext();
  return (
    <ControlButton
      ariaLabel={labels.zoomIn}
      glyph="+"
      onActivate={zoomIn}
      ref={ref}
      {...rest}
    />
  );
});
MapZoomIn.displayName = "MapZoomIn";

/**
 * Zoom-out button.
 *
 * @public
 */
export const MapZoomOut = forwardRef<
  HTMLButtonElement,
  Omit<ComponentPropsWithoutRef<"button">, "aria-label" | "onClick" | "type">
>(({ ...rest }, ref) => {
  const { labels, zoomOut } = useMapContext();
  return (
    <ControlButton
      ariaLabel={labels.zoomOut}
      glyph="−"
      onActivate={zoomOut}
      ref={ref}
      {...rest}
    />
  );
});
MapZoomOut.displayName = "MapZoomOut";

/**
 * Props for {@link MapMarker}.
 *
 * @public
 */
export type MapMarkerProps = {
  /** Optional click handler. */
  onSelect?: () => void;
  /** Optional popup content rendered above the marker on hover/focus. */
  popup?: ReactNode;
  /** Geographic position. */
  position: GeoPosition;
  /** Optional accessible label. */
  title?: string;
} & Omit<ComponentPropsWithoutRef<"button">, "onClick" | "title" | "type">;

/**
 * Custom marker icon slot. Pass any SVG element as children. Falls back
 * to a circle if omitted.
 *
 * @public
 */
export const MapMarkerIcon = forwardRef<
  SVGGElement,
  ComponentPropsWithoutRef<"g">
>(({ children, className, ...rest }, ref) => (
  <g className={cn("text-primary", className)} ref={ref} {...rest}>
    {children}
  </g>
));
MapMarkerIcon.displayName = "MapMarkerIcon";

type MarkerVisualProps = {
  children?: ReactNode;
};

function MarkerVisual({ children }: MarkerVisualProps): ReactNode {
  if (children) return children;
  return (
    <g>
      <circle
        className="fill-primary stroke-background"
        cx="0"
        cy="0"
        r="7"
        strokeWidth="2"
      />
      <circle className="fill-background" cx="0" cy="0" r="2" />
    </g>
  );
}

/**
 * A marker placed at a geographic position.
 *
 * @public
 */
export const MapMarker = forwardRef<HTMLButtonElement, MapMarkerProps>(
  (props, ref) => {
    const { children, className, onSelect, popup, position, title, ...rest } =
      props;
    const { project } = useMapContext();
    const point = project(position);
    const markerId = useId();
    const popupId = `${markerId}-popup`;
    const labelText =
      title ??
      (typeof popup === "string" ? popup : `Marker at ${position.join(", ")}`);

    return (
      <foreignObject height="48" width="48" x={point.x - 24} y={point.y - 24}>
        <button
          aria-describedby={popup ? popupId : undefined}
          aria-label={labelText}
          className={cn(
            "group relative inline-flex h-full w-full cursor-pointer items-center justify-center bg-transparent p-0 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
          data-marker-id={markerId}
          onClick={onSelect}
          ref={ref}
          type="button"
          {...rest}
        >
          <svg
            className="pointer-events-none h-6 w-6 overflow-visible"
            viewBox="-10 -10 20 20"
          >
            <MarkerVisual>{children}</MarkerVisual>
          </svg>
          {popup ? (
            <span
              className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden min-w-32 max-w-xs -translate-x-1/2 rounded-md border bg-popover px-2 py-1 text-center text-xs text-popover-foreground shadow-md group-hover:block group-focus-visible:block"
              id={popupId}
              role="tooltip"
            >
              {popup}
            </span>
          ) : null}
        </button>
      </foreignObject>
    );
  },
);
MapMarker.displayName = "MapMarker";

/**
 * Props for {@link MapPopup}.
 *
 * @public
 */
export type MapPopupProps = {
  /** Geographic anchor. */
  position: GeoPosition;
} & ComponentPropsWithoutRef<"div">;

/**
 * Always-visible popup anchored at a geographic position. Use this when
 * you need a popup that lives outside the marker hover lifecycle.
 *
 * @public
 */
export const MapPopup = forwardRef<HTMLDivElement, MapPopupProps>(
  (props, ref) => {
    const { children, className, position, ...rest } = props;
    const { project } = useMapContext();
    const point = project(position);
    return (
      <foreignObject
        height="200"
        width="320"
        x={point.x - 160}
        y={point.y - 220}
      >
        <div
          className={cn(
            "pointer-events-auto inline-block max-w-xs -translate-y-2 rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md",
            className,
          )}
          ref={ref}
          {...rest}
        >
          {children}
        </div>
      </foreignObject>
    );
  },
);
MapPopup.displayName = "MapPopup";

/**
 * GeoJSON polygon-style payload accepted by {@link MapLayer}.
 *
 * @public
 */
export type GeoJSONPolygon = {
  /** Outer ring positions; close the ring by repeating the first point. */
  coordinates: GeoPosition[];
  /** Stable id. */
  id: string;
  /** Polygon kind. */
  type: "polygon";
};

/**
 * Props for {@link MapLayer}.
 *
 * @public
 */
export type MapLayerProps = {
  /** Polygon shapes to render. */
  data: GeoJSONPolygon[];
  /** Fill color (CSS color). Defaults to `"rgba(59,130,246,0.15)"` (blue/15). */
  fill?: string;
  /** Stroke color (CSS color). Defaults to `"currentColor"`. */
  stroke?: string;
  /** Stroke width in viewBox units. Defaults to `2`. */
  strokeWidth?: number;
} & Omit<ComponentPropsWithoutRef<"g">, "fill">;

/**
 * GeoJSON-style polygon overlay layer. Pass `data` as an array of polygon
 * descriptors; the marker projection handles the coordinates the same way.
 *
 * @public
 */
export const MapLayer = forwardRef<SVGGElement, MapLayerProps>((props, ref) => {
  const {
    className,
    data,
    fill = "rgba(59, 130, 246, 0.15)",
    stroke = "currentColor",
    strokeWidth = 2,
    ...rest
  } = props;
  const { project } = useMapContext();
  return (
    <g
      className={cn("text-blue-500/70", className)}
      data-layer="polygon"
      ref={ref}
      {...rest}
    >
      {data.map((shape) => {
        const points = shape.coordinates
          .map((coord) => {
            const projected = project(coord);
            return `${projected.x.toString()},${projected.y.toString()}`;
          })
          .join(" ");
        return (
          <polygon
            data-shape-id={shape.id}
            fill={fill}
            key={shape.id}
            points={points}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        );
      })}
    </g>
  );
});
MapLayer.displayName = "MapLayer";

type StageProps = {
  backdrop?: string;
  backdropAlt?: string;
  children?: ReactNode;
};

type DragState = null | {
  originPan: { x: number; y: number };
  originX: number;
  originY: number;
};

type PanHandlers = {
  onPointerCancel: (event: ReactPointerEvent<SVGSVGElement>) => void;
  onPointerDown: (event: ReactPointerEvent<SVGSVGElement>) => void;
  onPointerMove: (event: ReactPointerEvent<SVGSVGElement>) => void;
  onPointerUp: (event: ReactPointerEvent<SVGSVGElement>) => void;
};

function usePanHandlers(): PanHandlers {
  const { height, pan, setPan, width, zoom } = useMapContext();
  const dragRef = useRef<DragState>(null);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>): void => {
      dragRef.current = {
        originPan: pan,
        originX: event.clientX,
        originY: event.clientY,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [pan],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>): void => {
      const drag = dragRef.current;
      if (!drag) return;
      const target = event.currentTarget;
      const rect = target.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      const dx = (event.clientX - drag.originX) * scaleX;
      const dy = (event.clientY - drag.originY) * scaleY;
      setPan({
        x: drag.originPan.x + dx / zoom,
        y: drag.originPan.y + dy / zoom,
      });
    },
    [height, setPan, width, zoom],
  );

  const onPointerEnd = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>): void => {
      const target = event.currentTarget;
      if (target.hasPointerCapture(event.pointerId)) {
        target.releasePointerCapture(event.pointerId);
      }
      dragRef.current = null;
    },
    [],
  );

  return {
    onPointerCancel: onPointerEnd,
    onPointerDown,
    onPointerMove,
    onPointerUp: onPointerEnd,
  };
}

function Stage({ backdrop, backdropAlt, children }: StageProps): ReactNode {
  const { height, pan, width, zoom } = useMapContext();
  const handlers = usePanHandlers();

  const innerWidth = width / zoom;
  const innerHeight = height / zoom;
  const viewX = (width - innerWidth) / 2 - pan.x;
  const viewY = (height - innerHeight) / 2 - pan.y;

  return (
    <svg
      className="block h-full w-full cursor-grab touch-none active:cursor-grabbing"
      data-pan-x={pan.x}
      data-pan-y={pan.y}
      data-zoom={zoom}
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      viewBox={`${viewX.toString()} ${viewY.toString()} ${innerWidth.toString()} ${innerHeight.toString()}`}
      {...handlers}
    >
      <rect className="fill-muted" height={height} width={width} x="0" y="0" />
      {backdrop ? (
        <image
          aria-label={backdropAlt}
          height={height}
          href={backdrop}
          preserveAspectRatio="xMidYMid slice"
          width={width}
          x="0"
          y="0"
        />
      ) : null}
      {children}
    </svg>
  );
}

type ChildBuckets = {
  controls: ReactNode;
  layers: ReactNode[];
  markers: ReactNode[];
  popups: ReactNode[];
};

const SLOT_DISPLAY_NAMES = {
  controls: MapControls.displayName,
  layer: MapLayer.displayName,
  marker: MapMarker.displayName,
  popup: MapPopup.displayName,
} as const;

function displayName(child: ReactNode): string | undefined {
  if (typeof child !== "object" || child === null) return undefined;
  if (!("type" in child)) return undefined;
  const type = (child as { type: unknown }).type;
  if (typeof type !== "object" && typeof type !== "function") return undefined;
  const name = (type as { displayName?: unknown }).displayName;
  return typeof name === "string" ? name : undefined;
}

type SlotKey = "controls" | "layer" | "marker" | "popup";

const SLOT_KEY_BY_NAME: Record<string, SlotKey> = {
  [SLOT_DISPLAY_NAMES.controls]: "controls",
  [SLOT_DISPLAY_NAMES.layer]: "layer",
  [SLOT_DISPLAY_NAMES.marker]: "marker",
  [SLOT_DISPLAY_NAMES.popup]: "popup",
};

function bucketChildren(children: ReactNode): ChildBuckets {
  const list: ReactNode[] = Array.isArray(children) ? children : [children];
  return list.reduce<ChildBuckets>(
    (accumulator, child) => {
      const name = displayName(child);
      if (!name) return accumulator;
      const key = SLOT_KEY_BY_NAME[name];
      if (!key) return accumulator;
      switch (key) {
        case "controls":
          accumulator.controls = child;
          break;

        case "marker":
          accumulator.markers.push(child);
          break;

        case "layer":
          accumulator.layers.push(child);
          break;

        case "popup":
          accumulator.popups.push(child);
          break;
      }
      return accumulator;
    },
    { controls: null, layers: [], markers: [], popups: [] },
  );
}

/**
 * Lightweight 2D map primitive — renders an SVG canvas with an
 * equirectangular projection so children placed by `[lng, lat]` land in
 * the right spot. Compose with {@link MapMarker}, {@link MapPopup},
 * {@link MapLayer}, and {@link MapControls}. An optional backdrop image
 * (Natural Earth SVG, terrain raster, etc.) renders behind the overlays.
 *
 * Out of scope for the MVP: live map tiles (no Mapbox / MapLibre runtime),
 * marker clustering, fullscreen mode, scale + compass controls, fit-bounds.
 * The component stays small enough to drop into any project — swap the
 * backdrop image to change the basemap.
 *
 * @example
 * ```tsx
 * <Map2D center={[2.3522, 48.8566]} zoom={4}>
 *   <MapMarker position={[2.3522, 48.8566]} popup="Paris" />
 *   <MapMarker position={[-0.1276, 51.5074]} popup="London" />
 *   <MapControls>
 *     <MapZoomIn />
 *     <MapZoomOut />
 *   </MapControls>
 * </Map2D>
 * ```
 *
 * @public
 */
export const Map2D = forwardRef<HTMLElement, Map2DProps>((props, ref) => {
  const {
    backdrop,
    backdropAlt,
    center = [0, 20],
    children,
    className,
    labels,
    zoom: initialZoom = 1,
    ...rest
  } = props;

  const resolvedLabels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labels }),
    [labels],
  );

  const ctx = useMapState({ center, initialZoom, resolvedLabels });
  const buckets = useMemo(() => bucketChildren(children), [children]);

  return (
    <MapContext.Provider value={ctx}>
      <section
        aria-label={resolvedLabels.region}
        className={cn(
          "relative aspect-[2/1] w-full overflow-hidden rounded-2xl border bg-background text-foreground",
          className,
        )}
        ref={ref}
        {...rest}
      >
        <Stage backdrop={backdrop} backdropAlt={backdropAlt}>
          {buckets.layers}
          {buckets.markers}
          {buckets.popups}
        </Stage>
        {buckets.controls}
      </section>
    </MapContext.Provider>
  );
});
Map2D.displayName = "Map2D";
