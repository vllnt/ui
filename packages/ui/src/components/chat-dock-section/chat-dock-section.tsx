import { forwardRef } from "react";

import { ArrowUpRight, MessageSquareText } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../../lib/utils";
import { Button } from "../button";

export type ChatDockMessage = {
  body: ReactNode;
  id: string;
  speaker: ReactNode;
};

export type ChatDockSectionProps = React.ComponentPropsWithoutRef<"section"> & {
  composerPlaceholder?: string;
  contextLabel?: ReactNode;
  messages: ChatDockMessage[];
  title?: ReactNode;
};

const ChatDockSection = forwardRef<HTMLElement, ChatDockSectionProps>(
  (
    {
      className,
      composerPlaceholder = "Ask about runs, errors, or pending work…",
      contextLabel,
      messages,
      title = "Assistant",
      ...props
    },
    ref,
  ) => (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border/70 bg-background/75 p-4 shadow-[0_10px_35px_hsl(var(--foreground)/0.06)] backdrop-blur-xl",
        className,
      )}
      ref={ref}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MessageSquareText className="size-4 text-primary" />
            {title}
          </div>
          {contextLabel ? (
            <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              {contextLabel}
            </div>
          ) : null}
        </div>
        <Button size="sm" type="button" variant="ghost">
          Open thread
          <ArrowUpRight className="size-4" />
        </Button>
      </div>
      <div className="space-y-3">
        {messages.map((message) => (
          <div
            className="rounded-xl border border-border/60 bg-background/85 px-3 py-2"
            key={message.id}
          >
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {message.speaker}
            </div>
            <div className="mt-2 text-sm leading-6 text-foreground">
              {message.body}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-dashed border-border/80 bg-background/70 px-3 py-3 text-sm text-muted-foreground">
        {composerPlaceholder}
      </div>
    </section>
  ),
);

ChatDockSection.displayName = "ChatDockSection";

export { ChatDockSection };
