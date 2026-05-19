"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@vllnt/ui";

/**
 * Resolution state of a pinned comment.
 *
 * @public
 */
export type CommentPinState = "open" | "resolved";

/**
 * Localizable strings.
 *
 * @public
 */
export type CommentPinLabels = {
  /** Aria-label override. Defaults to `"Comment"`. */
  region?: string;
  /** Suffix appended after the unread count for screen readers. */
  unreadSuffix?: string;
};

const DEFAULT_LABELS = {
  region: "Comment",
  unreadSuffix: "unread",
} as const satisfies Required<CommentPinLabels>;

/**
 * Props for {@link CommentPin}.
 *
 * @public
 */
export type CommentPinProps = {
  /** Optional author initial / glyph rendered inside the pin. */
  authorInitial?: ReactNode;
  /** Optional accent color for the pin. Defaults to the foreground. */
  color?: string;
  /** Localizable strings. */
  labels?: CommentPinLabels;
  /** Click handler — when provided, the pin becomes a button. */
  onActivate?: () => void;
  /** State of the underlying thread. Defaults to `"open"`. */
  state?: CommentPinState;
  /** Optional unread reply count. Renders as a small numeric badge. */
  unread?: number;
  /** Anchor X in canvas pixels. */
  x: number;
  /** Anchor Y in canvas pixels. */
  y: number;
} & ComponentPropsWithoutRef<"div">;

const STATE_FILL: Record<CommentPinState, string> = {
  open: "bg-foreground text-background",
  resolved: "bg-muted text-muted-foreground",
};

type PinBodyInput = {
  accent?: string;
  authorInitial?: ReactNode;
  state: CommentPinState;
  unread?: number;
};

const PinBody = (props: PinBodyInput): React.ReactElement => {
  const showBadge = typeof props.unread === "number" && props.unread > 0;
  const useAccent = props.accent && props.state === "open";
  return (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "flex size-7 items-center justify-center rounded-full border border-background text-[11px] font-semibold shadow-sm",
          STATE_FILL[props.state],
        )}
        data-comment-pin-body
        style={
          useAccent
            ? { backgroundColor: props.accent, color: "white" }
            : undefined
        }
      >
        {props.authorInitial ?? "•"}
      </span>
      {showBadge ? (
        <span
          aria-hidden="true"
          className="absolute -right-1 -top-1 inline-flex min-h-[14px] min-w-[14px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-medium text-white"
          data-comment-pin-unread
        >
          {props.unread}
        </span>
      ) : null}
    </>
  );
};

/**
 * Anchored discussion pin rendered at canvas coordinates. Use to mark
 * an object-anchored comment thread; click to expand into a
 * {@link "../thread-bubble/thread-bubble".ThreadBubble} (or whatever the host wires up).
 *
 * Pure presentation; the host owns the thread store + supplies the
 * unread count and resolution state.
 *
 * @example
 * ```tsx
 * <div className="relative h-screen w-screen">
 *   <Canvas />
 *   <CommentPin
 *     x={420} y={180}
 *     authorInitial="B"
 *     unread={3}
 *     onActivate={() => openThread("c-1")}
 *   />
 * </div>
 * ```
 *
 * @public
 */
export const CommentPin = (
  props: CommentPinProps & React.RefAttributes<HTMLDivElement>,
) => {
  const {
    authorInitial,
    className,
    color,
    labels,
    onActivate,
    ref,
    state = "open",
    unread,
    x,
    y,
    ...rest
  } = props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  const showBadge = typeof unread === "number" && unread > 0;
  const ariaLabel = showBadge
    ? `${resolvedLabels.region}, ${unread} ${resolvedLabels.unreadSuffix}`
    : resolvedLabels.region;
  const handleClick = (): void => {
    onActivate?.();
  };
  const body = (
    <PinBody
      accent={color}
      authorInitial={authorInitial}
      state={state}
      unread={unread}
    />
  );
  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        "absolute z-30 inline-flex -translate-x-1/2 -translate-y-1/2",
        className,
      )}
      data-comment-pin
      data-comment-pin-state={state}
      ref={ref}
      role="img"
      style={{ left: x, top: y }}
      {...rest}
    >
      {onActivate ? (
        <button
          aria-label={ariaLabel}
          className="relative inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          data-comment-pin-trigger
          onClick={handleClick}
          type="button"
        >
          {body}
        </button>
      ) : (
        <span className="relative inline-flex">{body}</span>
      )}
    </div>
  );
};
CommentPin.displayName = "CommentPin";
