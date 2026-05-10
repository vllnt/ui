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

import { cn } from "../../lib/utils";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 8;
const ZOOM_STEP = 1.25;
const ROTATE_STEP = 90;

/**
 * Image source for {@link PrimarySourceViewer}.
 *
 * @public
 */
export type PrimarySource = {
  /** Required alt text for assistive tech. */
  alt: string;
  /** Image URL. */
  src: string;
  /** Source kind. Image is the supported value today. */
  type: "image";
};

/**
 * Color theme for {@link PrimarySourceAnnotation}.
 *
 * @public
 */
export type AnnotationColor =
  | "amber"
  | "blue"
  | "emerald"
  | "purple"
  | "red"
  | "rose";

const ANNOTATION_PALETTE: Record<
  AnnotationColor,
  { border: string; chip: string; fill: string }
> = {
  amber: {
    border: "border-amber-500",
    chip: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    fill: "bg-amber-500/15",
  },
  blue: {
    border: "border-blue-500",
    chip: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
    fill: "bg-blue-500/15",
  },
  emerald: {
    border: "border-emerald-500",
    chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    fill: "bg-emerald-500/15",
  },
  purple: {
    border: "border-purple-500",
    chip: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
    fill: "bg-purple-500/15",
  },
  red: {
    border: "border-red-500",
    chip: "bg-red-500/15 text-red-700 dark:text-red-300",
    fill: "bg-red-500/15",
  },
  rose: {
    border: "border-rose-500",
    chip: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    fill: "bg-rose-500/15",
  },
};

/**
 * Localizable strings.
 *
 * @public
 */
export type PrimarySourceViewerLabels = {
  /** Aria-label for the viewer region. Defaults to `"Primary source viewer"`. */
  region?: string;
  /** Aria-label for the rotate button. Defaults to `"Rotate"`. */
  rotate?: string;
  /** Aria-label for the zoom-in button. Defaults to `"Zoom in"`. */
  zoomIn?: string;
  /** Aria-label for the zoom-out button. Defaults to `"Zoom out"`. */
  zoomOut?: string;
};

const DEFAULT_LABELS = {
  region: "Primary source viewer",
  rotate: "Rotate",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
} as const satisfies Required<PrimarySourceViewerLabels>;

type ViewerCtx = {
  labels: Required<PrimarySourceViewerLabels>;
  rotate: () => void;
  rotation: number;
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
};

const ViewerContext = createContext<null | ViewerCtx>(null);

function useViewerContext(): ViewerCtx {
  const ctx = useContext(ViewerContext);
  if (!ctx) {
    throw new Error("PrimarySourceViewer subcomponent used outside its root.");
  }
  return ctx;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function useViewerState(
  resolvedLabels: Required<PrimarySourceViewerLabels>,
): ViewerCtx {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const zoomIn = useCallback(() => {
    setZoom((current) => clamp(current * ZOOM_STEP, MIN_ZOOM, MAX_ZOOM));
  }, []);
  const zoomOut = useCallback(() => {
    setZoom((current) => clamp(current / ZOOM_STEP, MIN_ZOOM, MAX_ZOOM));
  }, []);
  const rotate = useCallback(() => {
    setRotation((current) => (current + ROTATE_STEP) % 360);
  }, []);

  return useMemo(
    () => ({
      labels: resolvedLabels,
      rotate,
      rotation,
      zoom,
      zoomIn,
      zoomOut,
    }),
    [resolvedLabels, rotate, rotation, zoom, zoomIn, zoomOut],
  );
}

/**
 * Toolbar slot. Render the zoom / rotate buttons as children.
 *
 * @public
 */
export const PrimarySourceToolbar = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ children, className, ...rest }, ref) => (
  <div
    className={cn(
      "flex flex-wrap items-center gap-2 border-b border-border bg-muted/40 px-4 py-2",
      className,
    )}
    ref={ref}
    role="toolbar"
    {...rest}
  >
    {children}
  </div>
));
PrimarySourceToolbar.displayName = "PrimarySourceToolbar";

type ToolbarButtonProps = {
  ariaLabel: string;
  glyph: ReactNode;
  onActivate: () => void;
} & Omit<ComponentPropsWithoutRef<"button">, "aria-label" | "onClick" | "type">;

const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ ariaLabel, className, glyph, onActivate, ...rest }, ref) => (
    <button
      aria-label={ariaLabel}
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-border bg-background px-2 text-sm font-medium hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
ToolbarButton.displayName = "ToolbarButton";

/**
 * Zoom-in button.
 *
 * @public
 */
export const PrimarySourceZoomIn = forwardRef<
  HTMLButtonElement,
  Omit<ComponentPropsWithoutRef<"button">, "aria-label" | "onClick" | "type">
>(({ ...rest }, ref) => {
  const { labels, zoomIn } = useViewerContext();
  return (
    <ToolbarButton
      ariaLabel={labels.zoomIn}
      glyph="+"
      onActivate={zoomIn}
      ref={ref}
      {...rest}
    />
  );
});
PrimarySourceZoomIn.displayName = "PrimarySourceZoomIn";

/**
 * Zoom-out button.
 *
 * @public
 */
export const PrimarySourceZoomOut = forwardRef<
  HTMLButtonElement,
  Omit<ComponentPropsWithoutRef<"button">, "aria-label" | "onClick" | "type">
>(({ ...rest }, ref) => {
  const { labels, zoomOut } = useViewerContext();
  return (
    <ToolbarButton
      ariaLabel={labels.zoomOut}
      glyph="−"
      onActivate={zoomOut}
      ref={ref}
      {...rest}
    />
  );
});
PrimarySourceZoomOut.displayName = "PrimarySourceZoomOut";

/**
 * Rotate-90-degrees button.
 *
 * @public
 */
export const PrimarySourceRotate = forwardRef<
  HTMLButtonElement,
  Omit<ComponentPropsWithoutRef<"button">, "aria-label" | "onClick" | "type">
>(({ ...rest }, ref) => {
  const { labels, rotate } = useViewerContext();
  return (
    <ToolbarButton
      ariaLabel={labels.rotate}
      glyph="⟳"
      onActivate={rotate}
      ref={ref}
      {...rest}
    />
  );
});
PrimarySourceRotate.displayName = "PrimarySourceRotate";

/**
 * Region in the source image, expressed as percentages of width / height.
 *
 * @public
 */
export type AnnotationRegion = {
  /** Height as a percentage of the source height (0–100). */
  height: number;
  /** Width as a percentage of the source width (0–100). */
  width: number;
  /** X offset as a percentage of the source width (0–100). */
  x: number;
  /** Y offset as a percentage of the source height (0–100). */
  y: number;
};

/**
 * Props for {@link PrimarySourceAnnotation}.
 *
 * @public
 */
export type PrimarySourceAnnotationProps = {
  /** Optional category label rendered as a chip in the tooltip. */
  category?: ReactNode;
  /** Color theme. Defaults to `"amber"`. */
  color?: AnnotationColor;
  /** Stable id. Defaults to a generated id. */
  id?: string;
  /** Note text rendered in the tooltip. */
  note: ReactNode;
  /** Highlighted region (percentages 0–100). */
  region: AnnotationRegion;
} & Omit<ComponentPropsWithoutRef<"button">, "id" | "type">;

/**
 * Container slot for the annotation overlay.
 *
 * @public
 */
export const PrimarySourceAnnotations = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ children, className, ...rest }, ref) => (
  <div
    aria-label="Annotations"
    className={cn("pointer-events-none absolute inset-0 z-10", className)}
    ref={ref}
    {...rest}
  >
    {children}
  </div>
));
PrimarySourceAnnotations.displayName = "PrimarySourceAnnotations";

type AnnotationTooltipProps = {
  category?: ReactNode;
  color: AnnotationColor;
  note: ReactNode;
  tooltipId: string;
};

function AnnotationTooltip({
  category,
  color,
  note,
  tooltipId,
}: AnnotationTooltipProps): ReactNode {
  const palette = ANNOTATION_PALETTE[color];
  return (
    <span
      className="pointer-events-none absolute left-0 top-full z-10 mt-1 hidden min-w-44 max-w-sm rounded-md border bg-popover px-2 py-1 text-left text-xs text-popover-foreground shadow-md group-hover:block group-focus-visible:block"
      id={tooltipId}
      role="tooltip"
    >
      {category ? (
        <span
          className={cn(
            "mb-1 inline-block rounded px-1 text-[10px] font-medium uppercase tracking-wide",
            palette.chip,
          )}
        >
          {category}
        </span>
      ) : null}
      <span className="block">{note}</span>
    </span>
  );
}

/**
 * A single annotated region.
 *
 * @public
 */
export const PrimarySourceAnnotation = forwardRef<
  HTMLButtonElement,
  PrimarySourceAnnotationProps
>((props, ref) => {
  const {
    category,
    className,
    color = "amber",
    id,
    note,
    region,
    ...rest
  } = props;
  const generatedId = useId();
  const annotationId = id ?? generatedId;
  const palette = ANNOTATION_PALETTE[color];
  const tooltipId = `${annotationId}-tooltip`;
  const noteText = typeof note === "string" ? note : "Annotation";
  return (
    <button
      aria-describedby={tooltipId}
      aria-label={noteText}
      className={cn(
        "group pointer-events-auto absolute rounded-md border-2 outline-none transition-colors hover:bg-foreground/10 focus-visible:bg-foreground/10",
        palette.border,
        palette.fill,
        className,
      )}
      data-annotation-id={annotationId}
      ref={ref}
      style={{
        height: `${region.height.toString()}%`,
        left: `${region.x.toString()}%`,
        top: `${region.y.toString()}%`,
        width: `${region.width.toString()}%`,
      }}
      type="button"
      {...rest}
    >
      <AnnotationTooltip
        category={category}
        color={color}
        note={note}
        tooltipId={tooltipId}
      />
    </button>
  );
});
PrimarySourceAnnotation.displayName = "PrimarySourceAnnotation";

/**
 * Side panel for transcription text.
 *
 * @public
 */
export const PrimarySourceTranscription = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"aside">
>(({ children, className, ...rest }, ref) => (
  <aside
    aria-label="Transcription"
    className={cn(
      "flex h-full flex-col gap-2 border-l border-border bg-background p-4 text-sm leading-relaxed",
      className,
    )}
    ref={ref}
    {...rest}
  >
    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      Transcription
    </h3>
    <div className="space-y-2 text-foreground">{children}</div>
  </aside>
));
PrimarySourceTranscription.displayName = "PrimarySourceTranscription";

/**
 * Wrapper for metadata + discussion-questions slots beneath the viewer.
 *
 * @public
 */
export const PrimarySourceContext = forwardRef<
  HTMLElement,
  ComponentPropsWithoutRef<"footer">
>(({ children, className, ...rest }, ref) => (
  <footer
    className={cn(
      "grid gap-6 border-t border-border bg-muted/30 p-4 md:grid-cols-2",
      className,
    )}
    ref={ref}
    {...rest}
  >
    {children}
  </footer>
));
PrimarySourceContext.displayName = "PrimarySourceContext";

/**
 * Metadata block. Wrap any markup; pair `<dt>` and `<dd>` for traditional
 * key/value rows.
 *
 * @public
 */
export const PrimarySourceMetadata = forwardRef<
  HTMLDListElement,
  ComponentPropsWithoutRef<"dl">
>(({ children, className, ...rest }, ref) => (
  <dl
    aria-label="Metadata"
    className={cn(
      "grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm",
      className,
    )}
    ref={ref}
    {...rest}
  >
    {children}
  </dl>
));
PrimarySourceMetadata.displayName = "PrimarySourceMetadata";

/**
 * Discussion-questions block.
 *
 * @public
 */
export const PrimarySourceQuestions = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ children, className, ...rest }, ref) => (
  <div
    aria-label="Discussion questions"
    className={cn("space-y-2 text-sm", className)}
    ref={ref}
    {...rest}
  >
    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      Discussion questions
    </h3>
    <div className="space-y-1 text-foreground">{children}</div>
  </div>
));
PrimarySourceQuestions.displayName = "PrimarySourceQuestions";

type ChildBuckets = {
  annotations: ReactNode;
  context: ReactNode;
  toolbar: ReactNode;
  transcription: ReactNode;
};

const SLOT_DISPLAY_NAMES = {
  annotations: PrimarySourceAnnotations.displayName,
  context: PrimarySourceContext.displayName,
  toolbar: PrimarySourceToolbar.displayName,
  transcription: PrimarySourceTranscription.displayName,
} as const;

type SlotKey = keyof ChildBuckets;

const SLOT_KEY_BY_NAME: Record<string, SlotKey> = {
  [SLOT_DISPLAY_NAMES.annotations]: "annotations",
  [SLOT_DISPLAY_NAMES.context]: "context",
  [SLOT_DISPLAY_NAMES.toolbar]: "toolbar",
  [SLOT_DISPLAY_NAMES.transcription]: "transcription",
};

function bucketChildren(children: ReactNode): ChildBuckets {
  const list: ReactNode[] = Array.isArray(children) ? children : [children];
  return list.reduce<ChildBuckets>(
    (accumulator, child) => {
      const name = displayName(child);
      if (!name) return accumulator;
      const key = SLOT_KEY_BY_NAME[name];
      if (!key) return accumulator;
      accumulator[key] = child;
      return accumulator;
    },
    { annotations: null, context: null, toolbar: null, transcription: null },
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

type StageProps = {
  annotations: ReactNode;
  source: PrimarySource;
};

function Stage({ annotations, source }: StageProps): ReactNode {
  const { rotation, zoom } = useViewerContext();
  return (
    <div
      className="relative h-full w-full overflow-auto bg-muted"
      data-rotation={rotation}
      data-zoom={zoom}
    >
      <div
        className="relative inline-block"
        style={{
          transform: `rotate(${rotation.toString()}deg) scale(${zoom.toString()})`,
          transformOrigin: "top left",
        }}
      >
        <img
          alt={source.alt}
          className="block h-auto max-w-none select-none"
          draggable={false}
          loading="lazy"
          src={source.src}
        />
        {annotations}
      </div>
    </div>
  );
}

/**
 * Props for {@link PrimarySourceViewer}.
 *
 * @public
 */
export type PrimarySourceViewerProps = {
  /** Localizable strings. */
  labels?: PrimarySourceViewerLabels;
  /** Geographic origin (e.g. `"England"`). */
  origin?: ReactNode;
  /** Historical period (e.g. `"Medieval"`). */
  period?: ReactNode;
  /** Image source. */
  source: PrimarySource;
  /** Document title. */
  title: ReactNode;
} & ComponentPropsWithoutRef<"section">;

/**
 * Document viewer for historical primary sources. Renders an image
 * viewer with button-driven zoom + rotate, region-based annotation
 * overlay, an optional transcription side panel, and a footer slot for
 * metadata and discussion questions.
 *
 * @example
 * ```tsx
 * <PrimarySourceViewer
 *   title="Magna Carta (1215)"
 *   period="Medieval"
 *   origin="England"
 *   source={{ type: "image", src: "/magna-carta.jpg", alt: "Magna Carta manuscript" }}
 * >
 *   <PrimarySourceToolbar>
 *     <PrimarySourceZoomIn />
 *     <PrimarySourceZoomOut />
 *     <PrimarySourceRotate />
 *   </PrimarySourceToolbar>
 *   <PrimarySourceAnnotations>
 *     <PrimarySourceAnnotation
 *       region={{ x: 12, y: 8, width: 22, height: 6 }}
 *       category="Artifact"
 *       note="Royal seal of King John"
 *     />
 *   </PrimarySourceAnnotations>
 * </PrimarySourceViewer>
 * ```
 *
 * @public
 */
export const PrimarySourceViewer = forwardRef<
  HTMLElement,
  PrimarySourceViewerProps
>((props, ref) => {
  const {
    children,
    className,
    labels,
    origin,
    period,
    source,
    title,
    ...rest
  } = props;
  const titleId = useId();

  const resolvedLabels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labels }),
    [labels],
  );

  const ctx = useViewerState(resolvedLabels);
  const buckets = useMemo(() => bucketChildren(children), [children]);

  return (
    <ViewerContext.Provider value={ctx}>
      <section
        aria-labelledby={titleId}
        className={cn(
          "flex w-full flex-col overflow-hidden rounded-2xl border bg-background text-foreground",
          className,
        )}
        ref={ref}
        {...rest}
      >
        <header className="flex flex-col gap-1 border-b border-border px-4 py-3">
          <h2 className="text-lg font-semibold tracking-tight" id={titleId}>
            {title}
          </h2>
          {period || origin ? (
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {period}
              {period && origin ? " · " : null}
              {origin}
            </p>
          ) : null}
        </header>
        {buckets.toolbar}
        <div className="grid gap-0 md:grid-cols-[2fr_1fr]">
          <div className="relative h-[420px] md:h-[520px]">
            <Stage annotations={buckets.annotations} source={source} />
          </div>
          {buckets.transcription}
        </div>
        {buckets.context}
      </section>
    </ViewerContext.Provider>
  );
});
PrimarySourceViewer.displayName = "PrimarySourceViewer";
