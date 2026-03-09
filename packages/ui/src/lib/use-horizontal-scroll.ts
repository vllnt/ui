"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseHorizontalScrollReturn = {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  containerRef: React.RefCallback<HTMLElement>;
  scroll: (direction: "left" | "right") => void;
};

/**
 * Hook for horizontal scroll containers with navigation state.
 *
 * @returns Scroll state, ref callback for the container, and scroll function.
 *
 * @example
 * ```tsx
 * const { canScrollLeft, canScrollRight, containerRef, scroll } = useHorizontalScroll();
 *
 * <div ref={containerRef} className="overflow-x-auto">
 *   {children}
 * </div>
 * ```
 */
export function useHorizontalScroll(): UseHorizontalScrollReturn {
  const scrollRef = useRef<HTMLElement | undefined>(undefined);
  const observerRef = useRef<ResizeObserver | undefined>(undefined);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    setCanScrollLeft(element.scrollLeft > 0);
    setCanScrollRight(
      element.scrollLeft + element.clientWidth < element.scrollWidth - 1,
    );
  }, []);

  const containerRef = useCallback(
    (node: HTMLElement | null) => {
      if (scrollRef.current) {
        scrollRef.current.removeEventListener("scroll", updateScrollState);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = undefined;
      }

      scrollRef.current = node ?? undefined;

      if (node) {
        node.addEventListener("scroll", updateScrollState, { passive: true });
        if (typeof ResizeObserver !== "undefined") {
          observerRef.current = new ResizeObserver(updateScrollState);
          observerRef.current.observe(node);
        }
        updateScrollState();
      }
    },
    [updateScrollState],
  );

  useEffect(() => {
    return () => {
      if (scrollRef.current) {
        scrollRef.current.removeEventListener("scroll", updateScrollState);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [updateScrollState]);

  const scroll = useCallback((direction: "left" | "right") => {
    const element = scrollRef.current;
    if (!element) return;
    const amount = element.clientWidth * 0.8;
    element.scrollBy({
      behavior: "smooth",
      left: direction === "left" ? -amount : amount,
    });
  }, []);

  return { canScrollLeft, canScrollRight, containerRef, scroll };
}
