import * as React from "react";

import { cn } from "../../lib/utils";

export type AnimatedTextProps = React.ComponentPropsWithoutRef<"p"> & {
  duration?: number;
  splitBy?: "character" | "word";
  stagger?: number;
  text: string;
};

function getSegments(text: string, splitBy: "character" | "word"): string[] {
  if (splitBy === "character") {
    const segmenter = new Intl.Segmenter(undefined, {
      granularity: "grapheme",
    });

    return Array.from(segmenter.segment(text), ({ segment }) => segment);
  }

  return text.match(/\S+\s*/g) ?? [];
}

export const AnimatedText = React.forwardRef<
  HTMLParagraphElement,
  AnimatedTextProps
>(
  (
    {
      className,
      duration = 600,
      splitBy = "word",
      stagger = 70,
      text,
      ...props
    },
    ref,
  ) => {
    const segments = getSegments(text, splitBy);

    return (
      <p
        aria-label={text}
        className={cn("flex flex-wrap leading-relaxed", className)}
        ref={ref}
        {...props}
      >
        {segments.map((segment, index) => (
          <span
            aria-hidden="true"
            className="inline-block whitespace-pre opacity-0"
            key={`${segment}-${index}`}
            style={{
              animationDelay: `${index * stagger}ms`,
              animationDuration: `${duration}ms`,
              animationFillMode: "forwards",
              animationName: "vllnt-animated-text-reveal",
              animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {segment}
          </span>
        ))}
      </p>
    );
  },
);

AnimatedText.displayName = "AnimatedText";
