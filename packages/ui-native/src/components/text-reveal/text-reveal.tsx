"use client";

import type { Ref } from "react";
import {
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import {
  type ReducedMotionService,
  useReducedMotion,
} from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";

/** Props for native word highlighting driven by host-owned progress. */
export type TextRevealProps = Omit<ViewProps, "children"> & {
  readonly children: string;
  readonly progress?: number;
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<View>;
};

const styles = StyleSheet.create({
  root: { flexDirection: "row", flexWrap: "wrap" },
});

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function wordOpacity(progress: number, total: number, index: number): number {
  return Math.min(1, Math.max(0.2, progress * total - index));
}

/** Brightens words from explicit progress; native scroll ownership stays external. */
function TextReveal({
  accessibilityLabel,
  children,
  progress = 1,
  reducedMotionService,
  ref,
  style,
  ...props
}: TextRevealProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion(reducedMotionService);
  const words = children.split(/\s+/).filter((word) => word.length > 0);
  const resolvedProgress = reduceMotion ? 1 : clamp(progress);

  return (
    <View
      {...props}
      accessibilityLabel={accessibilityLabel ?? children}
      accessible
      ref={ref}
      style={[styles.root, { columnGap: theme.spacing[1] }, style]}
    >
      {words.map((word, index) => (
        <NativeText
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          key={`${word}-${index.toString()}`}
          style={[
            theme.typography.scale.bodySmall,
            {
              color: theme.colors.foreground,
              opacity: wordOpacity(resolvedProgress, words.length, index),
            },
          ]}
        >
          {word}
        </NativeText>
      ))}
    </View>
  );
}
TextReveal.displayName = "TextReveal";

export { TextReveal };
