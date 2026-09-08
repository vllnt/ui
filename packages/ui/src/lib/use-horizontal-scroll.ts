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
  const [scrollElement, setScrollElement] = useState<HTMLElement>();
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

  const containerRef = useCallback((node: HTMLElement | null) => {
    scrollRef.current = node ?? undefined;
    setScrollElement(node ?? undefined);
  }, []);

  useEffect(() => {
    if (!scrollElement) return;

    scrollElement.addEventListener("scroll", updateScrollState, {
      passive: true,
    });
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(updateScrollState);
    observer?.observe(scrollElement);
    updateScrollState();

    return () => {
      scrollElement.removeEventListener("scroll", updateScrollState);
      observer?.disconnect();
    };
  }, [scrollElement, updateScrollState]);

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
