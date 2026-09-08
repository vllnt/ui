"use client";

import { type Ref, useEffect, useMemo, useState } from "react";

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

/** Portable native entrance styles. Blur falls back to opacity. */
export type TextAnimateAnimation = "blur" | "fade" | "slide-up";

/** Props for explicitly controlled staggered native text. */
export type TextAnimateProps = Omit<ViewProps, "children"> & {
  readonly animation?: TextAnimateAnimation;
  readonly by?: "character" | "word";
  readonly children: string;
  readonly delay?: number;
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<View>;
  readonly visible?: boolean;
};

const styles = StyleSheet.create({
  root: { flexDirection: "row", flexWrap: "wrap" },
});

function splitText(text: string, by: "character" | "word"): readonly string[] {
  if (by === "character") return text.match(/[\s\S]/gu) ?? [];
  return text.split(/(\s+)/).filter((segment) => segment.length > 0);
}

function Segment({
  animation,
  index,
  progress,
  total,
  value,
}: {
  readonly animation: TextAnimateAnimation;
  readonly index: number;
  readonly progress: Animated.Value;
  readonly total: number;
  readonly value: string;
}) {
  const theme = useTheme();
  const start = total <= 1 ? 0 : (index / total) * 0.8;
  const inputRange = [start, Math.min(1, start + 0.2)];
  return (
    <Animated.Text
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        theme.typography.scale.bodySmall,
        {
          color: theme.colors.foreground,
          opacity: progress.interpolate({ inputRange, outputRange: [0, 1] }),
          transform: [
            {
              translateY: progress.interpolate({
                inputRange,
                outputRange: [
                  animation === "slide-up" ? theme.spacing[2] : 0,
                  0,
                ],
              }),
            },
          ],
        },
      ]}
    >
      {value}
    </Animated.Text>
  );
}
Segment.displayName = "Segment";

/** Reveals segments when `visible` changes; hosts own viewport detection. */
function TextAnimate({
  accessibilityLabel,
  animation = "fade",
  by = "word",
  children,
  delay = 60,
  reducedMotionService,
  ref,
  style,
  visible = true,
  ...props
}: TextAnimateProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion(reducedMotionService);
  const segments = useMemo(() => splitText(children, by), [by, children]);
  const [progress, setProgress] = useState(
    () => new Animated.Value(visible ? 1 : 0),
  );
  void setProgress;
  const staggerMs = Math.max(0, delay) * Math.max(0, segments.length - 1);
  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(visible ? 1 : 0);
      return;
    }
    const animationHandle = Animated.timing(progress, {
      duration: theme.motion.duration.base + staggerMs,
      easing: Easing.out(Easing.cubic),
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
    });
    animationHandle.start();
    return () => {
      animationHandle.stop();
    };
  }, [progress, reduceMotion, staggerMs, theme.motion.duration.base, visible]);
  return (
    <Animated.View
      {...props}
      accessibilityLabel={accessibilityLabel ?? children}
      accessible
      ref={ref}
      style={[styles.root, style]}
    >
      {segments.map((segment, index) => (
        <Segment
          animation={animation}
          index={index}
          key={`${segment}-${index.toString()}`}
          progress={progress}
          total={segments.length}
          value={segment}
        />
      ))}
    </Animated.View>
  );
}
TextAnimate.displayName = "TextAnimate";

export { TextAnimate };
