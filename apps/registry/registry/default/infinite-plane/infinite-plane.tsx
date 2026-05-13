"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@vllnt/ui";

/**
 * Pattern style for the plane backdrop.
 *
 * @public
 */
export type InfinitePlanePattern = "blank" | "dot" | "grid";

/**
 * Localizable strings.
 *
 * @public
 */
export type InfinitePlaneLabels = {
  /** Aria-label override. Defaults to `"Infinite plane"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Infinite plane",
} as const satisfies Required<InfinitePlaneLabels>;

/**
 * Props for {@link InfinitePlane}.
 *
 * @public
 */
export type InfinitePlaneProps = {
  /** Children render in the plane's coordinate space. */
  children?: ReactNode;
  /** Localizable strings. */
  labels?: InfinitePlaneLabels;
  /** Backdrop pattern. Defaults to `"dot"`. */
  pattern?: InfinitePlanePattern;
  /** Pattern grid spacing in pixels. Defaults to `32`. */
  spacing?: number;
  /** Optional offset applied to the pattern (drift with viewport translation). Defaults to `{ x: 0, y: 0 }`. */
  translate?: { x: number; y: number };
  /** Zoom factor — drives the pattern's effective spacing. Defaults to `1`. */
  zoom?: number;
} & ComponentPropsWithoutRef<"div">;

const safeSpacing = (value: number): number => (value < 4 ? 4 : value);

const safeZoom = (value: number): number => {
  if (value < 0.1) {
    return 0.1;
  }
  if (value > 10) {
    return 10;
  }
  return value;
};

const buildBackground = (input: {
  pattern: InfinitePlanePattern;
  spacing: number;
  translate: { x: number; y: number };
  zoom: number;
}): React.CSSProperties => {
  if (input.pattern === "blank") {
    return {};
  }
  const size = safeSpacing(input.spacing) * safeZoom(input.zoom);
  const pos = `${input.translate.x}px ${input.translate.y}px`;
  if (input.pattern === "grid") {
    return {
      backgroundImage:
        "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
      backgroundPosition: pos,
      backgroundSize: `${size}px ${size}px`,
    };
  }
  return {
    backgroundImage:
      "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
    backgroundPosition: pos,
    backgroundSize: `${size}px ${size}px`,
  };
};

/**
 * Tiled pannable backdrop for the canvas. Renders a `dot` or `grid`
 * pattern that drifts with the viewport translate + scales with the
 * zoom, plus a slot for spatial children that share its coordinate
 * space.
 *
 * Pure presentation; the host owns the viewport transform and supplies
 * `translate` + `zoom` from its pan / zoom controller.
 *
 * @example
 * ```tsx
 * <InfinitePlane translate={{ x: pan.x, y: pan.y }} zoom={zoom}>
 *   <ObjectCard …/>
 *   <ObjectCard …/>
 * </InfinitePlane>
 * ```
 *
 * @public
 */
export const InfinitePlane = (
  props: InfinitePlaneProps & React.RefAttributes<HTMLDivElement>,
) => {
  const {
    children,
    className,
    labels,
    pattern = "dot",
    ref,
    spacing = 32,
    translate = { x: 0, y: 0 },
    zoom = 1,
    ...rest
  } = props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  const background = buildBackground({ pattern, spacing, translate, zoom });
  return (
    <div
      aria-label={resolvedLabels.region}
      className={cn(
        "relative h-full w-full overflow-hidden bg-background",
        className,
      )}
      data-infinite-plane
      data-infinite-plane-pattern={pattern}
      ref={ref}
      role="region"
      style={background}
      {...rest}
    >
      {children}
    </div>
  );
};
InfinitePlane.displayName = "InfinitePlane";
