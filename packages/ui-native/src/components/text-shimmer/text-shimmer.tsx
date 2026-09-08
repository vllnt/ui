"use client";

import { type Ref, useEffect, useState } from "react";

import {
  Animated,
  Easing,
  type Text as NativeTextInstance,
  type TextProps,
} from "react-native";

import {
  type ReducedMotionService,
  useReducedMotion,
} from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";

/** Props for native text that cycles between semantic foreground tones. */
export type TextShimmerProps = Omit<TextProps, "children"> & {
  readonly children: string;
  readonly duration?: number;
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<NativeTextInstance>;
};

/** Provides a dependency-free color cycle in place of web gradient clipping. */
function TextShimmer({
  children,
  duration = 2000,
  reducedMotionService,
  ref,
  style,
  ...props
}: TextShimmerProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion(reducedMotionService);
  const [progress, setProgress] = useState(() => new Animated.Value(0));
  void setProgress;

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          duration: Math.max(theme.motion.duration.base, duration / 2),
          easing: Easing.inOut(Easing.cubic),
          toValue: 1,
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          duration: Math.max(theme.motion.duration.base, duration / 2),
          easing: Easing.inOut(Easing.cubic),
          toValue: 0,
          useNativeDriver: false,
        }),
      ]),
    );
    animation.start();
    return () => {
      animation.stop();
    };
  }, [duration, progress, reduceMotion, theme.motion.duration.base]);

  return (
    <Animated.Text
      {...props}
      ref={ref}
      style={[
        theme.typography.scale.bodySmall,
        {
          color: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [
              theme.colors.mutedForeground,
              theme.colors.foreground,
            ],
          }),
        },
        style,
      ]}
    >
      {children}
    </Animated.Text>
  );
}
TextShimmer.displayName = "TextShimmer";

export { TextShimmer };
