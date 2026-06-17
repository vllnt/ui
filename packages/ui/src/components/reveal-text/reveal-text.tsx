"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

/** Slide-in origin for the reveal. */
export type RevealDirection = "down" | "left" | "right" | "up";

/** Props for {@link RevealText}. */
export type RevealTextProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Content slid into view behind a clipping mask. */
  children: React.ReactNode;
  /** Milliseconds before the reveal starts. Defaults to `0`. */
  delay?: number;
  /** Origin the content slides from. Defaults to `"up"`. */
  direction?: RevealDirection;
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

function useInView(nodeRef: React.RefObject<HTMLDivElement | null>): boolean {
  const [inView, setInView] = React.useState(
    () => typeof IntersectionObserver !== "function",
  );

  React.useEffect(() => {
    const node = nodeRef.current;
    if (!node || typeof IntersectionObserver !== "function") {
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setInView(true);
        observer.disconnect();
      }
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [nodeRef]);

  return inView;
}

const hiddenTransforms: Record<RevealDirection, string> = {
  down: "-translate-y-full",
  left: "translate-x-full",
  right: "-translate-x-full",
  up: "translate-y-full",
};

/**
 * Slides content into view from one edge behind a clipping mask, once.
 *
 * Respects `prefers-reduced-motion`: the content shows in place.
 *
 * @example
 * ```tsx
 * <RevealText direction="up">Headline</RevealText>
 * ```
 */
export const RevealText = ({
  children,
  className,
  delay = 0,
  direction = "up",
  ref,
  ...props
}: RevealTextProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const reduced = usePrefersReducedMotion();
  const nodeRef = React.useRef<HTMLDivElement>(null);
  const inView = useInView(nodeRef);
  const visible = reduced || inView;

  return (
    <div
      className={cn("overflow-hidden", className)}
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
      <div
        className={cn(
          "transition-[transform,opacity] duration-700 ease-out motion-reduce:transition-none",
          visible
            ? "translate-x-0 translate-y-0 opacity-100"
            : cn("opacity-0", hiddenTransforms[direction]),
        )}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {children}
      </div>
    </div>
  );
};
RevealText.displayName = "RevealText";
