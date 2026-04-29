import { forwardRef } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";
import { Avatar, AvatarFallback } from "../avatar";
import { Badge } from "../badge";

const bubbleVariants = cva(
  "rounded-2xl border px-4 py-3 shadow-sm transition-colors",
  {
    defaultVariants: {
      messageRole: "assistant",
    },
    variants: {
      messageRole: {
        assistant: "border-border bg-card text-card-foreground",
        system: "border-border/80 bg-muted/60 text-foreground",
        tool: "border-border bg-muted/40 text-foreground",
        user: "border-primary/20 bg-primary/10 text-foreground",
      },
    },
  },
);

function AIMessageMeta({
  author,
  isUser,
  status,
  timestamp,
}: {
  author?: string;
  isUser: boolean;
  status?: string;
  timestamp?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 text-xs text-muted-foreground",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {author ? (
        <span className="font-medium text-foreground">{author}</span>
      ) : null}
      {timestamp ? <span>{timestamp}</span> : null}
      {status ? (
        <Badge
          className="rounded-full px-2 py-0 text-[10px]"
          variant="secondary"
        >
          {status}
        </Badge>
      ) : null}
    </div>
  );
}

export type AIMessageBubbleProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof bubbleVariants> & {
    /** Optional short label describing the speaker. */
    author?: string;
    /** Bubble body content. */
    children: React.ReactNode;
    /** Optional status badge for the message. */
    status?: string;
    /** Optional timestamp or relative time label. */
    timestamp?: string;
  };

const AIMessageBubble = forwardRef<HTMLDivElement, AIMessageBubbleProps>(
  (
    {
      author,
      children,
      className,
      messageRole = "assistant",
      status,
      timestamp,
      ...props
    },
    ref,
  ) => {
    const resolvedMessageRole = messageRole ?? "assistant";
    const isUser = resolvedMessageRole === "user";
    const fallbackLabel = (author ?? resolvedMessageRole)
      .charAt(0)
      .toUpperCase();

    return (
      <div
        className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
      >
        <div
          className={cn(
            "flex w-full max-w-3xl gap-3",
            isUser ? "flex-row-reverse text-right" : "flex-row",
          )}
        >
          <Avatar className="mt-0.5 h-8 w-8 border border-border/70">
            <AvatarFallback className="bg-muted text-[11px] font-medium uppercase text-muted-foreground">
              {fallbackLabel}
            </AvatarFallback>
          </Avatar>

          <div
            className={cn(
              "min-w-0 space-y-2",
              isUser ? "items-end" : "items-start",
            )}
          >
            <AIMessageMeta
              author={author}
              isUser={isUser}
              status={status}
              timestamp={timestamp}
            />

            <div
              className={cn(
                bubbleVariants({ messageRole: resolvedMessageRole }),
                className,
              )}
              ref={ref}
              {...props}
            >
              <div className="text-sm leading-6 whitespace-pre-wrap">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

AIMessageBubble.displayName = "AIMessageBubble";

export { AIMessageBubble };
