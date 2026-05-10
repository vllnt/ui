"use client";

import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { cn } from "../../lib/utils";

const MIN_ZOOM = 1;
const MAX_ZOOM = 32;
const ZOOM_STEP = 2;
const MS_PER_DAY = 86_400_000;
const TICK_TARGET_PX = 120;

/**
 * Color theme for tracks and event categories.
 *
 * @public
 */
export type InteractiveTimelineColor =
  | "amber"
  | "blue"
  | "emerald"
  | "neutral"
  | "purple"
  | "red"
  | "rose";

const COLOR_PALETTE: Record<
  InteractiveTimelineColor,
  { bar: string; chip: string; chipActive: string; dot: string }
> = {
  amber: {
    bar: "bg-amber-500/80",
    chip: "border-amber-400 text-amber-700 dark:text-amber-300",
    chipActive: "bg-amber-500 text-white border-amber-500",
    dot: "border-amber-500 bg-amber-500",
  },
  blue: {
    bar: "bg-blue-500/80",
    chip: "border-blue-400 text-blue-700 dark:text-blue-300",
    chipActive: "bg-blue-500 text-white border-blue-500",
    dot: "border-blue-500 bg-blue-500",
  },
  emerald: {
    bar: "bg-emerald-500/80",
    chip: "border-emerald-400 text-emerald-700 dark:text-emerald-300",
    chipActive: "bg-emerald-500 text-white border-emerald-500",
    dot: "border-emerald-500 bg-emerald-500",
  },
  neutral: {
    bar: "bg-muted-foreground/70",
    chip: "border-border text-muted-foreground",
    chipActive: "bg-foreground text-background border-foreground",
    dot: "border-muted-foreground bg-muted-foreground",
  },
  purple: {
    bar: "bg-purple-500/80",
    chip: "border-purple-400 text-purple-700 dark:text-purple-300",
    chipActive: "bg-purple-500 text-white border-purple-500",
    dot: "border-purple-500 bg-purple-500",
  },
  red: {
    bar: "bg-red-500/80",
    chip: "border-red-400 text-red-700 dark:text-red-300",
    chipActive: "bg-red-500 text-white border-red-500",
    dot: "border-red-500 bg-red-500",
  },
  rose: {
    bar: "bg-rose-500/80",
    chip: "border-rose-400 text-rose-700 dark:text-rose-300",
    chipActive: "bg-rose-500 text-white border-rose-500",
    dot: "border-rose-500 bg-rose-500",
  },
};

/**
 * Track / lane definition.
 *
 * @public
 */
export type InteractiveTimelineTrack = {
  /** Color theme. Defaults to `"neutral"`. */
  color?: InteractiveTimelineColor;
  /** Stable id; matches {@link InteractiveTimelineEvent.track}. */
  id: string;
  /** Display label. */
  label: ReactNode;
};

/**
 * Category definition (drives the legend filter).
 *
 * @public
 */
export type InteractiveTimelineCategory = {
  /** Color theme override; falls back to the track color. */
  color?: InteractiveTimelineColor;
  /** Stable id; matches {@link InteractiveTimelineEvent.category}. */
  id: string;
  /** Display label. */
  label: ReactNode;
};

/**
 * A point or duration event.
 *
 * @public
 */
export type InteractiveTimelineEvent = {
  /** Optional category id used by the filter chips. */
  category?: string;
  /** Optional explicit color theme for this event. Overrides track + category. */
  color?: InteractiveTimelineColor;
  /** Optional description shown in the tooltip. */
  description?: ReactNode;
  /** End date for duration events. Omit for point events. */
  endDate?: Date;
  /** Stable id. */
  id: string;
  /** Start date. */
  startDate: Date;
  /** Display title. */
  title: ReactNode;
  /** Optional id of the track to render in. Defaults to the first track. */
  track?: string;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type InteractiveTimelineLabels = {
  /** Aria-label for the timeline section. Defaults to `"Interactive timeline"`. */
  region?: string;
  /** Aria-label for the today button. Defaults to `"Jump to today"`. */
  today?: string;
  /** Aria-label for the zoom-in button. Defaults to `"Zoom in"`. */
  zoomIn?: string;
  /** Aria-label for the zoom-out button. Defaults to `"Zoom out"`. */
  zoomOut?: string;
};

const DEFAULT_LABELS = {
  region: "Interactive timeline",
  today: "Jump to today",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
} as const satisfies Required<InteractiveTimelineLabels>;

/**
 * Props for {@link InteractiveTimeline}.
 *
 * @public
 */
export type InteractiveTimelineProps = {
  /** Optional category filter list. Renders a chip row that toggles per category. */
  categories?: InteractiveTimelineCategory[];
  /** End of the visible window. */
  endDate: Date;
  /** Events to render. */
  events?: InteractiveTimelineEvent[];
  /** Localizable strings. */
  labels?: InteractiveTimelineLabels;
  /** Fires after a marker click. */
  onEventClick?: (event: InteractiveTimelineEvent) => void;
  /** Start of the visible window. */
  startDate: Date;
  /** Track / lane definitions. Falls back to a single anonymous lane. */
  tracks?: InteractiveTimelineTrack[];
} & ComponentPropsWithoutRef<"section">;

type TimelineCtx = {
  centerToday: () => void;
  labels: Required<InteractiveTimelineLabels>;
  toggleCategory: (id: string) => void;
  visibleCategories: ReadonlySet<string>;
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
};

const TimelineContext = createContext<null | TimelineCtx>(null);

function useTimelineContext(): TimelineCtx {
  const ctx = useContext(TimelineContext);
  if (!ctx) {
    throw new Error("InteractiveTimeline subcomponent used outside its root.");
  }
  return ctx;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function dateToOffset(date: Date, start: number, span: number): number {
  if (span <= 0) return 0;
  return (date.getTime() - start) / span;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function dayCount(start: number, end: number): number {
  return Math.max(1, Math.round((end - start) / MS_PER_DAY));
}

function buildTicks(
  start: number,
  end: number,
  containerWidth: number,
): { date: Date; offset: number }[] {
  if (containerWidth <= 0) return [];
  const targetCount = Math.max(2, Math.floor(containerWidth / TICK_TARGET_PX));
  const span = end - start;
  if (span <= 0) return [];
  const totalDays = dayCount(start, end);
  const stepDays = Math.max(1, Math.round(totalDays / (targetCount - 1)));
  const stepMs = stepDays * MS_PER_DAY;
  return Array.from({ length: targetCount }).map((_, index) => {
    const time = start + stepMs * index;
    const clamped = Math.min(time, end);
    return {
      date: new Date(clamped),
      offset: (clamped - start) / span,
    };
  });
}

function resolveEventColor(
  event: InteractiveTimelineEvent,
  tracks: InteractiveTimelineTrack[],
  categories: InteractiveTimelineCategory[],
): InteractiveTimelineColor {
  if (event.color) return event.color;
  if (event.category) {
    const cat = categories.find((c) => c.id === event.category);
    if (cat?.color) return cat.color;
  }
  if (event.track) {
    const track = tracks.find((t) => t.id === event.track);
    if (track?.color) return track.color;
  }
  return "neutral";
}

type AxisProps = {
  endTime: number;
  startTime: number;
  ticks: { date: Date; offset: number }[];
};

function Axis({ endTime, startTime, ticks }: AxisProps): ReactNode {
  return (
    <div
      aria-hidden="true"
      className="relative h-7 border-b border-border text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
      data-end={endTime}
      data-start={startTime}
    >
      {ticks.map((tick) => (
        <span
          className="absolute top-1 -translate-x-1/2 whitespace-nowrap"
          key={tick.date.getTime()}
          style={{ left: `${(tick.offset * 100).toString()}%` }}
        >
          {formatDate(tick.date)}
        </span>
      ))}
    </div>
  );
}

type TodayMarkerProps = {
  endTime: number;
  startTime: number;
};

function getNow(): number {
  return Date.now();
}

function noopUnsubscribe(): void {
  return;
}

function emptySubscribe(): () => void {
  return noopUnsubscribe;
}

function useNow(): number {
  return useSyncExternalStore(emptySubscribe, getNow, getNow);
}

function TodayMarker({ endTime, startTime }: TodayMarkerProps): ReactNode {
  const now = useNow();
  if (now < startTime || now > endTime) return null;
  const offset = (now - startTime) / (endTime - startTime);
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 z-20 w-px bg-primary"
      data-testid="today-marker"
      style={{ left: `${(offset * 100).toString()}%` }}
    >
      <span className="absolute -top-2 -translate-x-1/2 rounded bg-primary px-1 text-[10px] font-medium text-primary-foreground">
        Today
      </span>
    </div>
  );
}

type EventNodeProps = {
  active: boolean;
  categories: InteractiveTimelineCategory[];
  endTime: number;
  event: InteractiveTimelineEvent;
  onSelect: (event: InteractiveTimelineEvent) => void;
  startTime: number;
  tracks: InteractiveTimelineTrack[];
};

type EventGeometry = {
  isDuration: boolean;
  left: number;
  visible: boolean;
  width: number;
};

function eventGeometry(
  event: InteractiveTimelineEvent,
  startTime: number,
  endTime: number,
): EventGeometry {
  const span = endTime - startTime;
  const startOffset = dateToOffset(event.startDate, startTime, span);
  const endOffset = event.endDate
    ? dateToOffset(event.endDate, startTime, span)
    : startOffset;
  const visible =
    endOffset >= 0 && startOffset <= 1 && event.startDate.getTime() <= endTime;
  const left = clamp(startOffset, 0, 1);
  const width = Math.max(0, Math.min(1, endOffset) - left);
  return {
    isDuration: width > 0 && Boolean(event.endDate),
    left,
    visible,
    width,
  };
}

type EventTooltipProps = {
  event: InteractiveTimelineEvent;
  tooltipId: string;
};

function EventTooltip({ event, tooltipId }: EventTooltipProps): ReactNode {
  return (
    <span
      className="pointer-events-none absolute left-1/2 top-5 hidden -translate-x-1/2 whitespace-nowrap rounded border bg-popover px-2 py-1 text-[11px] font-medium text-popover-foreground shadow-md group-hover:block group-focus-visible:block"
      id={tooltipId}
      role="tooltip"
    >
      <span className="block">{event.title}</span>
      <span className="block text-[10px] text-muted-foreground">
        {formatDate(event.startDate)}
        {event.endDate ? ` – ${formatDate(event.endDate)}` : null}
      </span>
      {event.description ? (
        <span className="block text-[10px] text-muted-foreground">
          {event.description}
        </span>
      ) : null}
    </span>
  );
}

function EventNode({
  active,
  categories,
  endTime,
  event,
  onSelect,
  startTime,
  tracks,
}: EventNodeProps): ReactNode {
  const color = resolveEventColor(event, tracks, categories);
  const palette = COLOR_PALETTE[color];
  const { isDuration, left, visible, width } = eventGeometry(
    event,
    startTime,
    endTime,
  );
  if (!visible) return null;
  const titleText = typeof event.title === "string" ? event.title : "Event";
  const tooltipId = `${event.id}-tooltip`;

  const handleClick = (
    mouseEvent: ReactMouseEvent<HTMLButtonElement>,
  ): void => {
    mouseEvent.stopPropagation();
    onSelect(event);
  };

  return (
    <button
      aria-describedby={event.description ? tooltipId : undefined}
      aria-label={titleText}
      aria-pressed={active}
      className={cn(
        "group absolute top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isDuration ? "" : "-translate-x-1/2",
      )}
      data-event-id={event.id}
      data-event-track={event.track ?? ""}
      data-selected={active ? "true" : undefined}
      onClick={handleClick}
      style={{
        left: `${(left * 100).toString()}%`,
        width: isDuration ? `${(width * 100).toString()}%` : undefined,
      }}
      type="button"
    >
      {isDuration ? (
        <span
          className={cn(
            "block h-3 rounded-sm shadow-sm ring-2 ring-background",
            palette.bar,
            active ? "ring-primary" : "",
          )}
        />
      ) : (
        <span
          className={cn(
            "block size-3 rounded-full border-2 ring-2 ring-background",
            palette.dot,
            active ? "ring-primary" : "",
          )}
        />
      )}
      <EventTooltip event={event} tooltipId={tooltipId} />
    </button>
  );
}

type TrackRowProps = {
  categories: InteractiveTimelineCategory[];
  endTime: number;
  events: InteractiveTimelineEvent[];
  onSelect: (event: InteractiveTimelineEvent) => void;
  selectedId?: string;
  startTime: number;
  track: InteractiveTimelineTrack;
};

function TrackRow({
  categories,
  endTime,
  events,
  onSelect,
  selectedId,
  startTime,
  track,
}: TrackRowProps): ReactNode {
  const palette = COLOR_PALETTE[track.color ?? "neutral"];
  return (
    <div
      className="relative flex h-12 items-center border-t border-border/60"
      data-track-id={track.id}
    >
      <div className="absolute left-0 z-30 flex h-full w-32 shrink-0 items-center gap-2 border-r border-border bg-background px-3 text-xs font-medium">
        <span
          aria-hidden="true"
          className={cn("size-2 rounded-full", palette.dot)}
        />
        <span className="truncate">{track.label}</span>
      </div>
      <div className="relative ml-32 h-full flex-1">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
        {events.map((event) => (
          <EventNode
            active={selectedId === event.id}
            categories={categories}
            endTime={endTime}
            event={event}
            key={event.id}
            onSelect={onSelect}
            startTime={startTime}
            tracks={[track]}
          />
        ))}
      </div>
    </div>
  );
}

type ScrollAreaProps = {
  categories: InteractiveTimelineCategory[];
  endTime: number;
  events: InteractiveTimelineEvent[];
  onSelect: (event: InteractiveTimelineEvent) => void;
  selectedId?: string;
  startTime: number;
  tracks: InteractiveTimelineTrack[];
  zoom: number;
};

type ScrollDragHandlers = {
  onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
};

function useScrollDrag(
  ref: React.RefObject<HTMLDivElement | null>,
): ScrollDragHandlers {
  const dragRef = useRef<null | { originScroll: number; originX: number }>(
    null,
  );

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>): void => {
      const node = ref.current;
      if (!node) return;
      dragRef.current = {
        originScroll: node.scrollLeft,
        originX: event.clientX,
      };
      node.setPointerCapture(event.pointerId);
    },
    [ref],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>): void => {
      const node = ref.current;
      const drag = dragRef.current;
      if (!node || !drag) return;
      node.scrollLeft = drag.originScroll - (event.clientX - drag.originX);
    },
    [ref],
  );

  const onPointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>): void => {
      const node = ref.current;
      if (!node) return;
      if (node.hasPointerCapture(event.pointerId)) {
        node.releasePointerCapture(event.pointerId);
      }
      dragRef.current = null;
    },
    [ref],
  );

  return {
    onPointerCancel: onPointerEnd,
    onPointerDown,
    onPointerMove,
    onPointerUp: onPointerEnd,
  };
}

function ScrollArea({
  categories,
  endTime,
  events,
  onSelect,
  selectedId,
  startTime,
  tracks,
  zoom,
}: ScrollAreaProps): ReactNode {
  const ref = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const dragHandlers = useScrollDrag(ref);

  const handleRef = useCallback((node: HTMLDivElement | null) => {
    ref.current = node;
    if (node) setContainerWidth(node.clientWidth);
  }, []);

  const innerWidth = `${(zoom * 100).toString()}%`;
  const ticks = useMemo(
    () => buildTicks(startTime, endTime, containerWidth * zoom),
    [containerWidth, endTime, startTime, zoom],
  );

  return (
    <div
      className="relative w-full cursor-grab overflow-x-auto active:cursor-grabbing"
      data-zoom={zoom}
      ref={handleRef}
      {...dragHandlers}
    >
      <div className="relative" style={{ width: innerWidth }}>
        <Axis endTime={endTime} startTime={startTime} ticks={ticks} />
        <div className="relative">
          <TodayMarker endTime={endTime} startTime={startTime} />
          {tracks.map((track) => {
            const trackEvents = events.filter(
              (event) => (event.track ?? tracks[0]?.id) === track.id,
            );
            return (
              <TrackRow
                categories={categories}
                endTime={endTime}
                events={trackEvents}
                key={track.id}
                onSelect={onSelect}
                selectedId={selectedId}
                startTime={startTime}
                track={track}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Toolbar slot. Pass {@link InteractiveTimelineZoomIn},
 * {@link InteractiveTimelineZoomOut}, {@link InteractiveTimelineToday},
 * {@link InteractiveTimelineFilter} as children.
 *
 * @public
 */
export const InteractiveTimelineToolbar = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ children, className, ...rest }, ref) => (
  <div
    className={cn(
      "flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-3 py-2",
      className,
    )}
    ref={ref}
    role="toolbar"
    {...rest}
  >
    {children}
  </div>
));
InteractiveTimelineToolbar.displayName = "InteractiveTimelineToolbar";

/**
 * Zoom-in button. Doubles the zoom factor up to a max.
 *
 * @public
 */
export const InteractiveTimelineZoomIn = forwardRef<
  HTMLButtonElement,
  Omit<ComponentPropsWithoutRef<"button">, "type">
>(({ className, ...rest }, ref) => {
  const { labels, zoomIn } = useTimelineContext();
  return (
    <button
      aria-label={labels.zoomIn}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md border border-border bg-background text-sm font-medium hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      onClick={zoomIn}
      ref={ref}
      type="button"
      {...rest}
    >
      <span aria-hidden="true">+</span>
    </button>
  );
});
InteractiveTimelineZoomIn.displayName = "InteractiveTimelineZoomIn";

/**
 * Zoom-out button.
 *
 * @public
 */
export const InteractiveTimelineZoomOut = forwardRef<
  HTMLButtonElement,
  Omit<ComponentPropsWithoutRef<"button">, "type">
>(({ className, ...rest }, ref) => {
  const { labels, zoomOut } = useTimelineContext();
  return (
    <button
      aria-label={labels.zoomOut}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md border border-border bg-background text-sm font-medium hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      onClick={zoomOut}
      ref={ref}
      type="button"
      {...rest}
    >
      <span aria-hidden="true">−</span>
    </button>
  );
});
InteractiveTimelineZoomOut.displayName = "InteractiveTimelineZoomOut";

/**
 * Today button. Centers the view on `Date.now()` if it falls inside the
 * timeline window.
 *
 * @public
 */
export const InteractiveTimelineToday = forwardRef<
  HTMLButtonElement,
  Omit<ComponentPropsWithoutRef<"button">, "type">
>(({ children, className, ...rest }, ref) => {
  const { centerToday, labels } = useTimelineContext();
  return (
    <button
      aria-label={labels.today}
      className={cn(
        "inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      onClick={centerToday}
      ref={ref}
      type="button"
      {...rest}
    >
      {children ?? "Today"}
    </button>
  );
});
InteractiveTimelineToday.displayName = "InteractiveTimelineToday";

/**
 * Category filter chips. Toggles visibility of events by category.
 *
 * @public
 */
export type InteractiveTimelineFilterProps = {
  categories: InteractiveTimelineCategory[];
} & Omit<ComponentPropsWithoutRef<"div">, "children">;

export const InteractiveTimelineFilter = forwardRef<
  HTMLDivElement,
  InteractiveTimelineFilterProps
>(({ categories, className, ...rest }, ref) => {
  const { toggleCategory, visibleCategories } = useTimelineContext();
  return (
    <div
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      ref={ref}
      role="group"
      {...rest}
    >
      {categories.map((category) => {
        const active = visibleCategories.has(category.id);
        const palette = COLOR_PALETTE[category.color ?? "neutral"];
        return (
          <button
            aria-pressed={active}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
              active ? palette.chipActive : palette.chip,
            )}
            data-category-id={category.id}
            key={category.id}
            onClick={() => {
              toggleCategory(category.id);
            }}
            type="button"
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
});
InteractiveTimelineFilter.displayName = "InteractiveTimelineFilter";

const FALLBACK_TRACK: InteractiveTimelineTrack = {
  color: "neutral",
  id: "default",
  label: "Events",
};

function noop(): void {
  return;
}

function useToolbarHandlers(arguments_: {
  endTime: number;
  scrollerId: string;
  setZoom: (next: ((previous: number) => number) | number) => void;
  startTime: number;
  zoom: number;
}): {
  centerToday: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
} {
  const { endTime, scrollerId, setZoom, startTime } = arguments_;
  const zoomIn = useCallback(() => {
    setZoom((current) => clamp(current * ZOOM_STEP, MIN_ZOOM, MAX_ZOOM));
  }, [setZoom]);
  const zoomOut = useCallback(() => {
    setZoom((current) => clamp(current / ZOOM_STEP, MIN_ZOOM, MAX_ZOOM));
  }, [setZoom]);
  const centerToday = useCallback(() => {
    if (typeof document === "undefined") return;
    const node = document.querySelector<HTMLElement>(
      `[data-scroller-id="${scrollerId}"]`,
    );
    if (!node) return;
    const span = endTime - startTime;
    if (span <= 0) return;
    const now = Date.now();
    const offset = clamp((now - startTime) / span, 0, 1);
    const targetX = offset * node.scrollWidth - node.clientWidth / 2;
    node.scrollLeft = clamp(targetX, 0, node.scrollWidth);
  }, [endTime, scrollerId, startTime]);
  return { centerToday, zoomIn, zoomOut };
}

type FilterState = {
  filteredEvents: InteractiveTimelineEvent[];
  toggleCategory: (id: string) => void;
  visibleCategories: ReadonlySet<string>;
};

type SelectionState = {
  handleSelect: (event: InteractiveTimelineEvent) => void;
  selectedId?: string;
};

type Frame = {
  endTime: number;
  resolvedLabels: Required<InteractiveTimelineLabels>;
  startTime: number;
  tracks: InteractiveTimelineTrack[];
};

function useTimelineFrame(arguments_: {
  endDate: Date;
  labels?: InteractiveTimelineLabels;
  startDate: Date;
  trackProperty?: InteractiveTimelineTrack[];
}): Frame {
  const { endDate, labels, startDate, trackProperty } = arguments_;
  const tracks =
    trackProperty && trackProperty.length > 0
      ? trackProperty
      : [FALLBACK_TRACK];
  const resolvedLabels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labels }),
    [labels],
  );
  return {
    endTime: endDate.getTime(),
    resolvedLabels,
    startTime: startDate.getTime(),
    tracks,
  };
}

function useEventSelection(
  onEventClick: (event: InteractiveTimelineEvent) => void,
): SelectionState {
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const handleSelect = useCallback(
    (event: InteractiveTimelineEvent) => {
      setSelectedId(event.id);
      onEventClick(event);
    },
    [onEventClick],
  );
  return { handleSelect, selectedId };
}

function useTimelineContextValue(arguments_: {
  centerToday: () => void;
  labels: Required<InteractiveTimelineLabels>;
  toggleCategory: (id: string) => void;
  visibleCategories: ReadonlySet<string>;
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
}): TimelineCtx {
  const {
    centerToday,
    labels,
    toggleCategory,
    visibleCategories,
    zoom,
    zoomIn,
    zoomOut,
  } = arguments_;
  return useMemo<TimelineCtx>(
    () => ({
      centerToday,
      labels,
      toggleCategory,
      visibleCategories,
      zoom,
      zoomIn,
      zoomOut,
    }),
    [
      centerToday,
      labels,
      toggleCategory,
      visibleCategories,
      zoom,
      zoomIn,
      zoomOut,
    ],
  );
}

function useTimelineFilter(
  categories: InteractiveTimelineCategory[],
  events: InteractiveTimelineEvent[],
): FilterState {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());

  const visibleCategories = useMemo(
    () =>
      new Set(
        categories
          .filter((category) => !hidden.has(category.id))
          .map((category) => category.id),
      ),
    [categories, hidden],
  );

  const toggleCategory = useCallback((id: string) => {
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filteredEvents = useMemo(() => {
    if (categories.length === 0) return events;
    return events.filter((event) => {
      if (!event.category) return true;
      return !hidden.has(event.category);
    });
  }, [categories.length, events, hidden]);

  return { filteredEvents, toggleCategory, visibleCategories };
}

/**
 * Zoomable, pannable, multi-track timeline. Drag horizontally to pan;
 * use {@link InteractiveTimelineZoomIn} / {@link InteractiveTimelineZoomOut}
 * to change zoom; click events to select. Out of scope for the MVP:
 * minimap, virtual rendering, image export, pinch-to-zoom — pan + button
 * zoom cover the data-rich case.
 *
 * @example
 * ```tsx
 * <InteractiveTimeline
 *   startDate={new Date("2024-01-01")}
 *   endDate={new Date("2026-12-31")}
 *   tracks={[{ id: "release", label: "Releases", color: "blue" }]}
 *   events={[
 *     { id: "v1", title: "v1.0", startDate: new Date("2024-06-01"), track: "release" },
 *   ]}
 *   onEventClick={(event) => console.info(event.id)}
 * >
 *   <InteractiveTimelineToolbar>
 *     <InteractiveTimelineZoomIn />
 *     <InteractiveTimelineZoomOut />
 *     <InteractiveTimelineToday />
 *   </InteractiveTimelineToolbar>
 * </InteractiveTimeline>
 * ```
 *
 * @public
 */
export const InteractiveTimeline = forwardRef<
  HTMLElement,
  InteractiveTimelineProps
>((props, ref) => {
  const {
    categories = [],
    children,
    className,
    endDate,
    events = [],
    labels,
    onEventClick = noop,
    startDate,
    tracks: trackProperty,
    ...rest
  } = props;

  const { endTime, resolvedLabels, startTime, tracks } = useTimelineFrame({
    endDate,
    labels,
    startDate,
    trackProperty,
  });
  const scrollerId = useId();

  const [zoom, setZoom] = useState<number>(1);

  const { filteredEvents, toggleCategory, visibleCategories } =
    useTimelineFilter(categories, events);

  const { centerToday, zoomIn, zoomOut } = useToolbarHandlers({
    endTime,
    scrollerId,
    setZoom,
    startTime,
    zoom,
  });

  const { handleSelect, selectedId } = useEventSelection(onEventClick);

  const ctx = useTimelineContextValue({
    centerToday,
    labels: resolvedLabels,
    toggleCategory,
    visibleCategories,
    zoom,
    zoomIn,
    zoomOut,
  });

  return (
    <TimelineContext.Provider value={ctx}>
      <section
        aria-label={resolvedLabels.region}
        className={cn(
          "flex w-full flex-col overflow-hidden rounded-2xl border bg-background text-foreground",
          className,
        )}
        ref={ref}
        {...rest}
      >
        {children}
        <div data-scroller-id={scrollerId} id={scrollerId}>
          <ScrollArea
            categories={categories}
            endTime={endTime}
            events={filteredEvents}
            onSelect={handleSelect}
            selectedId={selectedId}
            startTime={startTime}
            tracks={tracks}
            zoom={zoom}
          />
        </div>
      </section>
    </TimelineContext.Provider>
  );
});
InteractiveTimeline.displayName = "InteractiveTimeline";
