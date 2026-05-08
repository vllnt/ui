"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
  type WheelEvent as ReactWheelEvent,
} from "react";

import { cn } from "../../lib/utils";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const GRID_SIZE = 40;

/**
 * Localizable strings.
 *
 * @public
 */
export type InfinitePlaneLabels = {
  /** Aria-label for the plane region. Defaults to `"Infinite plane"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Infinite plane",
} as const satisfies Required<InfinitePlaneLabels>;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Props for {@link InfinitePlane}.
 *
 * @public
 */
export type InfinitePlaneProps = {
  /** Initial pan / zoom. Defaults to centered (`{ x: 0, y: 0, zoom: 1 }`). */
  initialView?: { x: number; y: number; zoom?: number };
  /** Localizable strings. */
  labels?: InfinitePlaneLabels;
  /** Fires after pan or zoom changes. */
  onViewChange?: (view: { x: number; y: number; zoom: number }) => void;
  /** When `true`, hides the dotted grid backdrop. */
  withoutGrid?: boolean;
} & ComponentPropsWithoutRef<"section">;

type DragState = null | {
  originPanX: number;
  originPanY: number;
  originX: number;
  originY: number;
};

type PanHandlers = {
  onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
};

function usePanHandlers(arguments_: {
  pan: { x: number; y: number };
  setPan: (next: { x: number; y: number }) => void;
}): PanHandlers {
  const { pan, setPan } = arguments_;
  const dragRef = useRef<DragState>(null);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>): void => {
      dragRef.current = {
        originPanX: pan.x,
        originPanY: pan.y,
        originX: event.clientX,
        originY: event.clientY,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [pan.x, pan.y],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>): void => {
      const drag = dragRef.current;
      if (!drag) return;
      setPan({
        x: drag.originPanX + (event.clientX - drag.originX),
        y: drag.originPanY + (event.clientY - drag.originY),
      });
    },
    [setPan],
  );

  const onPointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>): void => {
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

function usePlaneState(arguments_: {
  initialView?: { x: number; y: number; zoom?: number };
  onViewChange?: (view: { x: number; y: number; zoom: number }) => void;
}): {
  pan: { x: number; y: number };
  setZoom: (next: number) => void;
  updatePan: (next: { x: number; y: number }) => void;
  zoom: number;
  zoomFromWheel: (event: ReactWheelEvent<HTMLDivElement>) => void;
} {
  const { initialView, onViewChange } = arguments_;
  const [pan, setPan] = useState<{ x: number; y: number }>({
    x: initialView?.x ?? 0,
    y: initialView?.y ?? 0,
  });
  const [zoom, setZoom] = useState<number>(
    clamp(initialView?.zoom ?? 1, MIN_ZOOM, MAX_ZOOM),
  );
  const updatePan = useCallback(
    (next: { x: number; y: number }) => {
      setPan(next);
      onViewChange?.({ x: next.x, y: next.y, zoom });
    },
    [onViewChange, zoom],
  );
  const zoomFromWheel = useCallback(
    (event: ReactWheelEvent<HTMLDivElement>): void => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const next = clamp(
        zoom * (event.deltaY < 0 ? 1.1 : 1 / 1.1),
        MIN_ZOOM,
        MAX_ZOOM,
      );
      setZoom(next);
      onViewChange?.({ x: pan.x, y: pan.y, zoom: next });
    },
    [onViewChange, pan.x, pan.y, zoom],
  );
  return { pan, setZoom, updatePan, zoom, zoomFromWheel };
}

type GridProps = {
  pan: { x: number; y: number };
  zoom: number;
};

function Grid({ pan, zoom }: GridProps): React.ReactElement {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-40"
      style={{
        backgroundImage:
          "radial-gradient(circle, currentColor 1px, transparent 1px)",
        backgroundPosition: `${pan.x.toString()}px ${pan.y.toString()}px`,
        backgroundSize: `${(GRID_SIZE * zoom).toString()}px ${(GRID_SIZE * zoom).toString()}px`,
        color: "hsl(var(--border))",
      }}
    />
  );
}

/**
 * Pannable, zoomable infinite-plane substrate. Drag to pan; ctrl/meta +
 * wheel to zoom. Children render inside a transformed `<div>` so they
 * keep their pixel-positioned coordinates while the plane moves.
 *
 * Place children with absolute / fixed `left`+`top` (in unzoomed plane
 * coordinates); the wrapper applies the pan + zoom transform.
 *
 * @example
 * ```tsx
 * <InfinitePlane>
 *   <div style={{ position: "absolute", left: 100, top: 80 }}>
 *     Object at (100, 80)
 *   </div>
 * </InfinitePlane>
 * ```
 *
 * @public
 */
export const InfinitePlane = forwardRef<HTMLElement, InfinitePlaneProps>(
  (props, ref) => {
    const {
      children,
      className,
      initialView,
      labels,
      onViewChange,
      withoutGrid = false,
      ...rest
    } = props;
    const resolvedLabels = useMemo(
      () => ({ ...DEFAULT_LABELS, ...labels }),
      [labels],
    );
    const { pan, updatePan, zoom, zoomFromWheel } = usePlaneState({
      initialView,
      onViewChange,
    });
    const handlers = usePanHandlers({ pan, setPan: updatePan });

    return (
      <section
        aria-label={resolvedLabels.region}
        className={cn(
          "relative h-full w-full overflow-hidden bg-background text-foreground",
          className,
        )}
        ref={ref}
        {...rest}
      >
        <div
          className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
          data-pan-x={pan.x}
          data-pan-y={pan.y}
          data-zoom={zoom}
          onWheel={zoomFromWheel}
          {...handlers}
        >
          {withoutGrid ? null : <Grid pan={pan} zoom={zoom} />}
          <div
            className="origin-top-left"
            data-infinite-plane-content
            style={{
              transform: `translate(${pan.x.toString()}px, ${pan.y.toString()}px) scale(${zoom.toString()})`,
            }}
          >
            {children}
          </div>
        </div>
      </section>
    );
  },
);
InfinitePlane.displayName = "InfinitePlane";
