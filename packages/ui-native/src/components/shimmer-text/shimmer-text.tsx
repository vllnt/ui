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

/** Props for a native semantic-color shimmer fallback. */
export type ShimmerTextProps = Omit<TextProps, "children"> & {
  readonly children: string;
  readonly duration?: number;
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<NativeTextInstance>;
};

/** Cycles semantic text color; a sweeping gradient requires an injected renderer. */
function ShimmerText({
  children,
  duration = 3000,
  reducedMotionService,
  ref,
  style,
  ...props
}: ShimmerTextProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion(reducedMotionService);
  const [progress, setProgress] = useState(() => new Animated.Value(0));
  void setProgress;

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(0);
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
ShimmerText.displayName = "ShimmerText";

export { ShimmerText };
