"use client";

import { type ReactNode, useCallback, useState } from "react";

type LazyMountProps = {
  children: ReactNode;
  /** Reserved space before mount to avoid layout shift. */
  minHeight?: number;
  /** Start loading this far before the element enters the viewport. */
  rootMargin?: string;
};

/**
 * Renders `children` after the placeholder scrolls near the viewport. Keeps
 * heavy client subtrees (e.g. syntax-highlighted source) out of the initial
 * hydration path so they don't inflate TBT/LCP on first load. A callback ref
 * (not an effect) attaches the IntersectionObserver so the observed node stays
 * current.
 */
export function LazyMount({
  children,
  minHeight = 240,
  rootMargin = "200px",
}: LazyMountProps) {
  const [show, setShow] = useState(false);

  const observe = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || show) {
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            setShow(true);
            observer.disconnect();
          }
        },
        { rootMargin },
      );
      observer.observe(node);
      return () => {
        observer.disconnect();
      };
    },
    [rootMargin, show],
  );

  return (
    <div ref={observe} style={show ? undefined : { minHeight }}>
      {show ? children : null}
    </div>
  );
}
