"use client";

import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "../../lib/utils";

/**
 * Pin status — drives the dot color.
 *
 * @public
 */
export type CommentPinStatus = "open" | "resolved" | "unread";

const STATUS_CLASSES: Record<CommentPinStatus, string> = {
  open: "bg-blue-500 text-white",
  resolved: "bg-emerald-500 text-white",
  unread: "bg-amber-500 text-white",
};

/**
 * Props for {@link CommentPin}.
 *
 * @public
 */
export type CommentPinProps = {
  /** Optional reply count rendered inside the pin. */
  count?: number;
  /** Optional initials of the author. Falls back to `count` or empty. */
  initials?: string;
  /** Optional click handler — fires after a pin click. */
  onSelect?: () => void;
  /** Pin status. Defaults to `"open"`. */
  status?: CommentPinStatus;
  /** X coordinate in container px. */
  x: number;
  /** Y coordinate in container px. */
  y: number;
} & Omit<ComponentPropsWithoutRef<"button">, "onClick" | "style" | "type">;

/**
 * Anchored comment marker. Pure presentation — the wrapper applies
 * `position: absolute` with the `x` / `y` props as `left` / `top`. Pair
 * with {@link ThreadBubble} to surface the conversation when the pin
 * is active.
 *
 * @example
 * ```tsx
 * <CommentPin x={120} y={80} count={3} status="unread" onSelect={open} />
 * ```
 *
 * @public
 */
export const CommentPin = forwardRef<HTMLButtonElement, CommentPinProps>(
  (props, ref) => {
    const {
      className,
      count,
      initials,
      onSelect,
      status = "open",
      x,
      y,
      ...rest
    } = props;
    const label = initials ?? (count === undefined ? "" : count.toString());
    return (
      <button
        aria-label={`Comment ${status}${label ? ` — ${label}` : ""}`}
        className={cn(
          "absolute z-30 inline-flex h-7 w-7 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full border-2 border-background text-[11px] font-semibold shadow-md transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          STATUS_CLASSES[status],
          className,
        )}
        data-comment-status={status}
        onClick={onSelect}
        ref={ref}
        style={{ left: `${x.toString()}px`, top: `${y.toString()}px` }}
        type="button"
        {...rest}
      >
        {label || (
          <span aria-hidden="true" className="text-[10px]">
            ●
          </span>
        )}
      </button>
    );
  },
);
CommentPin.displayName = "CommentPin";
