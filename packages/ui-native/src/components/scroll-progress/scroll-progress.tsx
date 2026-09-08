import type { Ref } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** Native scroll metrics accepted by {@link calculateScrollProgress}. */
export type NativeScrollMetrics = {
  readonly contentOffset: { readonly y: number };
  readonly contentSize: { readonly height: number };
  readonly layoutMeasurement: { readonly height: number };
};

/** Props for a caller-driven native scroll progress indicator. */
export type ScrollProgressProps = Omit<ViewProps, "children" | "ref"> & {
  readonly label: string;
  readonly ref?: Ref<View>;
  readonly value: number;
};

const styles = StyleSheet.create({
  fill: { height: 4 },
  track: { height: 4, overflow: "hidden", width: "100%" },
});

function clampProgress(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Converts a vertical React Native scroll event payload to a zero-to-one value. */
function calculateScrollProgress(metrics: NativeScrollMetrics): number {
  const scrollable =
    metrics.contentSize.height - metrics.layoutMeasurement.height;
  if (scrollable <= 0) return 0;
  return clampProgress(metrics.contentOffset.y / scrollable);
}

/**
 * Progress bar driven by a host ScrollView or FlatList. Native has no global
 * document scroll position, so the caller owns and supplies the value.
 */
function ScrollProgress({
  label,
  ref,
  style,
  value,
  ...props
}: ScrollProgressProps) {
  const theme = useTheme();
  const progress = clampProgress(value);

  return (
    <View
      {...props}
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      accessibilityValue={{ max: 100, min: 0, now: Math.round(progress * 100) }}
      ref={ref}
      style={[
        styles.track,
        {
          backgroundColor: theme.colors.muted,
          borderRadius: theme.radius.full,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.full,
            width: `${progress * 100}%`,
          },
        ]}
      />
    </View>
  );
}
ScrollProgress.displayName = "ScrollProgress";

export { calculateScrollProgress, ScrollProgress };
