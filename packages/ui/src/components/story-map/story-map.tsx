"use client";

import {
  Children,
  type ComponentPropsWithoutRef,
  createContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
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
 * Color theme for the chapter marker.
 *
 * @public
 */
export type StoryMapColor =
  | "amber"
  | "blue"
  | "emerald"
  | "purple"
  | "red"
  | "rose";

const PALETTE: Record<StoryMapColor, string> = {
  amber: "fill-amber-500",
  blue: "fill-blue-500",
  emerald: "fill-emerald-500",
  purple: "fill-purple-500",
  red: "fill-red-500",
  rose: "fill-rose-500",
};

/**
 * Optional image media rendered inside the chapter card.
 *
 * @public
 */
export type StoryMapMedia = {
  /** Required alt text. */
  alt: string;
  /** Optional caption rendered beneath the image. */
  caption?: ReactNode;
  /** Image URL. */
  src: string;
  /** Media kind. Image is the supported value today. */
  type: "image";
};

/**
 * Localizable strings.
 *
 * @public
 */
export type StoryMapLabels = {
  /** Aria-label for the narrative column. Defaults to `"Narrative"`. */
  narrative?: string;
  /** Aria-label for the progress strip. Defaults to `"Story progress"`. */
  progress?: string;
  /** Aria-label for the map region. Defaults to `"Story map"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  narrative: "Narrative",
  progress: "Story progress",
  region: "Story map",
} as const satisfies Required<StoryMapLabels>;

type RegisterArguments = {
  center: GeoPosition;
  color: StoryMapColor;
  id: string;
  zoom: number;
};

type Ctx = {
  activeId?: string;
  registerChapter: (id: string, node: HTMLElement | null) => void;
  registerMarker: (entry: RegisterArguments) => void;
  setActiveId: (id: string) => void;
  unregisterMarker: (id: string) => void;
};

const StoryMapContext = createContext<Ctx | null>(null);

function useStoryMapContext(): Ctx {
  const ctx = use(StoryMapContext);
  if (!ctx) {
    throw new Error("StoryMap subcomponent used outside its root.");
  }
  return ctx;
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

/**
 * Props for {@link StoryMapChapter}.
 *
 * @public
 */
export type StoryMapChapterProps = {
  /** Center the map on this position when the chapter is active. */
  center: GeoPosition;
  /** Color theme for the chapter marker. Defaults to `"red"`. */
  color?: StoryMapColor;
  /** Stable id. Defaults to a generated id. */
  id?: string;
  /** Optional image media. */
  media?: StoryMapMedia;
  /** Optional subtitle. */
  subtitle?: ReactNode;
  /** Chapter title. */
  title: ReactNode;
  /** Map zoom factor when the chapter is active. `1` shows the full world; `8` zooms in tight. Defaults to `2`. */
  zoom?: number;
} & Omit<ComponentPropsWithoutRef<"article">, "id" | "title">;

type ChapterMediaProps = {
  media: StoryMapMedia;
};

function ChapterMedia({ media }: ChapterMediaProps): ReactNode {
  return (
    <figure className="overflow-hidden rounded-xl border bg-muted">
      <img
        alt={media.alt}
        className="aspect-video w-full object-cover"
        loading="lazy"
        src={media.src}
      />
      {media.caption ? (
        <figcaption className="border-t bg-background px-3 py-2 text-xs text-muted-foreground">
          {media.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

type ChapterHeaderProps = {
  subtitle?: ReactNode;
  title: ReactNode;
};

function ChapterHeader({ subtitle, title }: ChapterHeaderProps): ReactNode {
  return (
    <header className="space-y-1">
      <h3 className="text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      {subtitle ? (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      ) : null}
    </header>
  );
}

/**
 * Single chapter section. Place narrative paragraphs as children.
 *
 * @public
 */
export const StoryMapChapter = ({
  ref: forwardedRef,
  ...props
}: StoryMapChapterProps & { ref?: React.Ref<HTMLElement> }) => {
  const {
    center,
    children,
    className,
    color = "red",
    id,
    media,
    subtitle,
    title,
    zoom = 2,
    ...rest
  } = props;
  const generatedId = useId();
  const chapterId = id ?? generatedId;
  const localRef = useRef<HTMLElement | null>(null);
  const { registerChapter, registerMarker, unregisterMarker } =
    useStoryMapContext();

  useEffect(() => {
    registerMarker({ center, color, id: chapterId, zoom });
    return () => {
      unregisterMarker(chapterId);
    };
  }, [center, chapterId, color, registerMarker, unregisterMarker, zoom]);

  const refCallback = useCallback(
    (node: HTMLElement | null) => {
      localRef.current = node;
      registerChapter(chapterId, node);
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [chapterId, forwardedRef, registerChapter],
  );

  return (
    <article
      className={cn(
        "flex min-h-screen flex-col justify-center gap-3 py-12",
        className,
      )}
      data-chapter-id={chapterId}
      id={chapterId}
      ref={refCallback}
      {...rest}
    >
      <ChapterHeader subtitle={subtitle} title={title} />
      {media ? <ChapterMedia media={media} /> : null}
      {children ? (
        <div className="space-y-2 text-sm leading-relaxed text-foreground [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground">
          {children}
        </div>
      ) : null}
    </article>
  );
};
StoryMapChapter.displayName = "StoryMapChapter";

type Marker = RegisterArguments;

type StageProps = {
  activeId?: string;
  backdrop?: string;
  backdropAlt?: string;
  markers: Marker[];
};

function Stage({
  activeId,
  backdrop,
  backdropAlt,
  markers,
}: StageProps): ReactNode {
  const active = markers.find((marker) => marker.id === activeId);
  const zoom = active?.zoom ?? 1;
  const innerWidth = VIEWBOX_WIDTH / zoom;
  const innerHeight = VIEWBOX_HEIGHT / zoom;
  const center = active
    ? projectEquirectangular(active.center)
    : { x: VIEWBOX_WIDTH / 2, y: VIEWBOX_HEIGHT / 2 };
  const viewX = center.x - innerWidth / 2;
  const viewY = center.y - innerHeight / 2;
  return (
    <svg
      aria-hidden="true"
      className="block h-full w-full transition-[viewBox] duration-500"
      data-active-chapter-id={activeId ?? ""}
      data-active-zoom={zoom}
      preserveAspectRatio="xMidYMid slice"
      viewBox={`${viewX.toString()} ${viewY.toString()} ${innerWidth.toString()} ${innerHeight.toString()}`}
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
      {markers.map((marker) => {
        const point = projectEquirectangular(marker.center);
        const isActive = marker.id === activeId;
        return (
          <g
            data-marker-active={isActive ? "true" : undefined}
            data-marker-id={marker.id}
            key={marker.id}
            transform={`translate(${point.x.toString()}, ${point.y.toString()})`}
          >
            <circle
              className={cn("stroke-background", PALETTE[marker.color])}
              r={isActive ? 12 : 6}
              strokeWidth={2}
            />
            {isActive ? (
              <circle
                className={cn("opacity-30", PALETTE[marker.color])}
                r={24}
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

function chapterIdsFromChildren(children: ReactNode): string[] {
  const ids: string[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const element = child as ReactElement<{ id?: string }>;
    if (typeof element.props.id === "string") ids.push(element.props.id);
  });
  return ids;
}

type ProgressStripProps = {
  activeId?: string;
  ids: string[];
  label: string;
};

function ProgressStrip({
  activeId,
  ids,
  label,
}: ProgressStripProps): ReactNode {
  if (ids.length === 0) return null;
  const activeIndex = activeId ? ids.indexOf(activeId) : -1;
  const ratio = activeIndex < 0 ? 0 : (activeIndex + 1) / ids.length;
  return (
    <div
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(ratio * 100)}
      className="sticky top-0 z-20 h-1 w-full bg-border"
      role="progressbar"
    >
      <span
        className="block h-full bg-primary transition-[width] duration-200"
        style={{ width: `${(ratio * 100).toString()}%` }}
      />
    </div>
  );
}

function useChapterRegistry(): {
  activeId?: string;
  markerEntries: Marker[];
  registerChapter: (id: string, node: HTMLElement | null) => void;
  registerMarker: (entry: RegisterArguments) => void;
  setActiveId: (id: string) => void;
  unregisterMarker: (id: string) => void;
} {
  const chapterMapRef = useRef<Map<string, HTMLElement>>(new Map());
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const [chapterIds, setChapterIds] = useState<string[]>([]);
  const [markerEntries, setMarkerEntries] = useState<Marker[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>();

  const registerChapter = useCallback(
    (id: string, node: HTMLElement | null) => {
      const map = chapterMapRef.current;
      if (node) map.set(id, node);
      else map.delete(id);
      setChapterIds([...map.keys()]);
    },
    [],
  );

  const registerMarker = useCallback((entry: RegisterArguments) => {
    markersRef.current.set(entry.id, entry);
    setMarkerEntries([...markersRef.current.values()]);
  }, []);

  const unregisterMarker = useCallback((id: string) => {
    markersRef.current.delete(id);
    setMarkerEntries([...markersRef.current.values()]);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const first = visible[0];
        if (first?.target instanceof HTMLElement) {
          const id = first.target.dataset.chapterId;
          if (id) setActiveId(id);
        }
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: 0.1 },
    );
    [...chapterMapRef.current.values()].forEach((node) => {
      observer.observe(node);
    });
    return () => {
      observer.disconnect();
    };
  }, [chapterIds]);

  return {
    activeId,
    markerEntries,
    registerChapter,
    registerMarker,
    setActiveId,
    unregisterMarker,
  };
}

/**
 * Props for {@link StoryMap}.
 *
 * @public
 */
export type StoryMapProps = {
  /** Optional URL of a backdrop image (world map, terrain). */
  backdrop?: string;
  /** Aria-label for the backdrop image. */
  backdropAlt?: string;
  /** Localizable strings. */
  labels?: StoryMapLabels;
} & ComponentPropsWithoutRef<"section">;

type ShellProps = {
  activeId?: string;
  backdrop?: string;
  backdropAlt?: string;
  children: ReactNode;
  className?: string;
  labels: Required<StoryMapLabels>;
  markers: Marker[];
  orderedIds: string[];
  titleId: string;
};

const Shell = function Shell({
  ref,
  ...props
}: ShellProps & { ref?: React.Ref<HTMLElement> }) {
  const {
    activeId,
    backdrop,
    backdropAlt,
    children,
    className,
    labels,
    markers,
    orderedIds,
    titleId,
  } = props;
  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-2xl border bg-background text-foreground md:flex-row",
        className,
      )}
      ref={ref}
    >
      <span className="sr-only" id={titleId}>
        {labels.region}
      </span>
      <ProgressStrip
        activeId={activeId}
        ids={orderedIds}
        label={labels.progress}
      />
      <div
        className="sticky top-0 hidden h-[80vh] flex-1 self-start md:block"
        data-story-map-stage
      >
        <Stage
          activeId={activeId}
          backdrop={backdrop}
          backdropAlt={backdropAlt}
          markers={markers}
        />
      </div>
      <div
        aria-label={labels.narrative}
        className="flex-1 px-6 md:max-w-xl"
        role="region"
      >
        {children}
      </div>
      <div
        className="block aspect-[2/1] w-full border-t border-border md:hidden"
        data-story-map-stage-mobile
      >
        <Stage
          activeId={activeId}
          backdrop={backdrop}
          backdropAlt={backdropAlt}
          markers={markers}
        />
      </div>
    </section>
  );
};

/**
 * Scroll-driven narrative map. Place {@link StoryMapChapter} children
 * in the narrative column; an `IntersectionObserver` tracks the active
 * chapter and the SVG map shifts to center on its `[lng, lat]` and
 * `zoom`. Standalone SVG primitive — no external map library required.
 *
 * @example
 * ```tsx
 * <StoryMap>
 *   <StoryMapChapter
 *     center={[12.49, 41.89]}
 *     zoom={4}
 *     title="The Fall of Rome"
 *   >
 *     <p>In 476 AD...</p>
 *   </StoryMapChapter>
 *   <StoryMapChapter
 *     center={[28.98, 41.01]}
 *     zoom={4}
 *     title="Constantinople Endures"
 *   >
 *     <p>While Rome fell, Constantinople thrived...</p>
 *   </StoryMapChapter>
 * </StoryMap>
 * ```
 *
 * @public
 */
export const StoryMap = ({
  ref,
  ...props
}: StoryMapProps & { ref?: React.Ref<HTMLElement> }) => {
  const { backdrop, backdropAlt, children, className, labels, ...rest } = props;
  const titleId = useId();
  const resolvedLabels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labels }),
    [labels],
  );

  const {
    activeId,
    markerEntries,
    registerChapter,
    registerMarker,
    setActiveId,
    unregisterMarker,
  } = useChapterRegistry();

  const ctx = useMemo<Ctx>(
    () => ({
      activeId,
      registerChapter,
      registerMarker,
      setActiveId,
      unregisterMarker,
    }),
    [activeId, registerChapter, registerMarker, setActiveId, unregisterMarker],
  );

  const orderedIds = useMemo(
    () => chapterIdsFromChildren(children),
    [children],
  );

  return (
    <StoryMapContext.Provider value={ctx}>
      <Shell
        activeId={activeId}
        backdrop={backdrop}
        backdropAlt={backdropAlt}
        className={className}
        labels={resolvedLabels}
        markers={markerEntries}
        orderedIds={orderedIds}
        ref={ref}
        titleId={titleId}
        {...rest}
      >
        {children}
      </Shell>
    </StoryMapContext.Provider>
  );
};
StoryMap.displayName = "StoryMap";
