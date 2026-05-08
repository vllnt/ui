"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

import { cn } from "../../lib/utils";

/**
 * Color theme for the cursor + label chip.
 *
 * @public
 */
export type LiveCursorColor =
  | "amber"
  | "blue"
  | "emerald"
  | "purple"
  | "red"
  | "rose";

const PALETTE: Record<
  LiveCursorColor,
  { chip: string; fill: string; stroke: string }
> = {
  amber: {
    chip: "bg-amber-500 text-white",
    fill: "fill-amber-500",
    stroke: "stroke-amber-700",
  },
  blue: {
    chip: "bg-blue-500 text-white",
    fill: "fill-blue-500",
    stroke: "stroke-blue-700",
  },
  emerald: {
    chip: "bg-emerald-500 text-white",
    fill: "fill-emerald-500",
    stroke: "stroke-emerald-700",
  },
  purple: {
    chip: "bg-purple-500 text-white",
    fill: "fill-purple-500",
    stroke: "stroke-purple-700",
  },
  red: {
    chip: "bg-red-500 text-white",
    fill: "fill-red-500",
    stroke: "stroke-red-700",
  },
  rose: {
    chip: "bg-rose-500 text-white",
    fill: "fill-rose-500",
    stroke: "stroke-rose-700",
  },
};

/**
 * Props for {@link LiveCursor}.
 *
 * @public
 */
export type LiveCursorProps = {
  /** Color theme. Defaults to `"blue"`. */
  color?: LiveCursorColor;
  /** Optional label rendered next to the cursor (typically the user name). */
  label?: ReactNode;
  /** X coordinate in container px. */
  x: number;
  /** Y coordinate in container px. */
  y: number;
} & Omit<ComponentPropsWithoutRef<"div">, "style">;

/**
 * Live remote cursor for a multi-user canvas. Pure presentation — the
 * wrapper applies `position: absolute` with `left` / `top` from the
 * `x` / `y` props. Pair with a presence channel (Liveblocks, Yjs, or
 * your own websocket) to drive the coordinates.
 *
 * @example
 * ```tsx
 * <LiveCursor x={remote.x} y={remote.y} label="Sam" color="emerald" />
 * ```
 *
 * @public
 */
export const LiveCursor = forwardRef<HTMLDivElement, LiveCursorProps>(
  (props, ref) => {
    const { className, color = "blue", label, x, y, ...rest } = props;
    const palette = PALETTE[color];
    return (
      <div
        className={cn(
          "pointer-events-none absolute z-30 flex select-none items-start gap-1",
          className,
        )}
        data-cursor-color={color}
        ref={ref}
        style={{ left: `${x.toString()}px`, top: `${y.toString()}px` }}
        {...rest}
      >
        <svg
          aria-hidden="true"
          className={cn("h-4 w-4 drop-shadow", palette.fill, palette.stroke)}
          strokeWidth="1.5"
          viewBox="0 0 16 16"
        >
          <path d="M2 2 L2 12 L5 9 L7.5 14 L9.5 13 L7 8 L11 8 Z" />
        </svg>
        {label ? (
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[11px] font-medium shadow-sm",
              palette.chip,
            )}
          >
            {label}
          </span>
        ) : null}
      </div>
    );
  },
);
LiveCursor.displayName = "LiveCursor";
