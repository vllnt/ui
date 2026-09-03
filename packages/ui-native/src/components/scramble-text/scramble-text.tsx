"use client";

import { type Ref, useEffect, useState } from "react";

import {
  Text as NativeText,
  type Text as NativeTextInstance,
  type TextProps,
} from "react-native";

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

function splitCharacters(value: string): readonly string[] {
  return value.match(/[\s\S]/gu) ?? [];
}

function scramble(text: string, revealed: number, pool: string): string {
  if (pool.length === 0) return text;
  return splitCharacters(text)
    .map((character, index) => {
      if (index < revealed || character.trim().length === 0) return character;
      return pool.charAt((index * 17 + revealed * 13) % pool.length);
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
  const [state, setState] = useState({
    pool,
    reduceMotion,
    revealed: text.length,
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
      revealed: reduceMotion || pool.length === 0 ? text.length : 0,
      text,
    });
  }
  useEffect(() => {
    if (reduceMotion || text.length === 0 || pool.length === 0) return;
    const timer = setInterval(
      () => {
        setState((current) =>
          current.revealed >= text.length
            ? current
            : { ...current, revealed: current.revealed + 1 },
        );
      },
      Math.max(1, Math.floor(duration / text.length)),
    );
    return () => {
      clearInterval(timer);
    };
  }, [duration, pool, reduceMotion, text]);
  const current =
    state.pool === pool &&
    state.reduceMotion === reduceMotion &&
    state.text === text;
  return current ? state.revealed : reduceMotion ? text.length : 0;
}

/** Resolves a deterministic glyph sequence without randomness or browser APIs. */
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
        theme.typography.scale.bodySmall,
        {
          color: theme.colors.foreground,
          fontFamily: "monospace",
        },
        style,
      ]}
    >
      {reduceMotion ? text : scramble(text, revealed, scrambleCharacters)}
    </NativeText>
  );
}
ScrambleText.displayName = "ScrambleText";

export { ScrambleText };
