"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

/** Props for {@link AnimatedBeam}. */
export type AnimatedBeamProps = React.ComponentPropsWithoutRef<"svg"> & {
  /** Element that hosts the beam and supplies the coordinate origin. */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Curve bow height in pixels. Positive bends up. Defaults to `0`. */
  curvature?: number;
  /** Seconds for one travel of the gradient. Defaults to `3`. */
  duration?: number;
  /** Element the beam starts from. */
  fromRef: React.RefObject<HTMLElement | null>;
  /** Reverse the travel direction of the gradient. */
  reverse?: boolean;
  /** Element the beam ends at. */
  toRef: React.RefObject<HTMLElement | null>;
};

type BeamGeometry = { height: number; path: string; width: number };

type GeometryInput = {
  container: HTMLElement | null;
  curvature: number;
  from: HTMLElement | null;
  to: HTMLElement | null;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (): void => {
      setReduced(query.matches);
    };

    onChange();
    query.addEventListener("change", onChange);

    return () => {
      query.removeEventListener("change", onChange);
    };
  }, []);

  return reduced;
}

function buildGeometry({
  container,
  curvature,
  from,
  to,
}: GeometryInput): BeamGeometry {
  if (container === null || from === null || to === null) {
    return { height: 0, path: "", width: 0 };
  }

  const base = container.getBoundingClientRect();
  const start = from.getBoundingClientRect();
  const end = to.getBoundingClientRect();
  const startX = start.left - base.left + start.width / 2;
  const startY = start.top - base.top + start.height / 2;
  const endX = end.left - base.left + end.width / 2;
  const endY = end.top - base.top + end.height / 2;
  const controlX = (startX + endX) / 2;
  const controlY = (startY + endY) / 2 - curvature;
  const path = `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`;

  return { height: base.height, path, width: base.width };
}

function useBeamGeometry(
  props: Pick<
    AnimatedBeamProps,
    "containerRef" | "curvature" | "fromRef" | "toRef"
  >,
): BeamGeometry {
  const { containerRef, curvature = 0, fromRef, toRef } = props;
  const [geometry, setGeometry] = React.useState<BeamGeometry>({
    height: 0,
    path: "",
    width: 0,
  });

  React.useEffect(() => {
    const container = containerRef.current;
    const update = (): void => {
      setGeometry(
        buildGeometry({
          container,
          curvature,
          from: fromRef.current,
          to: toRef.current,
        }),
      );
    };

    update();

    if (container === null || typeof ResizeObserver !== "function") {
      return;
    }

    const observer = new ResizeObserver(update);
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [containerRef, curvature, fromRef, toRef]);

  return geometry;
}

/**
 * Animated gradient beam tracing a curved path between two elements.
 *
 * Respects `prefers-reduced-motion`: the gradient stops travelling.
 *
 * @example
 * ```tsx
 * <AnimatedBeam containerRef={box} fromRef={a} toRef={b} />
 * ```
 */
export const AnimatedBeam = ({
  className,
  containerRef,
  curvature = 0,
  duration = 3,
  fromRef,
  ref,
  reverse = false,
  toRef,
  ...props
}: AnimatedBeamProps & { ref?: React.Ref<SVGSVGElement> }) => {
  const gradientId = React.useId();
  const reduced = usePrefersReducedMotion();
  const { height, path, width } = useBeamGeometry({
    containerRef,
    curvature,
    fromRef,
    toRef,
  });

  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      fill="none"
      ref={ref}
      {...props}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    >
      <path className="stroke-border" d={path} strokeWidth={2} />
      <path d={path} stroke={`url(#${gradientId})`} strokeWidth={2} />
      <defs>
        <linearGradient
          gradientUnits="objectBoundingBox"
          id={gradientId}
          x1="0%"
          x2="20%"
        >
          <stop offset="0%" stopColor="oklch(var(--primary) / 0)" />
          <stop offset="50%" stopColor="oklch(var(--primary))" />
          <stop offset="100%" stopColor="oklch(var(--primary) / 0)" />
          {reduced ? null : (
            <BeamTravel duration={duration} reverse={reverse} />
          )}
        </linearGradient>
      </defs>
    </svg>
  );
};
AnimatedBeam.displayName = "AnimatedBeam";

function BeamTravel({
  duration,
  reverse,
}: {
  duration: number;
  reverse: boolean;
}) {
  const x1 = reverse ? "100%;-20%" : "-20%;100%";
  const x2 = reverse ? "120%;0%" : "0%;120%";

  return (
    <>
      <animate
        attributeName="x1"
        dur={`${duration}s`}
        repeatCount="indefinite"
        values={x1}
      />
      <animate
        attributeName="x2"
        dur={`${duration}s`}
        repeatCount="indefinite"
        values={x2}
      />
    </>
  );
}
