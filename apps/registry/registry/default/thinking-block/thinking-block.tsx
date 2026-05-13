"use client";

import { useCallback, useId, useLayoutEffect, useReducer } from "react";

import { ChevronDown, ChevronRight } from "lucide-react";

import { cn } from "@vllnt/ui";

export type ThinkingBlockProps = {
  className?: string;
  /** Whether the content is still streaming. */
  isStreaming?: boolean;
  /** The thinking text content to display. */
  thinking: string;
};

type ThinkingBlockState = {
  isExpanded: boolean;
};

type ThinkingBlockAction =
  | { isStreaming: boolean; type: "streaming-changed" }
  | { type: "toggle" };

function thinkingBlockReducer(
  state: ThinkingBlockState,
  action: ThinkingBlockAction,
): ThinkingBlockState {
  switch (action.type) {
    case "streaming-changed":
      return action.isStreaming ? { isExpanded: true } : state;
    case "toggle":
      return { isExpanded: !state.isExpanded };
  }
}

/** Collapsible thinking block with streaming support. */
export function ThinkingBlock({
  className,
  isStreaming = false,
  thinking,
}: ThinkingBlockProps) {
  const [{ isExpanded }, dispatch] = useReducer(thinkingBlockReducer, {
    isExpanded: isStreaming,
  });
  const contentId = useId();

  useLayoutEffect(() => {
    dispatch({ isStreaming, type: "streaming-changed" });
  }, [isStreaming]);

  const toggleExpanded = useCallback(() => {
    dispatch({ type: "toggle" });
  }, []);

  return (
    <div className={cn("mb-2", className)}>
      <button
        aria-controls={contentId}
        aria-expanded={isExpanded}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        onClick={toggleExpanded}
        type="button"
      >
        {isExpanded ? (
          <ChevronDown className="size-3" />
        ) : (
          <ChevronRight className="size-3" />
        )}
        <span>
          Thinking
          {isStreaming ? <span className="ml-1 animate-pulse">...</span> : null}
        </span>
      </button>
      {isExpanded ? (
        <div
          className="mt-2 p-3 bg-muted/50 rounded text-xs text-muted-foreground whitespace-pre-wrap border-l-2 border-muted-foreground/30 max-h-48 overflow-y-auto"
          id={contentId}
        >
          {thinking}
          {isStreaming ? <span className="animate-pulse">|</span> : null}
        </div>
      ) : null}
    </div>
  );
}
