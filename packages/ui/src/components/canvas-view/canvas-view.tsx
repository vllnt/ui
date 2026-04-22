"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
} from "react";

import { cn } from "../../lib/utils";

export type CanvasViewport = {
  x: number;
  y: number;
  zoom: number;
};

export type CanvasViewHandle = {
  resetViewport: () => void;
  setViewport: (viewport: CanvasViewport) => void;
};

export type CanvasViewProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "onScroll"
> & {
  defaultViewport?: CanvasViewport;
  maxZoom?: number;
  minZoom?: number;
  onViewportChange?: (viewport: CanvasViewport) => void;
  overlay?: React.ReactNode;
  zoomStep?: number;
};

type DragOrigin = {
  pointerX: number;
  pointerY: number;
  viewport: CanvasViewport;
};

type ViewportReference = {
  current: CanvasViewport;
};

const DEFAULT_VIEWPORT: CanvasViewport = { x: 0, y: 0, zoom: 1 };

function clampZoom(value: number, minZoom: number, maxZoom: number) {
  return Math.min(maxZoom, Math.max(minZoom, Number(value.toFixed(2))));
}

function isPanGesture(
  event: ReactPointerEvent<HTMLDivElement>,
  isSpacePressed: boolean,
) {
  return event.button === 1 || (event.button === 0 && isSpacePressed);
}

function createViewportKeyHandler({
  nudgeViewport,
  resetViewport,
  setViewport,
  viewportRef,
  zoomStep,
}: {
  nudgeViewport: (deltaX: number, deltaY: number) => void;
  resetViewport: () => void;
  setViewport: (viewport: CanvasViewport) => void;
  viewportRef: ViewportReference;
  zoomStep: number;
}) {
  return (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      setViewport({
        ...viewportRef.current,
        zoom: viewportRef.current.zoom + zoomStep,
      });
      return;
    }

    if (event.key === "-") {
      event.preventDefault();
      setViewport({
        ...viewportRef.current,
        zoom: viewportRef.current.zoom - zoomStep,
      });
      return;
    }

    if (event.key === "0") {
      event.preventDefault();
      resetViewport();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      nudgeViewport(40, 0);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      nudgeViewport(-40, 0);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      nudgeViewport(0, 40);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      nudgeViewport(0, -40);
    }
  };
}

function useViewportState({
  defaultViewport,
  maxZoom,
  minZoom,
  onViewportChange,
}: {
  defaultViewport: CanvasViewport;
  maxZoom: number;
  minZoom: number;
  onViewportChange?: (viewport: CanvasViewport) => void;
}) {
  const defaultViewportRef = useRef(defaultViewport);
  const viewportRef = useRef(defaultViewport);
  const [viewport, setViewport] = useState(defaultViewport);

  useEffect(() => {
    defaultViewportRef.current = defaultViewport;
  }, [defaultViewport]);

  const applyViewport = useCallback(
    (nextViewport: CanvasViewport) => {
      const resolvedViewport = {
        x: Math.round(nextViewport.x),
        y: Math.round(nextViewport.y),
        zoom: clampZoom(nextViewport.zoom, minZoom, maxZoom),
      };

      viewportRef.current = resolvedViewport;
      setViewport(resolvedViewport);
      onViewportChange?.(resolvedViewport);
    },
    [maxZoom, minZoom, onViewportChange],
  );

  const resetViewport = useCallback(() => {
    applyViewport(defaultViewportRef.current);
  }, [applyViewport]);

  const nudgeViewport = useCallback(
    (deltaX: number, deltaY: number) => {
      const currentViewport = viewportRef.current;
      applyViewport({
        x: currentViewport.x + deltaX,
        y: currentViewport.y + deltaY,
        zoom: currentViewport.zoom,
      });
    },
    [applyViewport],
  );

  return {
    nudgeViewport,
    resetViewport,
    setViewport: applyViewport,
    viewport,
    viewportRef,
  };
}

function useCanvasKeyboardInteractions({
  nudgeViewport,
  resetViewport,
  setViewport,
  viewportRef,
  zoomStep,
}: {
  nudgeViewport: (deltaX: number, deltaY: number) => void;
  resetViewport: () => void;
  setViewport: (viewport: CanvasViewport) => void;
  viewportRef: ViewportReference;
  zoomStep: number;
}) {
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const handleWheel = useCallback(
    (event: ReactWheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (event.ctrlKey || event.metaKey) {
        setViewport({
          ...viewportRef.current,
          zoom:
            viewportRef.current.zoom +
            (event.deltaY > 0 ? -zoomStep : zoomStep),
        });
        return;
      }

      nudgeViewport(-event.deltaX, -event.deltaY);
    },
    [nudgeViewport, setViewport, viewportRef, zoomStep],
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === " ") {
        event.preventDefault();
        setIsSpacePressed(true);
        return;
      }

      createViewportKeyHandler({
        nudgeViewport,
        resetViewport,
        setViewport,
        viewportRef,
        zoomStep,
      })(event);
    },
    [nudgeViewport, resetViewport, setViewport, viewportRef, zoomStep],
  );

  const handleKeyUp = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === " ") {
        setIsSpacePressed(false);
      }
    },
    [],
  );

  return { handleKeyDown, handleKeyUp, handleWheel, isSpacePressed };
}

function useCanvasPointerInteractions({
  isSpacePressed,
  setViewport,
  viewportRef,
}: {
  isSpacePressed: boolean;
  setViewport: (viewport: CanvasViewport) => void;
  viewportRef: ViewportReference;
}) {
  const dragOriginRef = useRef<DragOrigin | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isPanGesture(event, isSpacePressed)) {
        return;
      }

      dragOriginRef.current = {
        pointerX: event.clientX,
        pointerY: event.clientY,
        viewport: viewportRef.current,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
    },
    [isSpacePressed, viewportRef],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const dragOrigin = dragOriginRef.current;
      if (!dragOrigin) {
        return;
      }

      setViewport({
        x: dragOrigin.viewport.x + (event.clientX - dragOrigin.pointerX),
        y: dragOrigin.viewport.y + (event.clientY - dragOrigin.pointerY),
        zoom: dragOrigin.viewport.zoom,
      });
    },
    [setViewport],
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      dragOriginRef.current = null;
      setIsDragging(false);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    },
    [],
  );

  return { handlePointerDown, handlePointerMove, handlePointerUp, isDragging };
}

function usePreventBodySelection(disabled: boolean) {
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const { body } = document;
    const previousUserSelect = body.style.userSelect;

    if (disabled) {
      body.style.userSelect = "none";
    }

    return () => {
      body.style.userSelect = previousUserSelect;
    };
  }, [disabled]);
}

function useCanvasViewHandle(
  ref: React.ForwardedRef<CanvasViewHandle>,
  viewportState: {
    resetViewport: () => void;
    setViewport: (viewport: CanvasViewport) => void;
  },
) {
  useImperativeHandle(
    ref,
    () => ({
      resetViewport: viewportState.resetViewport,
      setViewport: viewportState.setViewport,
    }),
    [viewportState.resetViewport, viewportState.setViewport],
  );
}

type CanvasInteractionLayerProps = {
  children: React.ReactNode;
  instructionsId: string;
  isDragging: boolean;
  isSpacePressed: boolean;
  onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
  onKeyUp: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onWheel: (event: ReactWheelEvent<HTMLDivElement>) => void;
  viewport: CanvasViewport;
};

function CanvasInteractionLayer({
  children,
  instructionsId,
  isDragging,
  isSpacePressed,
  onKeyDown,
  onKeyUp,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheel,
  viewport,
}: CanvasInteractionLayerProps) {
  return (
    <div
      aria-describedby={instructionsId}
      aria-label="Canvas workspace"
      className={cn(
        "relative h-full w-full select-none touch-none outline-none",
        isDragging || isSpacePressed
          ? "cursor-grab active:cursor-grabbing"
          : "cursor-default",
      )}
      data-viewport={JSON.stringify(viewport)}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onWheel={onWheel}
      role="button"
      tabIndex={0}
    >
      <div className="sr-only" id={instructionsId}>
        Hold space and drag or use the middle mouse button to pan. Use plus,
        minus, or control wheel to zoom. Press zero to reset the viewport.
      </div>
      {children}
    </div>
  );
}

function CanvasContentLayer({
  children,
  overlay,
  viewport,
}: {
  children: React.ReactNode;
  overlay?: React.ReactNode;
  viewport: CanvasViewport;
}) {
  return (
    <>
      <div
        className="absolute inset-0 origin-top-left transition-transform duration-150 ease-out"
        style={{
          transform: `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.zoom})`,
        }}
      >
        {children}
      </div>
      {overlay ? (
        <div className="pointer-events-none absolute inset-0 z-20">
          {overlay}
        </div>
      ) : null}
    </>
  );
}

const CanvasView = forwardRef<CanvasViewHandle, CanvasViewProps>(
  (
    {
      children,
      className,
      defaultViewport = DEFAULT_VIEWPORT,
      maxZoom = 2,
      minZoom = 0.5,
      onViewportChange,
      overlay,
      zoomStep = 0.1,
      ...props
    },
    ref,
  ) => {
    const instructionsId = useId();
    const viewportState = useViewportState({
      defaultViewport,
      maxZoom,
      minZoom,
      onViewportChange,
    });
    const keyboard = useCanvasKeyboardInteractions({
      nudgeViewport: viewportState.nudgeViewport,
      resetViewport: viewportState.resetViewport,
      setViewport: viewportState.setViewport,
      viewportRef: viewportState.viewportRef,
      zoomStep,
    });
    const pointer = useCanvasPointerInteractions({
      isSpacePressed: keyboard.isSpacePressed,
      setViewport: viewportState.setViewport,
      viewportRef: viewportState.viewportRef,
    });
    usePreventBodySelection(pointer.isDragging);
    useCanvasViewHandle(ref, viewportState);

    return (
      <div
        className={cn(
          "relative h-full min-h-[32rem] overflow-hidden rounded-sm border border-border bg-background",
          className,
        )}
        {...props}
      >
        <CanvasInteractionLayer
          instructionsId={instructionsId}
          isDragging={pointer.isDragging}
          isSpacePressed={keyboard.isSpacePressed}
          onKeyDown={keyboard.handleKeyDown}
          onKeyUp={keyboard.handleKeyUp}
          onPointerDown={pointer.handlePointerDown}
          onPointerMove={pointer.handlePointerMove}
          onPointerUp={pointer.handlePointerUp}
          onWheel={keyboard.handleWheel}
          viewport={viewportState.viewport}
        >
          <CanvasContentLayer
            overlay={overlay}
            viewport={viewportState.viewport}
          >
            {children}
          </CanvasContentLayer>
        </CanvasInteractionLayer>
      </div>
    );
  },
);

CanvasView.displayName = "CanvasView";

export { CanvasView };
