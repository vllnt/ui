"use client";

import { type Ref, useEffect, useState } from "react";

import {
  Animated,
  Easing,
  type Text as NativeTextInstance,
  type TextProps,
} from "react-native";

import { useTheme } from "../theme/theme-provider";

import {
  type ReducedMotionService,
  useReducedMotion,
} from "./use-reduced-motion";

/** Resolved props shared by the native color-cycling shimmer texts. */
type ColorShimmerTextProps = Omit<TextProps, "children"> & {
  readonly children: string;
  readonly duration: number;
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<NativeTextInstance>;
};

/**
 * Renders body-small text whose color loops between muted and foreground
 * tones, resting at `restProgress` (0 = muted, 1 = foreground) when motion is
 * reduced.
 */
function useColorShimmerText(
  {
    children,
    duration,
    reducedMotionService,
    ref,
    style,
    ...props
  }: ColorShimmerTextProps,
  restProgress: 0 | 1,
) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion(reducedMotionService);
  const [progress, setProgress] = useState(() => new Animated.Value(0));
  void setProgress;

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(restProgress);
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
  }, [
    duration,
    progress,
    reduceMotion,
    restProgress,
    theme.motion.duration.base,
  ]);

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

export { useColorShimmerText };
