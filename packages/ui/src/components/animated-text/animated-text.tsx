import * as React from "react";

import { cn } from "../../lib/utils";

const GLYPH_SEGMENTER = new Intl.Segmenter(undefined, {
  granularity: "grapheme",
});

const ASCII_RANDOM_CHARACTERS = Array.from({ length: 94 }, (_, index) =>
  String.fromCodePoint(index + 33),
).join("");
const TERMINAL_RANDOM_CHARACTERS = "│┃─━┄┅┈┉┌┐└┘├┤┬┴┼╭╮╯╰╱╲╳";
const BLOCK_RANDOM_CHARACTERS = "░▒▓█▌▐▀▄■□▪▫▖▗▘▙▚▛▜▝▞▟";
const UNICODE_SYMBOL_RANDOM_CHARACTERS = "◆◇◈○●◎◉◌◍◐◑◒◓◔◕◢◣◤◥◦※✦✧✱✶✷✹";
const MATRIX_RANDOM_CHARACTERS = `${ASCII_RANDOM_CHARACTERS}${TERMINAL_RANDOM_CHARACTERS}${BLOCK_RANDOM_CHARACTERS}${UNICODE_SYMBOL_RANDOM_CHARACTERS}`;

export const ANIMATED_TEXT_RANDOM_CHARACTER_PRESETS = {
  ascii: ASCII_RANDOM_CHARACTERS,
  binary: "01",
  blocks: BLOCK_RANDOM_CHARACTERS,
  matrix: MATRIX_RANDOM_CHARACTERS,
  symbols: UNICODE_SYMBOL_RANDOM_CHARACTERS,
  terminal: TERMINAL_RANDOM_CHARACTERS,
} as const;

const DEFAULT_RANDOM_CHARACTERS = ANIMATED_TEXT_RANDOM_CHARACTER_PRESETS.matrix;

type AnimatedTextSplit = "character" | "word";
export type AnimatedTextVariant =
  | "decipher"
  | "matrix"
  | "reveal"
  | "terminal"
  | "typewriter";
export type AnimatedTextDirection = "center-out" | "end" | "random" | "start";
export type AnimatedTextRandomCharacterPreset =
  keyof typeof ANIMATED_TEXT_RANDOM_CHARACTER_PRESETS;

type SegmentFrame = {
  content: string;
  isRevealed: boolean;
  key: string;
  style?: React.CSSProperties;
};

export type AnimatedTextProps = React.ComponentPropsWithoutRef<"p"> & {
  cursor?: boolean;
  cursorChar?: string;
  direction?: AnimatedTextDirection;
  duration?: number;
  randomCharacters?: string;
  randomCharactersPreset?: AnimatedTextRandomCharacterPreset;
  randomness?: number;
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

function getGlyphs(text: string): string[] {
  return Array.from(GLYPH_SEGMENTER.segment(text), ({ segment }) => segment);
}

function getRandomMatrixGlyph(randomCharacters: string): string {
  const glyphs = getGlyphs(randomCharacters);

  return glyphs[Math.floor(Math.random() * glyphs.length)] ?? glyphs[0] ?? "0";
}

function getResolvedRandomCharacters(
  randomCharacters: string | undefined,
  randomCharactersPreset: AnimatedTextRandomCharacterPreset,
): string {
  if (randomCharacters && randomCharacters.length > 0) {
    return randomCharacters;
  }

  return (
    ANIMATED_TEXT_RANDOM_CHARACTER_PRESETS[randomCharactersPreset] ??
    DEFAULT_RANDOM_CHARACTERS
  );
}

function getCursorToneClass(variant: AnimatedTextVariant): string {
  return variant === "matrix" || variant === "decipher"
    ? "text-primary"
    : "text-foreground";
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

function buildIndexOrder(
  direction: AnimatedTextDirection,
  length: number,
): number[] {
  if (direction === "end") {
    return Array.from({ length }, (_, index) => length - index - 1);
  }

  if (direction === "random") {
    return Array.from({ length }, (_, index) => index).sort(
      () => Math.random() - 0.5,
    );
  }

  if (direction === "center-out") {
    const center = (length - 1) / 2;

    return Array.from({ length }, (_, index) => index).sort((left, right) => {
      const leftDistance = Math.abs(left - center);
      const rightDistance = Math.abs(right - center);

      if (leftDistance === rightDistance) {
        return left - right;
      }

      return leftDistance - rightDistance;
    });
  }

  return Array.from({ length }, (_, index) => index);
}

function buildRevealPlan(
  direction: AnimatedTextDirection,
  length: number,
  randomness: number,
): number[] {
  const orderedIndices = buildIndexOrder(direction, length);
  const revealPlan = Array.from({ length }, () => 0);
  const jitterRange = Math.max(0, Math.round(randomness * 4));

  orderedIndices.forEach((segmentIndex, revealIndex) => {
    const jitter =
      jitterRange > 0 ? Math.floor(Math.random() * (jitterRange + 1)) : 0;
    revealPlan[segmentIndex] = revealIndex + jitter;
  });

  return revealPlan;
}

function useRevealProgress(active: boolean, length: number, stagger: number) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!active) {
      setProgress(length);
      return;
    }

    setProgress(0);

    const revealInterval = window.setInterval(
      () => {
        setProgress((current) => {
          if (current >= length + 4) {
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
  }, [active, length, stagger]);

  return progress;
}

function useMatrixFrame({
  active,
  progress,
  randomCharacters,
  revealPlan,
  segments,
}: {
  active: boolean;
  progress: number;
  randomCharacters: string;
  revealPlan: number[];
  segments: string[];
}) {
  const [matrixFrame, setMatrixFrame] = React.useState(() =>
    segments.map(() => getRandomMatrixGlyph(randomCharacters)),
  );

  React.useEffect(() => {
    if (!active) {
      return;
    }

    setMatrixFrame(segments.map(() => getRandomMatrixGlyph(randomCharacters)));

    const scrambleInterval = window.setInterval(() => {
      setMatrixFrame((current) =>
        current.map((glyph, index) => {
          const isWhitespace = /^\s+$/.test(segments[index] ?? "");
          const isRevealed = progress >= (revealPlan[index] ?? 0);

          if (isWhitespace || isRevealed) {
            return glyph;
          }

          return getRandomMatrixGlyph(randomCharacters);
        }),
      );
    }, 48);

    return () => {
      window.clearInterval(scrambleInterval);
    };
  }, [active, progress, randomCharacters, revealPlan, segments]);

  return matrixFrame;
}

function buildOldSchoolFrames({
  matrixFrame,
  progress,
  randomCharacters,
  revealPlan,
  segments,
  variant,
}: {
  matrixFrame: string[];
  progress: number;
  randomCharacters: string;
  revealPlan: number[];
  segments: string[];
  variant: Exclude<AnimatedTextVariant, "reveal">;
}): SegmentFrame[] {
  return segments.map((segment, index) => {
    const isWhitespace = /^\s+$/.test(segment);
    const revealStep = revealPlan[index] ?? 0;
    const isRevealed = progress >= revealStep;

    let content = "";
    if (variant === "matrix" || variant === "decipher") {
      content = isWhitespace
        ? segment
        : isRevealed
          ? segment
          : (matrixFrame[index] ?? getRandomMatrixGlyph(randomCharacters));
    } else if (isRevealed) {
      content = segment;
    }

    return {
      content,
      isRevealed,
      key: `${segment}-${index}`,
    };
  });
}

function useAnimatedTextFrames({
  direction,
  randomCharacters,
  randomness,
  segments,
  stagger,
  variant,
}: {
  direction: AnimatedTextDirection;
  randomCharacters: string;
  randomness: number;
  segments: string[];
  stagger: number;
  variant: AnimatedTextVariant;
}): SegmentFrame[] {
  const isOldSchool = variant !== "reveal";
  const revealPlan = React.useMemo(
    () =>
      isOldSchool
        ? buildRevealPlan(direction, segments.length, randomness)
        : Array.from({ length: segments.length }, (_, index) => index),
    [direction, isOldSchool, randomness, segments.length],
  );
  const progress = useRevealProgress(isOldSchool, segments.length, stagger);
  const matrixFrame = useMatrixFrame({
    active: variant === "matrix" || variant === "decipher",
    progress,
    randomCharacters,
    revealPlan,
    segments,
  });

  return React.useMemo(() => {
    if (!isOldSchool) {
      return buildRevealFrames(segments, stagger);
    }

    return buildOldSchoolFrames({
      matrixFrame,
      progress,
      randomCharacters,
      revealPlan,
      segments,
      variant,
    });
  }, [
    isOldSchool,
    matrixFrame,
    progress,
    randomCharacters,
    revealPlan,
    segments,
    stagger,
    variant,
  ]);
}

function getSegmentClasses(
  variant: AnimatedTextVariant,
  isRevealed: boolean,
): string {
  if (variant === "reveal") {
    return "inline-block whitespace-pre opacity-0 [animation-duration:var(--vllnt-animated-text-duration)] [animation-fill-mode:forwards] [animation-name:vllnt-animated-text-reveal] [animation-timing-function:cubic-bezier(0.16,1,0.3,1)]";
  }

  if (variant === "matrix" || variant === "decipher") {
    return cn(
      "inline-block whitespace-pre font-mono tracking-[0.08em] transition-colors duration-150",
      isRevealed ? "text-foreground" : "text-primary/75",
    );
  }

  return "inline-block whitespace-pre font-mono";
}

function getContainerClasses(variant: AnimatedTextVariant): string {
  if (variant === "matrix" || variant === "decipher") {
    return "flex flex-wrap font-mono leading-relaxed tracking-[0.08em]";
  }

  if (variant === "terminal" || variant === "typewriter") {
    return "flex flex-wrap font-mono leading-relaxed";
  }

  return "flex flex-wrap leading-relaxed";
}

function AnimatedTextCursor({
  cursorChar,
  cursorToneClass,
}: {
  cursorChar: string;
  cursorToneClass: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "ml-0.5 inline-block whitespace-pre font-mono [animation:vllnt-terminal-cursor-blink_1s_steps(1,end)_infinite]",
        cursorToneClass,
      )}
    >
      {cursorChar}
    </span>
  );
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
      direction = "start",
      duration = 600,
      randomCharacters,
      randomCharactersPreset = "matrix",
      randomness = 0,
      splitBy = "word",
      stagger = 70,
      text,
      variant = "terminal",
      ...props
    },
    ref,
  ) => {
    const resolvedRandomCharacters = getResolvedRandomCharacters(
      randomCharacters,
      randomCharactersPreset,
    );
    const resolvedSplitBy = variant === "reveal" ? splitBy : "character";
    const segments = React.useMemo(
      () => getSegments(text, resolvedSplitBy),
      [resolvedSplitBy, text],
    );
    const segmentFrames = useAnimatedTextFrames({
      direction,
      randomCharacters: resolvedRandomCharacters,
      randomness,
      segments,
      stagger,
      variant,
    });
    const showCursor =
      cursor &&
      variant !== "reveal" &&
      segmentFrames.some((frame) => !frame.isRevealed);
    const cursorToneClass = getCursorToneClass(variant);

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
          <AnimatedTextCursor
            cursorChar={cursorChar}
            cursorToneClass={cursorToneClass}
          />
        ) : null}
      </p>
    );
  },
);

AnimatedText.displayName = "AnimatedText";
