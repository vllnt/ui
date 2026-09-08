"use client";

import { type ReactNode, type Ref, useEffect, useRef, useState } from "react";

import { Animated, StyleSheet, View, type ViewProps } from "react-native";

import type { ReducedMotionService } from "../../primitives/use-reduced-motion";
import { useReducedMotion } from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";

/** Caller-identified content rendered by a native animated list. */
export type AnimatedListItem = {
  readonly content: ReactNode;
  readonly id: string;
};

/** Props for a reduced-motion-aware native entrance list. */
export type AnimatedListProps = Omit<ViewProps, "children" | "ref"> & {
  readonly delay?: number;
  readonly items: readonly AnimatedListItem[];
  readonly label: string;
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<View>;
};

const styles = StyleSheet.create({ root: { width: "100%" } });

function AnimatedListRow({
  animate,
  content,
  delay,
  index,
  reduceMotion,
}: {
  readonly animate: boolean;
  readonly content: ReactNode;
  readonly delay: number;
  readonly index: number;
  readonly reduceMotion: boolean;
}) {
  const [animateOnMount, setAnimateOnMount] = useState(animate);
  const [progress, setProgress] = useState(
    () => new Animated.Value(animate && !reduceMotion ? 0 : 1),
  );
  void setAnimateOnMount;
  void setProgress;
  const animationConsumed = useRef(false);

  useEffect(() => {
    if (reduceMotion) {
      animationConsumed.current = true;
      progress.stopAnimation();
      progress.setValue(1);
      return;
    }
    if (!animateOnMount || animationConsumed.current) return;

    animationConsumed.current = true;
    const animation = Animated.timing(progress, {
      delay: index * delay,
      duration: 100,
      toValue: 1,
      useNativeDriver: true,
    });
    animation.start();
    return () => {
      animation.stop();
      progress.setValue(1);
    };
  }, [animateOnMount, delay, index, progress, reduceMotion]);

  return (
    <Animated.View
      style={{
        opacity: progress,
        transform: [
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [4, 0],
            }),
          },
        ],
      }}
    >
      {content}
    </Animated.View>
  );
}
AnimatedListRow.displayName = "AnimatedListRow";

/**
 * Keeps initial rows visible and animates rows inserted after resolving a
 * non-reduced motion preference.
 */
function AnimatedList({
  delay = 40,
  items,
  label,
  reducedMotionService,
  ref,
  style,
  ...props
}: AnimatedListProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion(reducedMotionService);
  return (
    <View
      {...props}
      accessibilityLabel={label}
      accessibilityRole="list"
      ref={ref}
      style={[styles.root, { gap: theme.spacing[2] }, style]}
    >
      {items.map((item, index) => (
        <AnimatedListRow
          animate={!reduceMotion}
          content={item.content}
          delay={Math.max(0, delay)}
          index={index}
          key={item.id}
          reduceMotion={reduceMotion}
        />
      ))}
    </View>
  );
}
AnimatedList.displayName = "AnimatedList";

export { AnimatedList };
