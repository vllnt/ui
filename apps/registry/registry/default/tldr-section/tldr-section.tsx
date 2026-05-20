"use client";

import { useEffect, useReducer, useRef } from "react";

type TLDRSectionProps = {
  children: React.ReactNode;
  label: string;
};

type TLDRSectionState = {
  hasBeenOpened: boolean;
  isExpanded: boolean;
  isLoading: boolean;
};

type TLDRSectionAction =
  | { type: "finish-loading" }
  | { type: "mark-opened" }
  | { type: "toggle" };

function tldrSectionReducer(
  state: TLDRSectionState,
  action: TLDRSectionAction,
): TLDRSectionState {
  switch (action.type) {
    case "finish-loading":
      return { ...state, isLoading: false };
    case "mark-opened":
      return { ...state, hasBeenOpened: true, isLoading: true };
    case "toggle":
      return { ...state, isExpanded: !state.isExpanded };
  }
}

export function TLDRSection({ children, label }: TLDRSectionProps) {
  const [{ hasBeenOpened, isExpanded, isLoading }, dispatch] = useReducer(
    tldrSectionReducer,
    {
      hasBeenOpened: false,
      isExpanded: false,
      isLoading: false,
    },
  );
  const timerReference = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isExpanded && !hasBeenOpened) {
      // Clear any existing timer
      if (timerReference.current) {
        clearTimeout(timerReference.current);
      }

      const rafId = requestAnimationFrame(() => {
        dispatch({ type: "mark-opened" });
      });

      // Simulate loading with skeleton
      timerReference.current = setTimeout(() => {
        dispatch({ type: "finish-loading" });
        timerReference.current = null;
      }, 800);

      return () => {
        cancelAnimationFrame(rafId);
        if (timerReference.current) {
          clearTimeout(timerReference.current);
          timerReference.current = null;
        }
      };
    }

    return () => {
      if (timerReference.current) {
        clearTimeout(timerReference.current);
        timerReference.current = null;
      }
    };
  }, [isExpanded]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="my-8 rounded-lg border border-border bg-muted/30 overflow-hidden">
      <button
        className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/50 transition-colors"
        onClick={() => {
          dispatch({ type: "toggle" });
        }}
        type="button"
      >
        <div className="flex items-center gap-3">
          <svg
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
      </button>
      {isExpanded ? (
        <div className="px-4 pb-4 pt-2 border-t border-border">
          {isLoading ? (
            <div className="space-y-3">
              <div className="relative h-4 bg-muted/50 rounded overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent animate-shimmer" />
              </div>
              <div className="relative h-4 bg-muted/50 rounded overflow-hidden w-5/6">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent animate-shimmer" />
              </div>
              <div className="relative h-4 bg-muted/50 rounded overflow-hidden w-4/5">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent animate-shimmer" />
              </div>
              <div className="relative h-4 bg-muted/50 rounded overflow-hidden w-3/4">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent animate-shimmer" />
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground leading-relaxed">
              {children}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
