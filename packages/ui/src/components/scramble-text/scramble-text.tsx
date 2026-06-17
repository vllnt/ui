"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

/** Props for {@link ScrambleText}. */
export type ScrambleTextProps = React.ComponentPropsWithoutRef<"span"> & {
  /** Milliseconds for the full resolve. Defaults to `1200`. */
  duration?: number;
  /** Pool of glyphs used while scrambling. */
  scrambleCharacters?: string;
  /** Final resolved text. */
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

function scramble(text: string, revealed: number, pool: string): string {
  const characters = text.match(/[\s\S]/gu) ?? [];
  return characters
    .map((character, index) => {
      if (index < revealed || character === " ") {
        return character;
      }
      return pool.charAt(Math.floor(Math.random() * pool.length));
    })
    .join("");
}

const defaultPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Resolves text left-to-right out of randomized glyphs on mount.
 *
 * Respects `prefers-reduced-motion`: the final text shows at once.
 *
 * @example
 * ```tsx
 * <ScrambleText text="DECRYPTED" />
 * ```
 */
export const ScrambleText = React.forwardRef<
  HTMLSpanElement,
  ScrambleTextProps
>(
  (
    {
      className,
      duration = 1200,
      scrambleCharacters = defaultPool,
      text,
      ...props
    },
    ref,
  ) => {
    const reduced = usePrefersReducedMotion();
    const [display, setDisplay] = React.useState(text);

    React.useEffect(() => {
      if (reduced) {
        setDisplay(text);
        return;
      }

      const steps = Math.max(text.length, 1);
      const tick = duration / steps;
      let revealed = 0;
      const timer = setInterval(() => {
        revealed += 1;
        setDisplay(scramble(text, revealed, scrambleCharacters));
        if (revealed >= text.length) {
          clearInterval(timer);
        }
      }, tick);

      return () => {
        clearInterval(timer);
      };
    }, [duration, reduced, scrambleCharacters, text]);

    return (
      <span
        aria-label={text}
        className={cn("font-mono", className)}
        ref={ref}
        {...props}
      >
        <span aria-hidden="true">{display}</span>
      </span>
    );
  },
);
ScrambleText.displayName = "ScrambleText";
