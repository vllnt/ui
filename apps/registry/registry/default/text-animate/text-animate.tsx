"use client";

import * as React from "react";

import { cn } from "@vllnt/ui";

/** Per-segment entrance animation. */
export type TextAnimateAnimation = "blur" | "fade" | "slide-up";

/** Props for {@link TextAnimate}. */
export type TextAnimateProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Entrance style. Defaults to `"fade"`. */
  animation?: TextAnimateAnimation;
  /** Split granularity. Defaults to `"word"`. */
  by?: "character" | "word";
  /** Text split into animated segments. */
  children: string;
  /** Milliseconds of stagger between segments. Defaults to `60`. */
  delay?: number;
  /** Wait until scrolled into view before animating. Defaults to `true`. */
  startOnView?: boolean;
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

function splitText(text: string, by: "character" | "word"): string[] {
  if (by === "character") {
    return text.match(/[\s\S]/gu) ?? [];
  }
  return text.split(/(\s+)/).filter((segment) => segment.length > 0);
}

function useInView(
  enabled: boolean,
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const nodeRef = React.useRef<HTMLDivElement>(null);
  const [inView, setInView] = React.useState(!enabled);

  React.useEffect(() => {
    const node = nodeRef.current;
    if (!enabled || !node || typeof IntersectionObserver !== "function") {
      setInView(true);
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
  }, [enabled]);

  return [nodeRef, inView];
}

function assignRef(
  ref: React.Ref<HTMLDivElement> | undefined,
  node: HTMLDivElement | null,
): void {
  if (typeof ref === "function") {
    ref(node);
  } else if (ref) {
    ref.current = node;
  }
}

const animationClasses: Record<TextAnimateAnimation, string> = {
  blur: "[filter:blur(6px)] opacity-0",
  fade: "animate-in fade-in-0",
  "slide-up": "animate-in fade-in-0 slide-in-from-bottom-2",
};

function Segment({
  animation,
  delay,
  index,
  inView,
  value,
}: {
  animation: TextAnimateAnimation;
  delay: number;
  index: number;
  inView: boolean;
  value: string;
}) {
  const blur = animation === "blur";
  return (
    <span
      className={cn(
        "inline-block whitespace-pre",
        blur
          ? cn(
              "transition-[filter,opacity] duration-500",
              inView ? "opacity-100 [filter:blur(0)]" : animationClasses.blur,
            )
          : inView && cn("fill-mode-both", animationClasses[animation]),
      )}
      style={{ animationDelay: `${index * delay}ms` }}
    >
      {value}
    </span>
  );
}

/**
 * Reveals text segment-by-segment with a staggered entrance.
 *
 * Respects `prefers-reduced-motion`: the text shows at once.
 *
 * @example
 * ```tsx
 * <TextAnimate animation="slide-up">Welcome aboard</TextAnimate>
 * ```
 */
export const TextAnimate = React.forwardRef<HTMLDivElement, TextAnimateProps>(
  (
    {
      animation = "fade",
      by = "word",
      children,
      className,
      delay = 60,
      startOnView = true,
      ...props
    },
    ref,
  ) => {
    const reduced = usePrefersReducedMotion();
    const [nodeRef, inView] = useInView(startOnView);
    const segments = splitText(children, by);
    const visible = reduced || inView;

    return (
      <div
        className={cn(className)}
        ref={(node) => {
          nodeRef.current = node;
          assignRef(ref, node);
        }}
        {...props}
      >
        <span aria-hidden="true">
          {segments.map((value, index) => (
            <Segment
              animation={reduced ? "fade" : animation}
              delay={reduced ? 0 : delay}
              index={index}
              inView={visible}
              key={`${value}-${index}`}
              value={value}
            />
          ))}
        </span>
        <span className="sr-only">{children}</span>
      </div>
    );
  },
);
TextAnimate.displayName = "TextAnimate";
