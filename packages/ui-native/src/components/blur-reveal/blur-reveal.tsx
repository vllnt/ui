"use client";

import { type ReactNode, type Ref, useEffect, useState } from "react";

import { Animated, Easing, type View, type ViewProps } from "react-native";

import {
  type ReducedMotionService,
  useReducedMotion,
} from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";

/** Props for a native opacity reveal. React Native core has no portable view blur. */
export type BlurRevealProps = Omit<ViewProps, "children"> & {
  readonly children: ReactNode;
  readonly delay?: number;
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<View>;
  readonly visible?: boolean;
};

/** Reveals native content with the portable opacity from the web effect. */
function BlurReveal({
  children,
  delay = 0,
  pointerEvents,
  reducedMotionService,
  ref,
  style,
  visible = true,
  ...props
}: BlurRevealProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion(reducedMotionService);
  const [progress, setProgress] = useState(
    () => new Animated.Value(visible ? 1 : 0),
  );
  void setProgress;

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(visible ? 1 : 0);
      return;
    }
    const animation = Animated.timing(progress, {
      delay: visible ? Math.max(0, delay) : 0,
      duration: theme.motion.duration.slow,
      easing: Easing.out(Easing.cubic),
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
    });
    animation.start();
    return () => {
      animation.stop();
    };
  }, [delay, progress, reduceMotion, theme.motion.duration.slow, visible]);

  return (
    <Animated.View
      {...props}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? "auto" : "no-hide-descendants"}
      pointerEvents={visible ? pointerEvents : "none"}
      ref={ref}
      style={[{ opacity: progress }, style]}
    >
      {children}
    </Animated.View>
  );
}
BlurReveal.displayName = "BlurReveal";

export { BlurReveal };
