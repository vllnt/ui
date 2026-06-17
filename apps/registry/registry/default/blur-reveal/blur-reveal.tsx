"use client";

import * as React from "react";

import { cn } from "@vllnt/ui";

/** Props for {@link BlurReveal}. */
export type BlurRevealProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Delay in milliseconds before the reveal begins. Defaults to `0`. */
  delay?: number;
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

function useInView(): [React.RefObject<HTMLDivElement | null>, boolean] {
  const elementRef = React.useRef<HTMLDivElement>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof IntersectionObserver !== "function") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return [elementRef, inView];
}

/**
 * Reveals content from a blurred, transparent state when it scrolls into view.
 *
 * Respects `prefers-reduced-motion`: content is visible from the start.
 *
 * @example
 * ```tsx
 * <BlurReveal delay={150}>Content</BlurReveal>
 * ```
 */
export const BlurReveal = React.forwardRef<HTMLDivElement, BlurRevealProps>(
  ({ children, className, delay = 0, style, ...props }, ref) => {
    const reduced = usePrefersReducedMotion();
    const [elementRef, inView] = useInView();
    const revealed = reduced || inView;
    const setReferences = (node: HTMLDivElement | null): void => {
      elementRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    return (
      <div
        className={cn(
          "transition-all duration-700",
          revealed
            ? "opacity-100 [filter:blur(0)]"
            : "opacity-0 [filter:blur(12px)]",
          className,
        )}
        ref={setReferences}
        style={{ transitionDelay: `${delay}ms`, ...style }}
        {...props}
      >
        {children}
      </div>
    );
  },
);
BlurReveal.displayName = "BlurReveal";
