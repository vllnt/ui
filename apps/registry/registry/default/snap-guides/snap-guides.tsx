"use client";

import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@vllnt/ui";

/**
 * One alignment line.
 *
 * @public
 */
export type SnapGuide =
  | {
      /** Stable id (used as React key). */
      id: string;
      /** Horizontal guide — runs left to right at this `y` in container px. */
      orientation: "horizontal";
      y: number;
    }
  | {
      /** Stable id (used as React key). */
      id: string;
      /** Vertical guide — runs top to bottom at this `x` in container px. */
      orientation: "vertical";
      x: number;
    };

/**
 * Localizable strings.
 *
 * @public
 */
export type SnapGuidesLabels = {
  /** Aria-label for the layer. Defaults to `"Snap guides"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Snap guides",
} as const satisfies Required<SnapGuidesLabels>;

/**
 * Props for {@link SnapGuides}.
 *
 * @public
 */
export type SnapGuidesProps = {
  /** Active alignment lines. Pass an empty array to hide all. */
  guides: SnapGuide[];
  /** Localizable strings. */
  labels?: SnapGuidesLabels;
} & ComponentPropsWithoutRef<"div">;

/**
 * Alignment guide overlay for a canvas. Renders dashed lines at the
 * `x` / `y` coordinates supplied by the host snapper. Pure
 * presentation — the host computes which guides are active during a
 * drag and unmounts them on release.
 *
 * @example
 * ```tsx
 * <SnapGuides
 *   guides={[
 *     { id: "x-200", orientation: "vertical", x: 200 },
 *     { id: "y-160", orientation: "horizontal", y: 160 },
 *   ]}
 * />
 * ```
 *
 * @public
 */
export const SnapGuides = forwardRef<HTMLDivElement, SnapGuidesProps>(
  (props, ref) => {
    const { className, guides, labels, ...rest } = props;
    const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
    return (
      <div
        aria-label={resolvedLabels.region}
        className={cn("pointer-events-none absolute inset-0 z-30", className)}
        data-snap-guide-count={guides.length}
        ref={ref}
        {...rest}
      >
        {guides.map((guide) => {
          const isVertical = guide.orientation === "vertical";
          const offset = isVertical ? guide.x : guide.y;
          return (
            <span
              aria-hidden="true"
              className={cn(
                "absolute border-primary/70",
                isVertical
                  ? "inset-y-0 w-px border-l border-dashed"
                  : "inset-x-0 h-px border-t border-dashed",
              )}
              data-snap-guide-id={guide.id}
              data-snap-orientation={guide.orientation}
              key={guide.id}
              style={
                isVertical
                  ? { left: `${offset.toString()}px` }
                  : { top: `${offset.toString()}px` }
              }
            />
          );
        })}
      </div>
    );
  },
);
SnapGuides.displayName = "SnapGuides";
