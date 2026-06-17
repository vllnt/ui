"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "../../lib/utils";

/**
 * Localizable strings.
 *
 * @public
 */
export type LiveCursorLabels = {
  /** Aria-label override. Defaults to `"Live cursor"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Live cursor",
} as const satisfies Required<LiveCursorLabels>;

/**
 * Props for {@link LiveCursor}.
 *
 * @public
 */
export type LiveCursorProps = {
  /** Tailwind / arbitrary CSS color used for the pointer + name chip. Defaults to `var(--foreground)`. */
  color?: string;
  /** Localizable strings. */
  labels?: LiveCursorLabels;
  /** Display name shown in the chip. Pass `null` to hide the chip. */
  name?: ReactNode;
  /** Optional secondary line in the chip (e.g. status, role). */
  status?: ReactNode;
  /** Cursor X in canvas pixels. */
  x: number;
  /** Cursor Y in canvas pixels. */
  y: number;
} & ComponentPropsWithoutRef<"div">;

/**
 * Remote user's cursor rendered at canvas coordinates with an optional
 * name + status chip. Pure presentation; the host owns the websocket
 * stream + maps user ids to colors.
 *
 * The wrapper is `pointer-events: none` so host gestures pass through.
 *
 * @example
 * ```tsx
 * <div className="relative h-screen w-screen">
 *   <Canvas />
 *   <LiveCursor x={420} y={180} name="Bea" color="#5b8def" />
 * </div>
 * ```
 *
 * @public
 */
export const LiveCursor = ({
  ref,
  ...props
}: LiveCursorProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const { className, color, labels, name, status, x, y, ...rest } = props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  const resolvedColor = color ?? "var(--foreground)";
  return (
    <div
      aria-label={
        typeof name === "string"
          ? `${resolvedLabels.region}: ${name}`
          : resolvedLabels.region
      }
      className={cn(
        "pointer-events-none absolute z-30 flex items-start gap-1",
        className,
      )}
      data-live-cursor
      ref={ref}
      role="img"
      style={{ left: x, top: y }}
      {...rest}
    >
      <svg
        aria-hidden="true"
        className="-ml-1 -mt-1 drop-shadow-sm"
        data-live-cursor-pointer
        fill={resolvedColor}
        height={18}
        viewBox="0 0 16 18"
        width={16}
      >
        <path d="M0 0 L0 14 L4 11 L7 17 L10 16 L7 10 L13 10 Z" />
      </svg>
      {name === null || name === undefined ? null : (
        <span
          className="ml-2 mt-2 inline-flex flex-col rounded-md px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm"
          data-live-cursor-chip
          style={{ backgroundColor: resolvedColor }}
        >
          <span>{name}</span>
          {status ? (
            <span className="text-[9px] opacity-80" data-live-cursor-status>
              {status}
            </span>
          ) : null}
        </span>
      )}
    </div>
  );
};
LiveCursor.displayName = "LiveCursor";
