"use client";

import * as React from "react";

import { cn } from "@vllnt/ui";

/** Props for {@link TextReveal}. */
export type TextRevealProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Text whose words brighten as the block scrolls through the viewport. */
  children: string;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (): void => {
      setReduced(query.matches);
    };

    onChange();
    query.addEventListener("change", onChange);

    return () => {
      query.removeEventListener("change", onChange);
    };
  }, []);

  return reduced;
}

function clamp(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function useScrollProgress(
  nodeRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
): number {
  const [progress, setProgress] = React.useState(enabled ? 0 : 1);

  React.useEffect(() => {
    const node = nodeRef.current;
    if (!enabled || !node || typeof window === "undefined") {
      setProgress(1);
      return;
    }
    const onScroll = (): void => {
      const bounds = node.getBoundingClientRect();
      const span = bounds.height + window.innerHeight;
      setProgress(clamp((window.innerHeight - bounds.top) / span));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [enabled, nodeRef]);

  return progress;
}

function wordOpacity(progress: number, total: number, index: number): number {
  return Math.min(Math.max(progress * total - index, 0.2), 1);
}

/**
 * Brightens each word in turn as the block scrolls through the viewport.
 *
 * Respects `prefers-reduced-motion`: every word stays full opacity.
 *
 * @example
 * ```tsx
 * <TextReveal>Scroll to read this line word by word</TextReveal>
 * ```
 */
export const TextReveal = ({
  children,
  className,
  ref,
  ...props
}: TextRevealProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const reduced = usePrefersReducedMotion();
  const nodeRef = React.useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(nodeRef, !reduced);
  const words = children.split(" ");

  return (
    <div
      aria-label={children}
      className={cn("flex flex-wrap gap-x-[0.25em]", className)}
      ref={(node) => {
        nodeRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      {...props}
    >
      {words.map((word, index) => (
        <span
          aria-hidden="true"
          className="text-foreground transition-opacity duration-300"
          key={`${word}-${index}`}
          style={{ opacity: wordOpacity(progress, words.length, index) }}
        >
          {word}
        </span>
      ))}
    </div>
  );
};
TextReveal.displayName = "TextReveal";
