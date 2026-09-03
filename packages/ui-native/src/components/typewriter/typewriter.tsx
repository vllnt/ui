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

/** Props for deterministic native typewriter text. */
export type TypewriterProps = Omit<TextProps, "children"> & {
  readonly cursor?: false | string;
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<NativeTextInstance>;
  readonly speed?: number;
  readonly text: string;
};

function useTypedCount(
  reduceMotion: boolean,
  speed: number,
  text: string,
): number {
  const [state, setState] = useState({
    count: text.length,
    reduceMotion,
    text,
  });
  if (state.reduceMotion !== reduceMotion || state.text !== text) {
    setState({ count: reduceMotion ? text.length : 0, reduceMotion, text });
  }
  useEffect(() => {
    if (reduceMotion || text.length === 0) return;
    const timer = setInterval(
      () => {
        setState((current) =>
          current.count >= text.length
            ? current
            : { ...current, count: current.count + 1 },
        );
      },
      Math.max(1, speed),
    );
    return () => {
      clearInterval(timer);
    };
  }, [reduceMotion, speed, text]);
  const current = state.reduceMotion === reduceMotion && state.text === text;
  return current ? state.count : reduceMotion ? text.length : 0;
}

/** Types characters on a fixed interval and exposes the complete accessible text. */
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
  const count = useTypedCount(reduceMotion, speed, text);
  const typing = !reduceMotion && count < text.length;
  return (
    <NativeText
      {...props}
      accessibilityLabel={accessibilityLabel ?? text}
      ref={ref}
      style={[
        theme.typography.scale.bodySmall,
        { color: theme.colors.foreground },
        style,
      ]}
    >
      {reduceMotion ? text : text.slice(0, count)}
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
