"use client";

import { useEffect } from "react";

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

import { useControllableState } from "../../../lib/use-controllable-state";
import { cn } from "../../../lib/utils";

export type ThinkingBlockProps = {
  className?: string;
  /** Whether the content is still streaming. */
  isStreaming?: boolean;
  /** Called with the next state when the block opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Controls whether the block is open. Pair it with `onOpenChange`. */
  open?: boolean;
  /** The thinking text content to display. */
  thinking: string;
};

/** Collapsible thinking block with streaming support. */
export function ThinkingBlock({
  className,
  isStreaming = false,
  onOpenChange,
  open,
  ref,
  thinking,
}: ThinkingBlockProps & { ref?: React.Ref<HTMLDivElement> }) {
  const [isExpanded, setIsExpanded] = useControllableState({
    defaultValue: isStreaming,
    onChange: onOpenChange,
    value: open,
  });

  // Auto-open when streaming starts
  useEffect(() => {
    if (!isStreaming) return;
    const frame = requestAnimationFrame(() => {
      setIsExpanded(true);
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isStreaming, setIsExpanded]);

  return (
    <Collapsible
      className={cn("mb-2", className)}
      onOpenChange={setIsExpanded}
      open={isExpanded}
      ref={ref}
    >
      <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        {isExpanded ? (
          <ChevronDown className="size-3" />
        ) : (
          <ChevronRight className="size-3" />
        )}
        <span>
          Thinking
          {isStreaming ? (
            <span className="ml-1 animate-pulse motion-reduce:animate-none">
              &hellip;
            </span>
          ) : null}
        </span>
      </CollapsibleTrigger>
      <CollapsiblePanel className="mt-2 p-3 bg-muted/50 rounded text-xs text-muted-foreground whitespace-pre-wrap border-l border-muted-foreground/30 max-h-48 overflow-y-auto">
        {thinking}
        {isStreaming ? (
          <span className="animate-pulse motion-reduce:animate-none">|</span>
        ) : null}
      </CollapsiblePanel>
    </Collapsible>
  );
}

ThinkingBlock.displayName = "ThinkingBlock";
