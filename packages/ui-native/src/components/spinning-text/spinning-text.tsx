"use client";

import { type Ref, useEffect, useState } from "react";

import {
  Animated,
  Easing,
  StyleSheet,
  Text as NativeText,
  type View,
  type ViewProps,
} from "react-native";

import {
  type ReducedMotionService,
  useReducedMotion,
} from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";

/** Props for native text arranged around a rotating ring. */
export type SpinningTextProps = Omit<ViewProps, "children"> & {
  readonly active?: boolean;
  readonly children: string;
  readonly duration?: number;
  readonly radius?: number;
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<View>;
  readonly reverse?: boolean;
};

const styles = StyleSheet.create({
  character: { position: "absolute" },
  root: { position: "relative" },
});

function splitCharacters(value: string): readonly string[] {
  return value.match(/[\s\S]/gu) ?? [];
}

function RingCharacters({
  characters,
  radius,
}: {
  readonly characters: readonly string[];
  readonly radius: number;
}) {
  const theme = useTheme();
  return characters.map((character, index) => {
    const angle = (360 / characters.length) * index;
    const radians = (angle * Math.PI) / 180;
    return (
      <NativeText
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        key={`${character}-${index.toString()}`}
        style={[
          styles.character,
          theme.typography.scale.caption,
          {
            color: theme.colors.foreground,
            left: radius + Math.sin(radians) * radius,
            top: radius - Math.cos(radians) * radius,
            transform: [
              { translateX: -theme.spacing[2] },
              { translateY: -theme.spacing[2] },
              { rotate: `${angle.toString()}deg` },
            ],
          },
        ]}
      >
        {character}
      </NativeText>
    );
  });
}
RingCharacters.displayName = "RingCharacters";

/** Rotates a semantic-color character ring and stops for reduced motion. */
function SpinningText({
  accessibilityLabel,
  active = true,
  children,
  duration = 20_000,
  radius = 80,
  reducedMotionService,
  ref,
  reverse = false,
  style,
  ...props
}: SpinningTextProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion(reducedMotionService);
  const [rotation, setRotation] = useState(() => new Animated.Value(0));
  void setRotation;
  const characters = splitCharacters(children);
  const safeRadius = Math.max(theme.spacing[4], radius);
  useEffect(() => {
    rotation.setValue(0);
    if (!active || reduceMotion) return;
    const animation = Animated.loop(
      Animated.timing(rotation, {
        duration: Math.max(theme.motion.duration.slow, duration),
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => {
      animation.stop();
    };
  }, [active, duration, reduceMotion, rotation, theme.motion.duration.slow]);
  return (
    <Animated.View
      {...props}
      accessibilityLabel={accessibilityLabel ?? children}
      accessible
      ref={ref}
      style={[
        styles.root,
        {
          height: safeRadius * 2,
          transform: [
            {
              rotate: rotation.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", reverse ? "-360deg" : "360deg"],
              }),
            },
          ],
          width: safeRadius * 2,
        },
        style,
      ]}
    >
      <RingCharacters characters={characters} radius={safeRadius} />
    </Animated.View>
  );
}
SpinningText.displayName = "SpinningText";

export { SpinningText };
