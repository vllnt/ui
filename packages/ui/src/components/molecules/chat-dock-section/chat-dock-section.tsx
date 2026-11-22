import { ArrowUpRight, MessageSquareText } from "lucide-react";
import type { ReactNode } from "react";

import type { MaterialProps } from "../../../lib/material";
import { cn } from "../../../lib/utils";
import { Button } from "../../atoms/button/button";

export type ChatDockMessage = {
  body: ReactNode;
  id: string;
  speaker: ReactNode;
};

export type ChatDockSectionProps = MaterialProps &
  React.ComponentPropsWithoutRef<"section"> & {
    composerPlaceholder?: string;
    contextLabel?: ReactNode;
    messages: ChatDockMessage[];
    title?: ReactNode;
  };

const ChatDockSection = ({
  className,
  composerPlaceholder = "Ask about runs, errors, or pending work…",
  contextLabel,
  material = "glass",
  messages,
  ref,
  title = "Assistant",
  ...props
}: ChatDockSectionProps & { ref?: React.Ref<HTMLElement> }) => (
  <section
    className={cn(
      "vllnt-glass vllnt-glass-dense flex flex-col gap-4 rounded-2xl border p-4",
      className,
    )}
    data-material={material}
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
    <div className="rounded-xl border border-dashed border-border/80 bg-background/70 p-3 text-sm text-muted-foreground">
      {composerPlaceholder}
    </div>
  </section>
);

ChatDockSection.displayName = "ChatDockSection";

export { ChatDockSection };
