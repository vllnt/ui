"use client";

import { Children, useEffect } from "react";

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible";
import { Brain, ChevronDown } from "lucide-react";

import { useControllableState } from "../../../lib/use-controllable-state";
import { cn } from "../../../lib/utils";

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
  /** Controls whether the panel shows its steps. Pair it with `onOpenChange`. */
  open?: boolean;
  /** Reasoning steps rendered as an ordered list when expanded. */
  steps?: string[];
};

function ReasoningTrigger({
  duration,
  isOpen,
  isStreaming,
}: {
  duration?: number;
  isOpen: boolean;
  isStreaming: boolean;
}) {
  return (
    <CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
      <Brain className="size-4 shrink-0" />
      <span className="font-medium">
        {isStreaming ? "Reasoning" : "Reasoned"}
        {typeof duration === "number" ? ` for ${duration}s` : null}
      </span>
      {isStreaming ? (
        <span className="animate-pulse motion-reduce:animate-none">
          &hellip;
        </span>
      ) : null}
      <ChevronDown
        className={cn(
          "ml-auto size-4 shrink-0 transition-transform",
          isOpen ? "rotate-180" : "rotate-0",
        )}
      />
    </CollapsibleTrigger>
  );
}

function ReasoningContent({
  children,
  isStreaming,
  steps,
}: {
  children?: React.ReactNode;
  isStreaming: boolean;
  steps?: string[];
}) {
  const hasSteps = steps !== undefined && steps.length > 0;

  return (
    <CollapsiblePanel className="border-t border-border px-3 py-2 text-sm text-muted-foreground">
      {hasSteps ? (
        <ol className="list-decimal space-y-1 pl-4">
          {Children.map(steps, (step) => (
            <li className="whitespace-pre-wrap">{step}</li>
          ))}
        </ol>
      ) : (
        <div className="whitespace-pre-wrap">{children}</div>
      )}
      {isStreaming ? (
        <span
          aria-hidden
          className="ml-0.5 animate-pulse motion-reduce:animate-none"
        >
          &#9611;
        </span>
      ) : null}
    </CollapsiblePanel>
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
  open,
  ref,
  steps,
}: ReasoningProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const [isOpen, setIsOpen] = useControllableState({
    defaultValue: isStreaming,
    onChange: onOpenChange,
    value: open,
  });

  useEffect(() => {
    if (!isStreaming) return;
    const frame = requestAnimationFrame(() => {
      setIsOpen(true);
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isStreaming, setIsOpen]);

  return (
    <Collapsible
      className={cn("rounded-lg border border-border bg-muted/30", className)}
      onOpenChange={setIsOpen}
      open={isOpen}
      ref={ref}
    >
      <ReasoningTrigger
        duration={duration}
        isOpen={isOpen}
        isStreaming={isStreaming}
      />
      <ReasoningContent isStreaming={isStreaming} steps={steps}>
        {children}
      </ReasoningContent>
    </Collapsible>
  );
};
Reasoning.displayName = "Reasoning";
