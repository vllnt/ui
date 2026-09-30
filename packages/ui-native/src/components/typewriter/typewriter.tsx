"use client";

import { type Ref, useEffect, useState } from "react";

import {
  Text as NativeText,
  type Text as NativeTextInstance,
  type TextProps,
} from "react-native";

import { typeStyle } from "../../primitives/type-style";
import {
  type ReducedMotionService,
  useReducedMotion,
} from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";

/** Props for deterministic native typewriter text. */
export type TypewriterProps = Omit<TextProps, "children"> & {
  readonly cursor?: false | string;
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<NativeTextInstance>;
  readonly speed?: number;
  readonly text: string;
};

/** Splits by code point, not grapheme: Hermes has no `Intl.Segmenter`. */
function splitCharacters(value: string): readonly string[] {
  return value.match(/./gsu) ?? [];
}

function useTypedCount(
  reduceMotion: boolean,
  speed: number,
  text: string,
): number {
  const length = splitCharacters(text).length;
  const [state, setState] = useState({
    count: length,
    reduceMotion,
    text,
  });
  if (state.reduceMotion !== reduceMotion || state.text !== text) {
    setState({ count: reduceMotion ? length : 0, reduceMotion, text });
  }
  const current = state.reduceMotion === reduceMotion && state.text === text;
  const count = current ? state.count : reduceMotion ? length : 0;
  useEffect(() => {
    if (reduceMotion || count >= length) return;
    const timer = setTimeout(
      () => {
        setState((value) => ({ ...value, count: value.count + 1 }));
      },
      Math.max(1, speed),
    );
    return () => {
      clearTimeout(timer);
    };
  }, [count, length, reduceMotion, speed]);
  return count;
}

/**
 * Types characters on a fixed interval and exposes the complete accessible text.
 * Characters are Unicode code points (`Array.from`), so surrogate pairs are never split.
 */
function Typewriter({
  accessibilityLabel,
  cursor = "|",
  reducedMotionService,
  ref,
  speed = 60,
  style,
  text,
  ...props
}: TypewriterProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion(reducedMotionService);
  const characters = splitCharacters(text);
  const count = useTypedCount(reduceMotion, speed, text);
  const typing = !reduceMotion && count < characters.length;
  return (
    <NativeText
      {...props}
      accessibilityLabel={accessibilityLabel ?? text}
      ref={ref}
      style={[...typeStyle(theme, "bodySmall", "foreground"), style]}
    >
      {reduceMotion ? text : characters.slice(0, count).join("")}
      {cursor !== false && typing ? (
        <NativeText
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ color: theme.colors.mutedForeground }}
        >
          {cursor}
        </NativeText>
      ) : null}
    </NativeText>
  );
}
Typewriter.displayName = "Typewriter";

export { Typewriter };
