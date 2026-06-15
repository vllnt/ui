"use client";

import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type ReactNode,
  useCallback,
  useContext,
  useId,
  useMemo,
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
 * A region polygon. Outer ring closes by repeating the first point;
 * holes are out of scope for the MVP.
 *
 * @public
 */
export type ChoroplethRegion = {
  /** Outer ring as `[lng, lat]` positions. */
  coordinates: GeoPosition[];
  /** Stable identifier — matches keys in the `data` map. */
  id: string;
  /** Human-readable region name shown in the default tooltip. */
  name: string;
};

/**
 * Two-stop color scale `[low, high]` for sequential data, or three stops
 * `[low, mid, high]` for diverging data. Linear interpolation between stops.
 *
 * @public
 */
export type ChoroplethColorScale = [string, string, string] | [string, string];

/**
 * Localizable strings.
 *
 * @public
 */
export type ChoroplethMapLabels = {
  /** Aria-label for the SVG canvas. Defaults to `"Choropleth map"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Choropleth map",
} as const satisfies Required<ChoroplethMapLabels>;

/**
 * Default sequential ramp (slate-100 → blue-700). The interpolation engine
 * operates in sRGB hex space, so these defaults are light-mode optimized and
 * fixed; under dark mode or a custom theme they render unchanged. Pass an
 * explicit `colorScale` to match the active palette.
 */
const DEFAULT_SCALE: ChoroplethColorScale = ["#f1f5f9", "#1d4ed8"];

/** sRGB fallback for missing regions when the theme `--muted` token is unavailable. */
const DEFAULT_MISSING = "#e5e7eb";

/**
 * Resolve the theme `--muted` token to an `oklch()` color so regions with no
 * data adapt to the active preset. Falls back to {@link DEFAULT_MISSING} on the
 * server or when the token has no value.
 */
function resolveMissingColor(): string {
  if (typeof window === "undefined") return DEFAULT_MISSING;
  const muted = getComputedStyle(document.documentElement)
    .getPropertyValue("--muted")
    .trim();
  return muted ? `oklch(${muted})` : DEFAULT_MISSING;
}

type Hover = { id: string; value?: number };

type ChoroplethCtx = {
  colorFor: (value?: number) => string;
  hover?: Hover;
  legend?: { domain: [number, number]; scale: ChoroplethColorScale };
  regionByid: Map<string, ChoroplethRegion>;
  setHover: (next?: Hover) => void;
  valueFor: (id: string) => null | number;
};

const ChoroplethContext = createContext<ChoroplethCtx | null>(null);

function useChoroplethContext(): ChoroplethCtx {
  const ctx = useContext(ChoroplethContext);
  if (!ctx) {
    throw new Error("ChoroplethMap subcomponent used outside its root.");
  }
  return ctx;
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function parseHex(color: string): [number, number, number] | undefined {
  const match = /^#([\da-f]{6})$/i.exec(color.trim());
  if (!match) return undefined;
  const hex = match[1] ?? "";
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ];
}

function toHex(channel: number): string {
  return clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0");
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function interpolateColor(stops: string[], t: number): string {
  if (stops.length === 0) return "#000000";
  if (stops.length === 1) return stops[0] ?? "#000000";
  const segments = stops.length - 1;
  const scaledT = clamp(t, 0, 1) * segments;
  const segmentIndex = Math.min(Math.floor(scaledT), segments - 1);
  const localT = scaledT - segmentIndex;
  const lower = stops[segmentIndex];
  const upper = stops[segmentIndex + 1];
  if (!lower || !upper) return stops[0] ?? "#000000";
  const lowerRgb = parseHex(lower);
  const upperRgb = parseHex(upper);
  if (!lowerRgb || !upperRgb) return lower;
  const [lr, lg, lb] = lowerRgb;
  const [ur, ug, ub] = upperRgb;
  const r = lerp(lr, ur, localT);
  const g = lerp(lg, ug, localT);
  const b = lerp(lb, ub, localT);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function computeDomain(values: number[]): [number, number] {
  const first = values[0];
  if (first === undefined) return [0, 1];
  const min = values.reduce(
    (accumulator, value) => Math.min(accumulator, value),
    first,
  );
  const max = values.reduce(
    (accumulator, value) => Math.max(accumulator, value),
    first,
  );
  if (min === max) return [min, max + 1];
  return [min, max];
}

/**
 * Props for {@link ChoroplethMap}.
 *
 * @public
 */
export type ChoroplethMapProps = {
  /** Color stops. Two stops = sequential; three stops = diverging. Defaults to a blue ramp. */
  colorScale?: ChoroplethColorScale;
  /** Map of region id → numeric value. */
  data: Record<string, number>;
  /** Optional explicit `[min, max]` value domain. Defaults to the data extent. */
  domain?: [number, number];
  /** Localizable strings. */
  labels?: ChoroplethMapLabels;
  /** Color used when a region has no data. Defaults to the theme `--muted` token. */
  missingColor?: string;
  /** Fires after a region click. */
  onSelectRegion?: (region: ChoroplethRegion) => void;
  /** Region polygons. */
  regions: ChoroplethRegion[];
} & ComponentPropsWithoutRef<"section">;

type RegionPathProps = {
  active: boolean;
  onSelect: (region: ChoroplethRegion) => void;
  region: ChoroplethRegion;
  selectedId?: string;
  setHoverFn: (next?: Hover) => void;
};

function regionPath(region: ChoroplethRegion): string {
  return region.coordinates
    .map((coord, index) => {
      const projected = projectEquirectangular(
        coord,
        VIEWBOX_WIDTH,
        VIEWBOX_HEIGHT,
      );
      return `${index === 0 ? "M" : "L"}${projected.x.toString()},${projected.y.toString()}`;
    })
    .join(" ");
}

function RegionPath({
  active,
  onSelect,
  region,
  selectedId,
  setHoverFn,
}: RegionPathProps): ReactNode {
  const { colorFor, valueFor } = useChoroplethContext();
  const value = valueFor(region.id) ?? undefined;
  const fill = colorFor(value);
  const handleEnter = (): void => {
    setHoverFn({ id: region.id, value });
  };
  const handleLeave = (): void => {
    setHoverFn();
  };
  const handleSelect = (): void => {
    onSelect(region);
  };
  return (
    <path
      aria-label={`${region.name}${value === undefined ? " no data" : ` ${value.toString()}`}`}
      className={cn(
        "cursor-pointer outline-none transition-[opacity,filter]",
        active ? "opacity-100" : "opacity-90 hover:opacity-100",
        selectedId === region.id ? "stroke-foreground" : "stroke-background",
      )}
      d={regionPath(region) + " Z"}
      data-region-id={region.id}
      data-selected={selectedId === region.id ? "true" : undefined}
      data-value={value}
      fill={fill}
      onBlur={handleLeave}
      onClick={handleSelect}
      onFocus={handleEnter}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      strokeWidth={selectedId === region.id ? 2 : 0.75}
      tabIndex={0}
    />
  );
}

type ChoroplethTooltipRender = (arguments_: {
  region: ChoroplethRegion;
  value?: number;
}) => ReactNode;

/**
 * Tooltip slot. Pass a render-prop function via `children` for full
 * control, or omit it to use the default `Region Name · value` layout.
 *
 * @public
 */
export type ChoroplethTooltipProps = {
  /** Render-prop receiving the hovered region + value. */
  children?: ChoroplethTooltipRender;
} & Omit<ComponentPropsWithoutRef<"div">, "children">;

export const ChoroplethTooltip = forwardRef<
  HTMLDivElement,
  ChoroplethTooltipProps
>(({ children, className, ...rest }, ref) => {
  const { hover, regionByid } = useChoroplethContext();
  if (!hover) return null;
  const region = regionByid.get(hover.id);
  if (!region) return null;
  return (
    <div
      className={cn(
        "pointer-events-none absolute left-3 top-3 z-10 max-w-xs rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md",
        className,
      )}
      data-tooltip-region-id={region.id}
      ref={ref}
      role="status"
      {...rest}
    >
      {children ? (
        children({ region, value: hover.value })
      ) : (
        <span>
          <span className="font-medium">{region.name}</span>
          {hover.value === undefined ? (
            <span className="text-muted-foreground"> · no data</span>
          ) : (
            <span> · {hover.value.toLocaleString()}</span>
          )}
        </span>
      )}
    </div>
  );
});
ChoroplethTooltip.displayName = "ChoroplethTooltip";

/**
 * Legend slot. Renders a horizontal color ramp with min / max labels.
 *
 * @public
 */
export type ChoroplethLegendProps = {
  /** Optional title rendered above the ramp. */
  title?: ReactNode;
} & Omit<ComponentPropsWithoutRef<"div">, "children">;

export const ChoroplethLegend = forwardRef<
  HTMLDivElement,
  ChoroplethLegendProps
>(({ className, title, ...rest }, ref) => {
  const { legend } = useChoroplethContext();
  if (!legend) return null;
  const stops = legend.scale.join(", ");
  return (
    <div
      className={cn(
        "absolute bottom-3 right-3 z-10 flex flex-col gap-1 rounded-md border bg-background/95 px-2 py-1 text-[11px] text-foreground shadow-sm backdrop-blur",
        className,
      )}
      data-legend
      ref={ref}
      {...rest}
    >
      {title ? (
        <span className="font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </span>
      ) : null}
      <div
        aria-hidden="true"
        className="h-2 w-32 rounded-full"
        style={{ background: `linear-gradient(to right, ${stops})` }}
      />
      <div className="flex justify-between text-muted-foreground">
        <span>{legend.domain[0].toLocaleString()}</span>
        <span>{legend.domain[1].toLocaleString()}</span>
      </div>
    </div>
  );
});
ChoroplethLegend.displayName = "ChoroplethLegend";

type DataSummaryProps = {
  data: Record<string, number>;
  regions: ChoroplethRegion[];
  titleId: string;
};

function DataSummary({ data, regions, titleId }: DataSummaryProps): ReactNode {
  return (
    <div aria-labelledby={titleId} className="sr-only" role="region">
      <h3 id={titleId}>Choropleth data summary</h3>
      <table>
        <thead>
          <tr>
            <th scope="col">Region</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {regions.map((region) => {
            const value = data[region.id];
            return (
              <tr key={region.id}>
                <td>{region.name}</td>
                <td>
                  {value === undefined ? "no data" : value.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type ChildBuckets = {
  legend: ReactNode;
  tooltip: ReactNode;
};

function bucketChildren(children: ReactNode): ChildBuckets {
  const list: ReactNode[] = Array.isArray(children) ? children : [children];
  return list.reduce<ChildBuckets>(
    (accumulator, child) => {
      const name = displayName(child);
      if (name === ChoroplethLegend.displayName) accumulator.legend = child;
      else if (name === ChoroplethTooltip.displayName)
        accumulator.tooltip = child;
      return accumulator;
    },
    { legend: null, tooltip: null },
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

function useChoroplethState(arguments_: {
  colorScale: ChoroplethColorScale;
  data: Record<string, number>;
  domain: [number, number];
  missingColor: string;
  regions: ChoroplethRegion[];
}): ChoroplethCtx {
  const { colorScale, data, domain, missingColor, regions } = arguments_;
  const regionByid = useMemo(
    () =>
      new Map<string, ChoroplethRegion>(
        regions.map((region) => [region.id, region]),
      ),
    [regions],
  );

  const valueFor = useCallback(
    (id: string): null | number => data[id] ?? null,
    [data],
  );

  const colorFor = useCallback(
    (value?: number): string => {
      if (value === undefined) return missingColor;
      const [min, max] = domain;
      const span = max - min;
      const t = span === 0 ? 0.5 : (value - min) / span;
      return interpolateColor(colorScale, t);
    },
    [colorScale, domain, missingColor],
  );

  const [hover, setHover] = useState<Hover | undefined>();

  return useMemo<ChoroplethCtx>(
    () => ({
      colorFor,
      hover,
      legend: { domain, scale: colorScale },
      regionByid,
      setHover,
      valueFor,
    }),
    [colorFor, colorScale, domain, hover, regionByid, valueFor],
  );
}

type RegionsLayerProps = {
  onSelect: (region: ChoroplethRegion) => void;
  regions: ChoroplethRegion[];
  selectedId?: string;
  setHoverFn: (next?: Hover) => void;
};

function RegionsLayer({
  onSelect,
  regions,
  selectedId,
  setHoverFn,
}: RegionsLayerProps): ReactNode {
  return (
    <g>
      {regions.map((region) => (
        <RegionPath
          active={selectedId === region.id}
          key={region.id}
          onSelect={onSelect}
          region={region}
          selectedId={selectedId}
          setHoverFn={setHoverFn}
        />
      ))}
    </g>
  );
}

/**
 * Region-colored data map (choropleth). Standalone SVG primitive — no
 * external map library or tile provider required. Pass an array of
 * {@link ChoroplethRegion} polygons, a `data` map (region id → numeric
 * value), and an optional `colorScale`. Hover any region to surface the
 * tooltip; click to fire `onSelectRegion`.
 *
 * Compose with {@link ChoroplethLegend} (color ramp + min / max labels)
 * and {@link ChoroplethTooltip} (custom render-prop).
 *
 * @example
 * ```tsx
 * <ChoroplethMap
 *   regions={countries}
 *   data={{ FR: 2937, DE: 4082, IT: 2107 }}
 *   colorScale={["#f1f5f9", "#1d4ed8"]}
 * >
 *   <ChoroplethTooltip />
 *   <ChoroplethLegend title="GDP (B USD)" />
 * </ChoroplethMap>
 * ```
 *
 * @public
 */
export const ChoroplethMap = forwardRef<HTMLElement, ChoroplethMapProps>(
  (props, ref) => {
    const {
      children,
      className,
      colorScale = DEFAULT_SCALE,
      data,
      domain: domainProperty,
      labels,
      missingColor = resolveMissingColor(),
      onSelectRegion,
      regions,
      ...rest
    } = props;
    const titleId = useId();
    const resolvedLabels = useMemo(
      () => ({ ...DEFAULT_LABELS, ...labels }),
      [labels],
    );

    const domain = useMemo(
      () => domainProperty ?? computeDomain(Object.values(data)),
      [data, domainProperty],
    );

    const ctx = useChoroplethState({
      colorScale,
      data,
      domain,
      missingColor,
      regions,
    });
    const buckets = useMemo(() => bucketChildren(children), [children]);

    const [selectedId, setSelectedId] = useState<string | undefined>();

    const handleSelect = useCallback(
      (region: ChoroplethRegion) => {
        setSelectedId(region.id);
        onSelectRegion?.(region);
      },
      [onSelectRegion],
    );

    return (
      <ChoroplethContext.Provider value={ctx}>
        <section
          aria-label={resolvedLabels.region}
          className={cn(
            "relative aspect-[2/1] w-full overflow-hidden rounded-2xl border bg-background text-foreground",
            className,
          )}
          ref={ref}
          {...rest}
        >
          <svg
            aria-hidden="true"
            className="block h-full w-full"
            preserveAspectRatio="xMidYMid meet"
            viewBox={`0 0 ${VIEWBOX_WIDTH.toString()} ${VIEWBOX_HEIGHT.toString()}`}
          >
            <RegionsLayer
              onSelect={handleSelect}
              regions={regions}
              selectedId={selectedId}
              setHoverFn={ctx.setHover}
            />
          </svg>
          {buckets.tooltip}
          {buckets.legend}
          <DataSummary data={data} regions={regions} titleId={titleId} />
        </section>
      </ChoroplethContext.Provider>
    );
  },
);
ChoroplethMap.displayName = "ChoroplethMap";
