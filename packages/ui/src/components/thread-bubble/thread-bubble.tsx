"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "../../lib/utils";

/**
 * One message in a thread bubble.
 *
 * @public
 */
export type ThreadMessage = {
  /** Author display name. */
  author: ReactNode;
  /** Optional accent color for the author chip. */
  authorColor?: string;
  /** Message body — rendered as-is, can be plain text or a `ReactNode`. */
  body: ReactNode;
  /** Stable identifier — used as the React key + analytics hook. */
  id: string;
  /** Pre-formatted timestamp (host owns formatting). */
  ts?: ReactNode;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type ThreadBubbleLabels = {
  /** Empty-state copy. Defaults to `"No replies yet"`. */
  empty?: string;
  /** Aria-label override. Defaults to `"Comment thread"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  empty: "No replies yet",
  region: "Comment thread",
} as const satisfies Required<ThreadBubbleLabels>;

/**
 * Props for {@link ThreadBubble}.
 *
 * @public
 */
export type ThreadBubbleProps = {
  /** Optional footer slot — typically a reply input. */
  footer?: ReactNode;
  /** Localizable strings. */
  labels?: ThreadBubbleLabels;
  /** Messages newest-last. */
  messages: ThreadMessage[];
  /** Optional resolve handler. When provided, a "Resolve" button appears in the header. */
  onResolve?: () => void;
  /** Optional thread title (e.g. anchored object name). */
  title?: ReactNode;
} & ComponentPropsWithoutRef<"section">;

const Message = (props: { message: ThreadMessage }): React.ReactElement => {
  const { message } = props;
  return (
    <li className="space-y-0.5" data-thread-bubble-message={message.id}>
      <header className="flex items-baseline justify-between gap-2 text-[10px]">
        <span
          className="font-semibold"
          data-thread-bubble-author
          style={
            message.authorColor ? { color: message.authorColor } : undefined
          }
        >
          {message.author}
        </span>
        {message.ts ? (
          <span className="text-muted-foreground" data-thread-bubble-ts>
            {message.ts}
          </span>
        ) : null}
      </header>
      <p className="text-xs text-foreground" data-thread-bubble-body>
        {message.body}
      </p>
    </li>
  );
};

/**
 * Expanded discussion bubble for an anchored canvas comment thread.
 * Renders a stacked message list plus an optional reply slot via
 * `footer`. Pair with {@link "../comment-pin/comment-pin".CommentPin}: pin marks the location,
 * bubble holds the conversation.
 *
 * Pure presentation; the host owns the message store + supplies the
 * resolve handler for hosts that allow threading.
 *
 * @example
 * ```tsx
 * <ThreadBubble
 *   title="research-2025"
 *   messages={[
 *     { id: "1", author: "Bea", authorColor: "#5b8def", body: "Why fallback?", ts: "12s" },
 *     { id: "2", author: "Lior", authorColor: "#10b981", body: "p95 spike — see graph", ts: "9s" },
 *   ]}
 *   footer={<ReplyInput onSubmit={post} />}
 *   onResolve={resolve}
 * />
 * ```
 *
 * @public
 */
export const ThreadBubble = ({
  ref,
  ...props
}: ThreadBubbleProps & { ref?: React.Ref<HTMLElement> }) => {
  const { className, footer, labels, messages, onResolve, title, ...rest } =
    props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  const handleResolve = (): void => {
    onResolve?.();
  };
  return (
    <section
      aria-label={resolvedLabels.region}
      className={cn(
        "flex w-72 flex-col gap-2 rounded-lg border border-border bg-background p-3 text-foreground shadow-md",
        className,
      )}
      data-thread-bubble
      ref={ref}
      {...rest}
    >
      {title || onResolve ? (
        <header className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
          {title ? (
            <span className="truncate font-semibold" data-thread-bubble-title>
              {title}
            </span>
          ) : (
            <span aria-hidden="true" />
          )}
          {onResolve ? (
            <button
              className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-thread-bubble-resolve
              onClick={handleResolve}
              type="button"
            >
              Resolve
            </button>
          ) : null}
        </header>
      ) : null}
      {messages.length === 0 ? (
        <p
          className="px-1 py-2 text-center text-[11px] text-muted-foreground"
          data-thread-bubble-state="empty"
        >
          {resolvedLabels.empty}
        </p>
      ) : (
        <ul className="space-y-2 overflow-y-auto" data-thread-bubble-list>
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </ul>
      )}
      {footer ? (
        <footer
          className="border-t border-border pt-2"
          data-thread-bubble-footer
        >
          {footer}
        </footer>
      ) : null}
    </section>
  );
};
ThreadBubble.displayName = "ThreadBubble";
