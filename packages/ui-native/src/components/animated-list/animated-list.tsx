"use client";

import { type ReactNode, type Ref, useEffect, useState } from "react";

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
  content,
  delay,
  index,
  reduceMotion,
}: {
  readonly content: ReactNode;
  readonly delay: number;
  readonly index: number;
  readonly reduceMotion: boolean;
}) {
  const [progress, setProgress] = useState(
    () => new Animated.Value(reduceMotion ? 1 : 0),
  );
  void setProgress;
  useEffect(() => {
    Animated.timing(progress, {
      delay: reduceMotion ? 0 : index * delay,
      duration: reduceMotion ? 0 : 100,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [delay, index, progress, reduceMotion]);

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

/** Purposeful one-time list entrances that collapse to no motion when requested. */
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
