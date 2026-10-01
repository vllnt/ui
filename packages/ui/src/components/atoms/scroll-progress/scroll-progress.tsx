"use client";

import * as React from "react";

import { cn } from "../../../lib/utils";

/**
 * Props for {@link ScrollProgress}. The progressbar takes the name
 * `"Reading progress"` unless you pass `aria-label` or `aria-labelledby`.
 */
export type ScrollProgressProps = React.ComponentPropsWithoutRef<"div">;

function computeProgress(): number {
  const element = document.documentElement;
  const scrollable = element.scrollHeight - element.clientHeight;
  if (scrollable <= 0) {
    return 0;
  }
  return (element.scrollTop / scrollable) * 100;
}

/**
 * Fixed bar pinned to the top of the page that grows with scroll progress.
 *
 * Functional under `prefers-reduced-motion`: it updates instantly.
 *
 * @example
 * ```tsx
 * <ScrollProgress />
 * ```
 */
export const ScrollProgress = ({
  className,
  ref,
  style,
  ...props
}: ScrollProgressProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    let frame: null | number = null;
    const update = (): void => {
      frame = null;
      setProgress(computeProgress());
    };
    const onScroll = (): void => {
      frame ??= requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <div
      aria-label={props["aria-labelledby"] ? undefined : "Reading progress"}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(progress)}
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-1 origin-left bg-primary",
        className,
      )}
      ref={ref}
      role="progressbar"
      style={{ width: `${progress}%`, ...style }}
      {...props}
    />
  );
};
ScrollProgress.displayName = "ScrollProgress";
