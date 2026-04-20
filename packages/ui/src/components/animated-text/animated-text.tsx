import * as React from "react";

import { cn } from "../../lib/utils";

const MATRIX_GLYPHS = "01<>/*+=-_[]{}#@$%";

type AnimatedTextSplit = "character" | "word";
export type AnimatedTextVariant =
  | "matrix"
  | "reveal"
  | "terminal"
  | "typewriter";

type SegmentFrame = {
  content: string;
  isRevealed: boolean;
  key: string;
  style?: React.CSSProperties;
};

export type AnimatedTextProps = React.ComponentPropsWithoutRef<"p"> & {
  cursor?: boolean;
  cursorChar?: string;
  duration?: number;
  splitBy?: AnimatedTextSplit;
  stagger?: number;
  text: string;
  variant?: AnimatedTextVariant;
};

function getSegments(text: string, splitBy: AnimatedTextSplit): string[] {
  if (splitBy === "character") {
    const segmenter = new Intl.Segmenter(undefined, {
      granularity: "grapheme",
    });

    return Array.from(segmenter.segment(text), ({ segment }) => segment);
  }

  return text.match(/\S+\s*/g) ?? [];
}

function getRandomMatrixGlyph(): string {
  return MATRIX_GLYPHS[Math.floor(Math.random() * MATRIX_GLYPHS.length)] ?? "0";
}

function buildRevealFrames(
  segments: string[],
  stagger: number,
): SegmentFrame[] {
  return segments.map((segment, index) => ({
    content: segment,
    isRevealed: true,
    key: `${segment}-${index}`,
    style: {
      animationDelay: `${index * stagger}ms`,
    },
  }));
}

function buildOldSchoolFrames({
  matrixFrame,
  revealedCount,
  segments,
  variant,
}: {
  matrixFrame: string[];
  revealedCount: number;
  segments: string[];
  variant: Exclude<AnimatedTextVariant, "reveal">;
}): SegmentFrame[] {
  return segments.map((segment, index) => {
    const isRevealed = index < revealedCount;
    const isWhitespace = /^\s+$/.test(segment);

    let content = "";
    if (variant === "matrix") {
      content = isWhitespace
        ? segment
        : isRevealed
          ? segment
          : (matrixFrame[index] ?? getRandomMatrixGlyph());
    } else if (isRevealed) {
      content = segment;
    } else if (isWhitespace) {
      content = "";
    }

    return {
      content,
      isRevealed,
      key: `${segment}-${index}`,
    };
  });
}

function useAnimatedTextFrames(
  segments: string[],
  stagger: number,
  variant: AnimatedTextVariant,
): SegmentFrame[] {
  const isOldSchool = variant !== "reveal";
  const [revealedCount, setRevealedCount] = React.useState(0);
  const [matrixFrame, setMatrixFrame] = React.useState(() =>
    segments.map(() => getRandomMatrixGlyph()),
  );

  React.useEffect(() => {
    if (!isOldSchool) {
      return;
    }

    setRevealedCount(0);
    setMatrixFrame(segments.map(() => getRandomMatrixGlyph()));

    const revealInterval = window.setInterval(
      () => {
        setRevealedCount((current) => {
          if (current >= segments.length) {
            window.clearInterval(revealInterval);
            return current;
          }

          return current + 1;
        });
      },
      Math.max(16, stagger),
    );

    return () => {
      window.clearInterval(revealInterval);
    };
  }, [isOldSchool, segments, stagger, variant]);

  React.useEffect(() => {
    if (variant !== "matrix") {
      return;
    }

    const scrambleInterval = window.setInterval(() => {
      setMatrixFrame((current) =>
        current.map((glyph, index) =>
          index < revealedCount || /^\s+$/.test(segments[index] ?? "")
            ? glyph
            : getRandomMatrixGlyph(),
        ),
      );
    }, 48);

    return () => {
      window.clearInterval(scrambleInterval);
    };
  }, [revealedCount, segments, variant]);

  return React.useMemo(() => {
    if (!isOldSchool) {
      return buildRevealFrames(segments, stagger);
    }

    return buildOldSchoolFrames({
      matrixFrame,
      revealedCount,
      segments,
      variant,
    });
  }, [isOldSchool, matrixFrame, revealedCount, segments, stagger, variant]);
}

function getSegmentClasses(
  variant: AnimatedTextVariant,
  isRevealed: boolean,
): string {
  if (variant === "reveal") {
    return "inline-block whitespace-pre opacity-0 [animation-duration:var(--vllnt-animated-text-duration)] [animation-fill-mode:forwards] [animation-name:vllnt-animated-text-reveal] [animation-timing-function:cubic-bezier(0.16,1,0.3,1)]";
  }

  if (variant === "matrix") {
    return cn(
      "inline-block whitespace-pre font-mono tracking-[0.08em] transition-colors duration-150",
      isRevealed ? "text-foreground" : "text-primary/75",
    );
  }

  return cn(
    "inline-block whitespace-pre font-mono transition-opacity duration-100",
    isRevealed ? "opacity-100" : "opacity-35",
  );
}

function getContainerClasses(variant: AnimatedTextVariant): string {
  if (variant === "matrix") {
    return "flex flex-wrap font-mono leading-relaxed tracking-[0.08em]";
  }

  if (variant === "terminal" || variant === "typewriter") {
    return "flex flex-wrap font-mono leading-relaxed";
  }

  return "flex flex-wrap leading-relaxed";
}

export const AnimatedText = React.forwardRef<
  HTMLParagraphElement,
  AnimatedTextProps
>(
  (
    {
      className,
      cursor = true,
      cursorChar = "█",
      duration = 600,
      splitBy = "word",
      stagger = 70,
      text,
      variant = "terminal",
      ...props
    },
    ref,
  ) => {
    const resolvedSplitBy = variant === "reveal" ? splitBy : "character";
    const segments = React.useMemo(
      () => getSegments(text, resolvedSplitBy),
      [resolvedSplitBy, text],
    );
    const segmentFrames = useAnimatedTextFrames(segments, stagger, variant);
    const showCursor =
      cursor &&
      variant !== "reveal" &&
      segmentFrames.some((frame) => !frame.isRevealed);
    const cursorToneClass =
      variant === "matrix" ? "text-primary" : "text-foreground";

    return (
      <p
        aria-label={text}
        className={cn(getContainerClasses(variant), className)}
        ref={ref}
        style={{
          ["--vllnt-animated-text-duration" as string]: `${duration}ms`,
        }}
        {...props}
      >
        {segmentFrames.map((segmentFrame) => (
          <span
            aria-hidden="true"
            className={getSegmentClasses(variant, segmentFrame.isRevealed)}
            key={segmentFrame.key}
            style={segmentFrame.style}
          >
            {segmentFrame.content}
          </span>
        ))}
        {showCursor ? (
          <span
            aria-hidden="true"
            className={cn(
              "ml-0.5 inline-block whitespace-pre font-mono [animation:vllnt-terminal-cursor-blink_1s_steps(1,end)_infinite]",
              cursorToneClass,
            )}
          >
            {cursorChar}
          </span>
        ) : null}
      </p>
    );
  },
);

AnimatedText.displayName = "AnimatedText";
