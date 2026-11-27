"use client";

import { useEffect, useReducer, useRef } from "react";

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible";

import { named } from "../../../lib/named";
import { useControllableState } from "../../../lib/use-controllable-state";

export type TLDRSectionProps = {
  children: React.ReactNode;
  /** Whether the section starts open. Ignored once `open` has a value. */
  defaultOpen?: boolean;
  label: string;
  /** Called with the next state when the section opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Controls whether the section is open. Pair it with `onOpenChange`. */
  open?: boolean;
};

type SkeletonAction = "hide" | "show";

function skeletonReducer(_state: boolean, action: SkeletonAction): boolean {
  return action === "show";
}

export const TLDRSection = /* @__PURE__ */ named(
  "TLDRSection",
  function TLDRSection({
    children,
    defaultOpen = false,
    label,
    onOpenChange,
    open,
    ref,
  }: TLDRSectionProps & { ref?: React.Ref<HTMLDivElement> }) {
    const [isExpanded, setIsExpanded] = useControllableState({
      defaultValue: defaultOpen,
      onChange: onOpenChange,
      value: open,
    });
    const [showSkeleton, dispatchSkeleton] = useReducer(skeletonReducer, false);
    const hasBeenOpenedRef = useRef(false);
    const timerReference = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      if (isExpanded && !hasBeenOpenedRef.current) {
        // Clear any existing timer
        if (timerReference.current) {
          clearTimeout(timerReference.current);
        }

        const rafId = requestAnimationFrame(() => {
          dispatchSkeleton("show");
          hasBeenOpenedRef.current = true;
        });

        // Simulate loading with skeleton
        timerReference.current = setTimeout(() => {
          dispatchSkeleton("hide");
          timerReference.current = null;
        }, 800);

        return () => {
          cancelAnimationFrame(rafId);
          if (timerReference.current) {
            clearTimeout(timerReference.current);
            timerReference.current = null;
          }
          dispatchSkeleton("hide");
        };
      }

      return () => {
        if (timerReference.current) {
          clearTimeout(timerReference.current);
          timerReference.current = null;
        }
        dispatchSkeleton("hide");
      };
    }, [isExpanded]);

    return (
      <Collapsible
        className="my-8 rounded-lg border border-border bg-muted/30 overflow-hidden"
        onOpenChange={setIsExpanded}
        open={isExpanded}
        ref={ref}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-3">
            <svg
              aria-hidden="true"
              className="size-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6h16M4 12h16M4 18h16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm font-medium text-foreground">{label}</span>
          </div>
          <svg
            aria-hidden="true"
            className={`size-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 9l-7 7-7-7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </CollapsibleTrigger>
        <CollapsiblePanel className="px-4 pb-4 pt-2 border-t border-border">
          {showSkeleton ? (
            <div className="space-y-3">
              <div className="relative h-4 bg-secondary/50 rounded overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent animate-shimmer motion-reduce:animate-none" />
              </div>
              <div className="relative h-4 bg-secondary/50 rounded overflow-hidden w-5/6">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent animate-shimmer motion-reduce:animate-none" />
              </div>
              <div className="relative h-4 bg-secondary/50 rounded overflow-hidden w-4/5">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent animate-shimmer motion-reduce:animate-none" />
              </div>
              <div className="relative h-4 bg-secondary/50 rounded overflow-hidden w-3/4">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent animate-shimmer motion-reduce:animate-none" />
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground leading-relaxed">
              {children}
            </div>
          )}
        </CollapsiblePanel>
      </Collapsible>
    );
  },
);
