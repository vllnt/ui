"use client";

import { useCallback, useEffect, useId, useState } from "react";

import { Brain, ChevronDown } from "lucide-react";

import { cn } from "@vllnt/ui";

export type ReasoningProps = {
  /** Free-form reasoning content; renders when `steps` is absent. */
  children?: React.ReactNode;
  className?: string;
  /** Seconds the model spent reasoning, shown in the header. */
  duration?: number;
  /** Whether the reasoning trace is still streaming; auto-expands the panel. */
  isStreaming?: boolean;
  /** Called whenever the expanded state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Reasoning steps rendered as an ordered list when expanded. */
  steps?: string[];
};

function ReasoningTrigger({
  contentId,
  duration,
  isOpen,
  isStreaming,
  onToggle,
}: {
  contentId: string;
  duration?: number;
  isOpen: boolean;
  isStreaming: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      aria-controls={contentId}
      aria-expanded={isOpen}
      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      onClick={onToggle}
      type="button"
    >
      <Brain className="size-4 shrink-0" />
      <span className="font-medium">
        {isStreaming ? "Reasoning" : "Reasoned"}
        {typeof duration === "number" ? ` for ${duration}s` : null}
      </span>
      {isStreaming ? <span className="animate-pulse">&hellip;</span> : null}
      <ChevronDown
        className={cn(
          "ml-auto size-4 shrink-0 transition-transform",
          isOpen ? "rotate-180" : "rotate-0",
        )}
      />
    </button>
  );
}

function ReasoningContent({
  children,
  contentId,
  isStreaming,
  steps,
}: {
  children?: React.ReactNode;
  contentId: string;
  isStreaming: boolean;
  steps?: string[];
}) {
  const hasSteps = steps !== undefined && steps.length > 0;

  return (
    <div
      className="border-t border-border px-3 py-2 text-sm text-muted-foreground"
      id={contentId}
    >
      {hasSteps ? (
        <ol className="list-decimal space-y-1 pl-4">
          {steps.map((step, index) => (
            <li
              className="whitespace-pre-wrap"
              key={`${index}-${step.slice(0, 12)}`}
            >
              {step}
            </li>
          ))}
        </ol>
      ) : (
        <div className="whitespace-pre-wrap">{children}</div>
      )}
      {isStreaming ? (
        <span aria-hidden className="ml-0.5 animate-pulse">
          &#9611;
        </span>
      ) : null}
    </div>
  );
}

/**
 * Collapsible AI reasoning trace block.
 *
 * Shows a toggleable header ("Reasoning" while streaming, "Reasoned" once
 * settled) and an expandable body that renders either ordered `steps` or
 * free-form `children`. Auto-expands while `isStreaming` is true.
 *
 * @example
 * <Reasoning duration={4} steps={["Parse the request", "Check the cache"]} />
 */
export const Reasoning = ({
  children,
  className,
  duration,
  isStreaming = false,
  onOpenChange,
  ref,
  steps,
}: ReasoningProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const [isOpen, setIsOpen] = useState(isStreaming);
  const contentId = useId();

  useEffect(() => {
    if (isStreaming) {
      requestAnimationFrame(() => {
        setIsOpen(true);
      });
    }
  }, [isStreaming]);

  const handleToggle = useCallback(() => {
    setIsOpen((previous) => {
      const next = !previous;
      onOpenChange?.(next);
      return next;
    });
  }, [onOpenChange]);

  return (
    <div
      className={cn("rounded-lg border border-border bg-muted/30", className)}
      ref={ref}
    >
      <ReasoningTrigger
        contentId={contentId}
        duration={duration}
        isOpen={isOpen}
        isStreaming={isStreaming}
        onToggle={handleToggle}
      />
      {isOpen ? (
        <ReasoningContent
          contentId={contentId}
          isStreaming={isStreaming}
          steps={steps}
        >
          {children}
        </ReasoningContent>
      ) : null}
    </div>
  );
};
Reasoning.displayName = "Reasoning";
