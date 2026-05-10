"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

import { cn } from "@vllnt/ui";

/**
 * Localizable strings.
 *
 * @public
 */
export type SelectionPresenceLabels = {
  /** Aria-label override. Defaults to `"Selection presence"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Selection presence",
} as const satisfies Required<SelectionPresenceLabels>;

/**
 * Props for {@link SelectionPresence}.
 *
 * @public
 */
export type SelectionPresenceProps = {
  /** Tailwind / CSS color used for the border + chip. Defaults to `var(--foreground)`. */
  color?: string;
  /** Selection rectangle height in pixels. */
  height: number;
  /** Localizable strings. */
  labels?: SelectionPresenceLabels;
  /** Optional name shown in the corner chip (e.g. owner of the selection). */
  name?: ReactNode;
  /** Selection rectangle width in pixels. */
  width: number;
  /** Selection rectangle X (top-left) in canvas pixels. */
  x: number;
  /** Selection rectangle Y (top-left) in canvas pixels. */
  y: number;
} & ComponentPropsWithoutRef<"div">;

/**
 * Overlay marking what another user has selected on the canvas. The
 * dashed border + soft fill stay calm so they communicate
 * "someone-else's-selection" without blocking primary content. Pure
 * presentation; the host computes the rect from the remote user's
 * viewport and supplies an accent color per user.
 *
 * The wrapper is `pointer-events: none` so host gestures pass through.
 *
 * @example
 * ```tsx
 * <div className="relative h-screen w-screen">
 *   <Canvas />
 *   <SelectionPresence
 *     x={120} y={80} width={240} height={120}
 *     color="#5b8def"
 *     name="Bea"
 *   />
 * </div>
 * ```
 *
 * @public
 */
export const SelectionPresence = forwardRef<
  HTMLDivElement,
  SelectionPresenceProps
>((props, ref) => {
  const { className, color, height, labels, name, width, x, y, ...rest } =
    props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  const accent = color ?? "var(--foreground)";
  const ariaLabel =
    typeof name === "string"
      ? `${resolvedLabels.region}: ${name}`
      : resolvedLabels.region;
  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        "pointer-events-none absolute z-20 rounded-md border-2 border-dashed",
        className,
      )}
      data-selection-presence
      ref={ref}
      role="img"
      style={{
        backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)`,
        borderColor: accent,
        height,
        left: x,
        top: y,
        width,
      }}
      {...rest}
    >
      {name === null || name === undefined ? null : (
        <span
          className="absolute -top-5 left-0 inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm"
          data-selection-presence-chip
          style={{ backgroundColor: accent }}
        >
          {name}
        </span>
      )}
    </div>
  );
});
SelectionPresence.displayName = "SelectionPresence";
