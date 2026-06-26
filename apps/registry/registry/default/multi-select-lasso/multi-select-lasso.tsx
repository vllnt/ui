"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@vllnt/ui";

/**
 * Lasso geometry — pixel coordinates on the underlying canvas.
 *
 * @public
 */
export type LassoRect = {
  /** Height in pixels (always positive after normalization). */
  height: number;
  /** Width in pixels (always positive after normalization). */
  width: number;
  /** Left edge in pixels. */
  x: number;
  /** Top edge in pixels. */
  y: number;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type MultiSelectLassoLabels = {
  /** Plural noun for the count badge. Defaults to `"items"`. */
  plural?: string;
  /** Aria-label for the lasso layer. Defaults to `"Multi-select lasso"`. */
  region?: string;
  /** Singular noun for the count badge. Defaults to `"item"`. */
  singular?: string;
};

const DEFAULT_LABELS = {
  plural: "items",
  region: "Multi-select lasso",
  singular: "item",
} as const satisfies Required<MultiSelectLassoLabels>;

/**
 * Props for {@link MultiSelectLasso}.
 *
 * @public
 */
export type MultiSelectLassoProps = {
  /** Optional count badge — rendered near the bottom-right corner. */
  count?: number;
  /** Optional override slot rendered inside the lasso (e.g. a label). */
  hint?: ReactNode;
  /** Localizable strings. */
  labels?: MultiSelectLassoLabels;
  /** Drag rectangle in pixels. When `null`, nothing renders. */
  rect: LassoRect | null;
} & ComponentPropsWithoutRef<"div">;

const normalizeRect = (rect: LassoRect): LassoRect => {
  const x = rect.width < 0 ? rect.x + rect.width : rect.x;
  const y = rect.height < 0 ? rect.y + rect.height : rect.y;
  const width = Math.abs(rect.width);
  const height = Math.abs(rect.height);
  return { height, width, x, y };
};

/**
 * Selection rectangle for canvas multi-select. Render as a sibling of
 * the canvas with `position: absolute` parent so the `rect` coordinates
 * land in the same pixel space. Pure presentation; the host owns the
 * pointer-down/move/up lifecycle and produces the rect (or `null` to
 * hide the lasso).
 *
 * @example
 * ```tsx
 * <div className="relative h-screen w-screen" onPointerDown={…}>
 *   <Canvas />
 *   <MultiSelectLasso rect={lassoRect} count={hoveredIds.length} />
 * </div>
 * ```
 *
 * @public
 */
export const MultiSelectLasso = ({
  ref,
  ...props
}: MultiSelectLassoProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const { className, count, hint, labels, rect, ...rest } = props;
  if (!rect) {
    return null;
  }
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  const normalized = normalizeRect(rect);
  if (normalized.width === 0 || normalized.height === 0) {
    return null;
  }
  const noun = count === 1 ? resolvedLabels.singular : resolvedLabels.plural;
  return (
    <div
      aria-hidden="true"
      aria-label={resolvedLabels.region}
      className={cn(
        "pointer-events-none absolute z-30 rounded-md border-2 border-blue-500/70 bg-blue-500/10",
        className,
      )}
      data-multi-select-lasso
      ref={ref}
      style={{
        height: normalized.height,
        left: normalized.x,
        top: normalized.y,
        width: normalized.width,
      }}
      {...rest}
    >
      {hint ? (
        <span
          className="absolute -top-7 left-0 rounded-md bg-foreground/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-background"
          data-multi-select-hint
        >
          {hint}
        </span>
      ) : null}
      {typeof count === "number" ? (
        <span
          className="absolute -bottom-7 right-0 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-semibold text-background"
          data-multi-select-count
        >
          {count} {noun}
        </span>
      ) : null}
    </div>
  );
};
MultiSelectLasso.displayName = "MultiSelectLasso";
