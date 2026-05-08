"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

import { cn } from "../../lib/utils";

/**
 * One reply inside the thread.
 *
 * @public
 */
export type ThreadReply = {
  /** Body content. Pass plain text or rich nodes. */
  body: ReactNode;
  /** Stable id used for analytics + React keys. */
  id: string;
  /** Optional ISO timestamp string for the meta line. */
  timestamp?: string;
  /** Display name. */
  user: string;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type ThreadBubbleLabels = {
  /** Default footer placeholder copy. Defaults to `"Reply…"`. */
  composePlaceholder?: string;
  /** Aria-label for the bubble. Defaults to `"Comment thread"`. */
  region?: string;
  /** "Resolved" pill copy. Defaults to `"Resolved"`. */
  resolved?: string;
};

const DEFAULT_LABELS = {
  composePlaceholder: "Reply…",
  region: "Comment thread",
  resolved: "Resolved",
} as const satisfies Required<ThreadBubbleLabels>;

/**
 * Props for {@link ThreadBubble}.
 *
 * @public
 */
export type ThreadBubbleProps = {
  /** Optional compose slot rendered below the replies. */
  composeSlot?: ReactNode;
  /** Localizable strings. */
  labels?: ThreadBubbleLabels;
  /** Replies in chronological order. */
  replies: ThreadReply[];
  /** When `true`, surfaces a `Resolved` pill in the header. */
  resolved?: boolean;
  /** Optional thread title rendered as the header. */
  title?: ReactNode;
} & ComponentPropsWithoutRef<"div">;

type ReplyProps = {
  reply: ThreadReply;
};

function ReplyRow({ reply }: ReplyProps): ReactNode {
  return (
    <li className="space-y-1" data-thread-reply-id={reply.id}>
      <div className="flex items-baseline gap-2 text-[11px]">
        <span className="font-semibold text-foreground">{reply.user}</span>
        {reply.timestamp ? (
          <time className="text-muted-foreground" dateTime={reply.timestamp}>
            {new Date(reply.timestamp).toLocaleString(undefined, {
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              month: "short",
            })}
          </time>
        ) : null}
      </div>
      <div className="text-sm leading-relaxed text-foreground">
        {reply.body}
      </div>
    </li>
  );
}

/**
 * Floating thread bubble for an anchored comment. Pair with
 * {@link CommentPin} — surface the bubble while a pin is active.
 *
 * @example
 * ```tsx
 * <ThreadBubble
 *   title="Trade-off summary"
 *   replies={[
 *     { id: "1", user: "Sam", body: "We should reword this.", timestamp: "2026-05-08T09:00:00Z" },
 *     { id: "2", user: "Wei", body: "Agreed — drafting.", timestamp: "2026-05-08T09:05:00Z" },
 *   ]}
 *   composeSlot={<textarea placeholder="Reply…" />}
 * />
 * ```
 *
 * @public
 */
export const ThreadBubble = forwardRef<HTMLDivElement, ThreadBubbleProps>(
  (props, ref) => {
    const {
      className,
      composeSlot,
      labels,
      replies,
      resolved = false,
      title,
      ...rest
    } = props;
    const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
    return (
      <div
        aria-label={resolvedLabels.region}
        className={cn(
          "z-30 flex w-72 flex-col gap-2 rounded-2xl border bg-popover p-3 text-popover-foreground shadow-lg",
          className,
        )}
        data-thread-replies={replies.length}
        ref={ref}
        role="region"
        {...rest}
      >
        {title || resolved ? (
          <header className="flex items-center justify-between gap-2">
            {title ? (
              <h3 className="truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {title}
              </h3>
            ) : (
              <span />
            )}
            {resolved ? (
              <span
                className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300"
                data-thread-resolved
              >
                {resolvedLabels.resolved}
              </span>
            ) : null}
          </header>
        ) : null}
        <ol className="space-y-2 border-l border-border pl-2">
          {replies.map((reply) => (
            <ReplyRow key={reply.id} reply={reply} />
          ))}
        </ol>
        {composeSlot ?? (
          <div className="rounded-md border border-dashed border-border px-2 py-1 text-xs text-muted-foreground">
            {resolvedLabels.composePlaceholder}
          </div>
        )}
      </div>
    );
  },
);
ThreadBubble.displayName = "ThreadBubble";
