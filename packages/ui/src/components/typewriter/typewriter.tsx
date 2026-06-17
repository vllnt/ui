"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

/** Props for {@link Typewriter}. */
export type TypewriterProps = React.ComponentPropsWithoutRef<"span"> & {
  /** Show a blinking cursor while typing. Defaults to `true`. */
  cursor?: boolean;
  /** Milliseconds between characters. Defaults to `60`. */
  speed?: number;
  /** Text typed out character-by-character. */
  text: string;
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

/**
 * Types out text one character at a time with a blinking terminal cursor.
 *
 * Respects `prefers-reduced-motion`: the full text shows at once.
 *
 * @example
 * ```tsx
 * <Typewriter text="Hello, world" />
 * ```
 */
export const Typewriter = ({
  className,
  cursor = true,
  ref,
  speed = 60,
  text,
  ...props
}: TypewriterProps & { ref?: React.Ref<HTMLSpanElement> }) => {
  const reduced = usePrefersReducedMotion();
  const [count, setCount] = React.useState(() => (reduced ? text.length : 0));
  const [animationKey, setAnimationKey] = React.useState({ reduced, text });

  if (animationKey.reduced !== reduced || animationKey.text !== text) {
    setAnimationKey({ reduced, text });
    setCount(reduced ? text.length : 0);
  }

  React.useEffect(() => {
    if (reduced) {
      return;
    }

    const timer = setInterval(() => {
      setCount((current) => {
        if (current >= text.length) {
          clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, speed);

    return () => {
      clearInterval(timer);
    };
  }, [reduced, speed, text]);

  const typing = count < text.length;

  return (
    <span aria-label={text} className={cn(className)} ref={ref} {...props}>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      {cursor && typing ? (
        <span
          aria-hidden="true"
          className="ml-0.5 inline-block w-[1ch] [animation:vllnt-terminal-cursor-blink_1s_steps(1,end)_infinite] motion-reduce:animate-none"
        >
          |
        </span>
      ) : undefined}
    </span>
  );
};
Typewriter.displayName = "Typewriter";
