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

/** Props for deterministic native scrambled text. */
export type ScrambleTextProps = Omit<TextProps, "children"> & {
  readonly duration?: number;
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<NativeTextInstance>;
  readonly scrambleCharacters?: string;
  readonly text: string;
};

const defaultPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** Splits by code point, not grapheme: Hermes has no `Intl.Segmenter`. */
function splitCharacters(value: string): readonly string[] {
  return value.match(/./gsu) ?? [];
}

function scramble(text: string, revealed: number, pool: string): string {
  const poolCharacters = splitCharacters(pool);
  if (poolCharacters.length === 0) return text;
  return splitCharacters(text)
    .map((character, index) => {
      if (index < revealed || character.trim().length === 0) return character;
      return poolCharacters[
        (index * 17 + revealed * 13) % poolCharacters.length
      ];
    })
    .join("");
}

function useRevealCount({
  duration,
  pool,
  reduceMotion,
  text,
}: {
  readonly duration: number;
  readonly pool: string;
  readonly reduceMotion: boolean;
  readonly text: string;
}): number {
  const length = splitCharacters(text).length;
  const [state, setState] = useState({
    pool,
    reduceMotion,
    revealed: length,
    text,
  });
  if (
    state.pool !== pool ||
    state.reduceMotion !== reduceMotion ||
    state.text !== text
  ) {
    setState({
      pool,
      reduceMotion,
      revealed: reduceMotion || pool.length === 0 ? length : 0,
      text,
    });
  }
  const current =
    state.pool === pool &&
    state.reduceMotion === reduceMotion &&
    state.text === text;
  const revealed = current ? state.revealed : reduceMotion ? length : 0;
  useEffect(() => {
    if (
      reduceMotion ||
      revealed >= length ||
      length === 0 ||
      pool.length === 0
    ) {
      return;
    }
    const timer = setTimeout(
      () => {
        setState((value) => ({ ...value, revealed: value.revealed + 1 }));
      },
      Math.max(1, Math.floor(duration / length)),
    );
    return () => {
      clearTimeout(timer);
    };
  }, [duration, length, pool.length, reduceMotion, revealed]);
  return revealed;
}

/**
 * Resolves a deterministic glyph sequence without randomness or browser APIs.
 * Reveal steps and timing count Unicode code points (`Array.from`), matching Typewriter.
 */
function ScrambleText({
  accessibilityLabel,
  duration = 1200,
  reducedMotionService,
  ref,
  scrambleCharacters = defaultPool,
  style,
  text,
  ...props
}: ScrambleTextProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion(reducedMotionService);
  const revealed = useRevealCount({
    duration,
    pool: scrambleCharacters,
    reduceMotion,
    text,
  });
  return (
    <NativeText
      {...props}
      accessibilityLabel={accessibilityLabel ?? text}
      ref={ref}
      style={[
        ...typeStyle(theme, "bodySmall", {
          color: "foreground",
          fontFamily: "monospace",
        }),
        style,
      ]}
    >
      {reduceMotion ? text : scramble(text, revealed, scrambleCharacters)}
    </NativeText>
  );
}
ScrambleText.displayName = "ScrambleText";

export { ScrambleText };
