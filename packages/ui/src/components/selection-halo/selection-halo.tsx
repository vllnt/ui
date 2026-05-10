"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

import { cn } from "../../lib/utils";

/**
 * Geometric bounds of the selection in container px.
 *
 * @public
 */
export type SelectionBounds = {
  height: number;
  width: number;
  x: number;
  y: number;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type SelectionHaloLabels = {
  /** Aria-label for the halo. Defaults to `"Selection"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Selection",
} as const satisfies Required<SelectionHaloLabels>;

/**
 * Props for {@link SelectionHalo}.
 *
 * @public
 */
export type SelectionHaloProps = {
  /** Selection bounds in container pixels. */
  bounds: SelectionBounds;
  /** Optional label rendered above the top-left corner. */
  label?: ReactNode;
  /** Localizable strings. */
  labels?: SelectionHaloLabels;
  /** When `true`, the ring pulses (use during multi-step transitions). */
  pulsing?: boolean;
} & Omit<ComponentPropsWithoutRef<"div">, "style">;

/**
 * Local-user selection halo for a canvas. Outlines a rectangular
 * region with a primary ring + handles at every corner. Pure
 * presentation — the host computes bounds (single object, group
 * bounding box, lasso result) and toggles the wrapper.
 *
 * Distinct from {@link SelectionPresence}: this halo represents the
 * **local** user's selection (with corner handles + label slot), while
 * `SelectionPresence` represents a remote participant's selection.
 *
 * @example
 * ```tsx
 * <SelectionHalo bounds={{ x: 80, y: 60, width: 200, height: 120 }} label="3 selected" />
 * ```
 *
 * @public
 */
export const SelectionHalo = forwardRef<HTMLDivElement, SelectionHaloProps>(
  (props, ref) => {
    const {
      bounds,
      className,
      label,
      labels,
      pulsing = false,
      ...rest
    } = props;
    const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
    return (
      <div
        aria-label={resolvedLabels.region}
        className={cn(
          "pointer-events-none absolute z-20 rounded-md ring-2 ring-primary",
          pulsing ? "animate-pulse" : "",
          className,
        )}
        data-pulsing={pulsing ? "true" : undefined}
        data-selection-halo
        ref={ref}
        style={{
          height: `${bounds.height.toString()}px`,
          left: `${bounds.x.toString()}px`,
          top: `${bounds.y.toString()}px`,
          width: `${bounds.width.toString()}px`,
        }}
        {...rest}
      >
        {(["nw", "ne", "se", "sw"] as const).map((corner) => (
          <span
            aria-hidden="true"
            className={cn(
              "absolute size-2 rounded-sm border-2 border-primary bg-background",
              corner === "nw" && "-left-1 -top-1",
              corner === "ne" && "-right-1 -top-1",
              corner === "se" && "-bottom-1 -right-1",
              corner === "sw" && "-bottom-1 -left-1",
            )}
            data-handle-corner={corner}
            key={corner}
          />
        ))}
        {label ? (
          <span
            className="absolute -top-6 left-0 inline-flex items-center rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-sm"
            data-selection-label
          >
            {label}
          </span>
        ) : null}
      </div>
    );
  },
);
SelectionHalo.displayName = "SelectionHalo";
