"use client";

import {
  type ComponentRef,
  type Ref,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Animated,
  StyleSheet,
  Text as NativeText,
  type TextProps,
} from "react-native";

import type { ReducedMotionService } from "../../primitives/use-reduced-motion";
import { useReducedMotion } from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";

/** Native text reveal treatments. Scrambling variants use deterministic reveals. */
export type AnimatedTextVariant =
  | "decipher"
  | "matrix"
  | "reveal"
  | "terminal"
  | "typewriter";
/** Order in which native text segments become visible. */
export type AnimatedTextDirection = "center-out" | "end" | "random" | "start";
/** Native text segmentation mode. */
export type AnimatedTextSplit = "character" | "word";

/** Props for deterministic, reduced-motion-aware native animated text. */
export type AnimatedTextProps = Omit<TextProps, "children"> & {
  readonly cursor?: boolean;
  readonly cursorChar?: string;
  readonly direction?: AnimatedTextDirection;
  readonly duration?: number;
  readonly onAnimationComplete?: () => void;
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<ComponentRef<typeof NativeText>>;
  readonly splitBy?: AnimatedTextSplit;
  readonly stagger?: number;
  readonly text: string;
  readonly variant?: AnimatedTextVariant;
};

const styles = StyleSheet.create({
  segment: { opacity: 0 },
});
const glyphSegmenter = new Intl.Segmenter(undefined, {
  granularity: "grapheme",
});

function getSegments(text: string, splitBy: AnimatedTextSplit): string[] {
  if (splitBy === "word") return text.match(/\S+\s*/g) ?? [];
  return Array.from(glyphSegmenter.segment(text), ({ segment }) => segment);
}

function getDeterministicRank(segment: string, index: number): number {
  return [...glyphSegmenter.segment(segment)].reduce(
    (rank, { segment: glyph }) => rank * 31 + (glyph.codePointAt(0) ?? 0),
    index + 17,
  );
}

function getRevealOrder(
  direction: AnimatedTextDirection,
  segments: readonly string[],
): number[] {
  const indices = segments.map((_, index) => index);
  if (direction === "end") return indices.reverse();
  if (direction === "center-out") {
    const center = (segments.length - 1) / 2;
    return indices.sort((left, right) => {
      const distance = Math.abs(left - center) - Math.abs(right - center);
      return distance === 0 ? left - right : distance;
    });
  }
  if (direction === "random") {
    return indices.sort((left, right) => {
      const rank =
        getDeterministicRank(segments[left] ?? "", left) -
        getDeterministicRank(segments[right] ?? "", right);
      return rank === 0 ? left - right : rank;
    });
  }
  return indices;
}

function getCursorTone(
  variant: AnimatedTextVariant,
  colors: { readonly foreground: string; readonly primary: string },
): string {
  return variant === "matrix" || variant === "decipher"
    ? colors.primary
    : colors.foreground;
}

function getRevealRanks(
  direction: AnimatedTextDirection,
  segments: readonly string[],
): number[] {
  const ranks = segments.map(() => 0);
  getRevealOrder(direction, segments).forEach((segmentIndex, rank) => {
    ranks[segmentIndex] = rank;
  });
  return ranks;
}

function useTextAnimation({
  duration,
  onComplete,
  ranks,
  reduceMotion,
  stagger,
  values,
}: {
  readonly duration: number;
  readonly onComplete?: () => void;
  readonly ranks: readonly number[];
  readonly reduceMotion: boolean;
  readonly stagger: number;
  readonly values: readonly Animated.Value[];
}): boolean {
  const [completedValues, setCompletedValues] = useState<
    readonly Animated.Value[]
  >([]);
  useEffect(() => {
    if (reduceMotion || values.length === 0) {
      values.forEach((value) => {
        value.stopAnimation();
        value.setValue(1);
      });
      return;
    }
    values.forEach((value) => {
      value.setValue(0);
    });
    const animation = Animated.parallel(
      values.map((value, index) =>
        Animated.sequence([
          Animated.delay(Math.max(0, ranks[index] ?? 0) * Math.max(0, stagger)),
          Animated.timing(value, {
            duration: Math.max(0, duration),
            toValue: 1,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    animation.start(({ finished }) => {
      if (finished) {
        setCompletedValues(values);
        onComplete?.();
      }
    });
    return () => {
      animation.stop();
    };
  }, [duration, onComplete, ranks, reduceMotion, stagger, values]);
  return reduceMotion || completedValues === values;
}

function AnimatedTextSegment({
  color,
  segment,
  value,
}: {
  readonly color: string;
  readonly segment: string;
  readonly value: Animated.Value;
}) {
  return (
    <Animated.Text
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.segment,
        {
          color,
          opacity: value,
          transform: [
            {
              translateY: value.interpolate({
                inputRange: [0, 1],
                outputRange: [4, 0],
              }),
            },
          ],
        },
      ]}
    >
      {segment}
    </Animated.Text>
  );
}
AnimatedTextSegment.displayName = "AnimatedTextSegment";

function AnimatedTextCursor({
  cursorChar,
  tone,
}: {
  readonly cursorChar: string;
  readonly tone: string;
}) {
  return (
    <NativeText
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ color: tone }}
    >
      {cursorChar}
    </NativeText>
  );
}
AnimatedTextCursor.displayName = "AnimatedTextCursor";

/**
 * Staggered native text reveal using RN Animated. Matrix and decipher avoid
 * nondeterministic glyph churn and reveal the final text in a stable order.
 */
function AnimatedText({
  accessibilityLabel,
  cursor = true,
  cursorChar = "█",
  direction = "start",
  duration,
  onAnimationComplete,
  reducedMotionService,
  ref,
  splitBy = "word",
  stagger = 70,
  style,
  text,
  variant = "terminal",
  ...props
}: AnimatedTextProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion(reducedMotionService);
  const resolvedSplit = variant === "reveal" ? splitBy : "character";
  const segments = useMemo(
    () => getSegments(text, resolvedSplit),
    [resolvedSplit, text],
  );
  const revealRanks = useMemo(
    () => getRevealRanks(direction, segments),
    [direction, segments],
  );
  const segmentValues = useMemo(
    () => segments.map(() => new Animated.Value(1)),
    [segments],
  );
  const complete = useTextAnimation({
    duration: duration ?? theme.motion.duration.base,
    onComplete: onAnimationComplete,
    ranks: revealRanks,
    reduceMotion,
    stagger,
    values: segmentValues,
  });

  return (
    <NativeText
      {...props}
      accessibilityLabel={accessibilityLabel ?? text}
      accessible
      ref={ref}
      style={[{ color: theme.colors.foreground }, style]}
    >
      {segments.map((segment, index) => {
        const value = segmentValues[index];
        return value ? (
          <AnimatedTextSegment
            color={theme.colors.foreground}
            key={`${segment}-${index}`}
            segment={segment}
            value={value}
          />
        ) : null;
      })}
      {cursor && !complete ? (
        <AnimatedTextCursor
          cursorChar={cursorChar}
          tone={getCursorTone(variant, theme.colors)}
        />
      ) : null}
    </NativeText>
  );
}
AnimatedText.displayName = "AnimatedText";

export { AnimatedText };
