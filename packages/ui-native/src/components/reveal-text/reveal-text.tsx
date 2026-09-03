"use client";

import { type ReactNode, type Ref, useEffect, useState } from "react";

import {
  Animated,
  Easing,
  StyleSheet,
  type View,
  type ViewProps,
} from "react-native";

import {
  type ReducedMotionService,
  useReducedMotion,
} from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";

/** Native slide-in origin. */
export type RevealDirection = "down" | "left" | "right" | "up";

/** Props for an explicitly controlled native reveal. */
export type RevealTextProps = Omit<ViewProps, "children"> & {
  readonly children: ReactNode;
  readonly delay?: number;
  readonly direction?: RevealDirection;
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<View>;
  readonly visible?: boolean;
};

const styles = StyleSheet.create({ root: { overflow: "hidden" } });

function directionOffset(direction: RevealDirection, distance: number) {
  switch (direction) {
    case "down":
      return { x: 0, y: -distance };
    case "left":
      return { x: distance, y: 0 };
    case "right":
      return { x: -distance, y: 0 };
    case "up":
      return { x: 0, y: distance };
  }
}

/** Slides content when `visible` changes; viewport detection stays with the host. */
function RevealText({
  children,
  delay = 0,
  direction = "up",
  reducedMotionService,
  ref,
  style,
  visible = true,
  ...props
}: RevealTextProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion(reducedMotionService);
  const [progress, setProgress] = useState(
    () => new Animated.Value(visible ? 1 : 0),
  );
  void setProgress;
  const offset = directionOffset(direction, theme.spacing[2]);

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
      ref={ref}
      style={[
        styles.root,
        {
          opacity: progress,
          transform: [
            {
              translateX: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [offset.x, 0],
              }),
            },
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [offset.y, 0],
              }),
            },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
RevealText.displayName = "RevealText";

export { RevealText };
