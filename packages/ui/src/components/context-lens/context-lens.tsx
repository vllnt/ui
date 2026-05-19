"use client";

import { type ComponentPropsWithoutRef, useId } from "react";

import { cn } from "../../lib/utils";

/**
 * Focus point — pixel coordinates relative to the canvas viewport.
 *
 * @public
 */
export type ContextLensFocus = {
  /** Center X of the lens. */
  cx: number;
  /** Center Y of the lens. */
  cy: number;
  /** Inner radius — fully transparent inside this circle. */
  inner: number;
  /** Outer radius — full dim beyond this circle. */
  outer: number;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type ContextLensLabels = {
  /** Aria-label for the lens layer. Defaults to `"Context lens"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Context lens",
} as const satisfies Required<ContextLensLabels>;

/**
 * Props for {@link ContextLens}.
 *
 * @public
 */
export type ContextLensProps = {
  /** Lens geometry. When `null`, no lens renders (full surface unobscured). */
  focus: ContextLensFocus | null;
  /** Localizable strings. */
  labels?: ContextLensLabels;
  /** Dim opacity outside the outer ring (0..1). Defaults to `0.55`. */
  opacity?: number;
} & ComponentPropsWithoutRef<"svg">;

const clamp01 = (value: number): number => {
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
};

const safeRadius = (value: number): number => (value < 0 ? 0 : value);

/**
 * Vignette overlay that dims the canvas outside a circular focus
 * region. Use to draw the eye to a selection, an active run, or any
 * single object the user must attend to. Pure presentation; the host
 * computes the focus center + radii from the active selection's
 * bounding box.
 *
 * The lens is `pointer-events: none` — host gestures pass through.
 *
 * @example
 * ```tsx
 * <div className="relative h-screen w-screen">
 *   <Canvas />
 *   <ContextLens focus={{ cx: 480, cy: 320, inner: 90, outer: 180 }} />
 * </div>
 * ```
 *
 * @public
 */
export const ContextLens = (
  props: ContextLensProps & React.RefAttributes<SVGSVGElement>,
) => {
  const { className, focus, labels, opacity = 0.55, ref, ...rest } = props;
  const maskId = useId();
  if (!focus) {
    return null;
  }
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  const inner = safeRadius(focus.inner);
  const outer = safeRadius(Math.max(focus.outer, inner));
  const fillOpacity = clamp01(opacity);
  return (
    <svg
      aria-hidden="true"
      aria-label={resolvedLabels.region}
      className={cn(
        "pointer-events-none absolute inset-0 z-20 h-full w-full",
        className,
      )}
      data-context-lens
      ref={ref}
      {...rest}
    >
      <defs>
        <radialGradient
          cx={focus.cx}
          cy={focus.cy}
          data-context-lens-gradient
          gradientUnits="userSpaceOnUse"
          id={maskId}
          r={outer === 0 ? 1 : outer}
        >
          <stop offset="0%" stopColor="black" stopOpacity={0} />
          <stop
            offset={outer === 0 ? "100%" : `${(inner / outer) * 100}%`}
            stopColor="black"
            stopOpacity={0}
          />
          <stop offset="100%" stopColor="black" stopOpacity={1} />
        </radialGradient>
      </defs>
      <rect
        data-context-lens-dim
        fill="black"
        fillOpacity={fillOpacity}
        height="100%"
        mask={`url(#${maskId}-mask)`}
        width="100%"
        x={0}
        y={0}
      />
      <mask id={`${maskId}-mask`}>
        <rect fill="white" height="100%" width="100%" x={0} y={0} />
        <circle
          cx={focus.cx}
          cy={focus.cy}
          fill={`url(#${maskId})`}
          r={outer}
        />
      </mask>
    </svg>
  );
};
ContextLens.displayName = "ContextLens";
