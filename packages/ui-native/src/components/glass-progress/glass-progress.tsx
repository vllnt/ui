import type { Ref } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** Props for the native GlassProgress indicator. */
export type GlassProgressProps = Omit<
  ViewProps,
  "accessibilityRole" | "accessibilityValue"
> & {
  readonly ref?: Ref<View>;
  /** Completion percentage. The component clamps values outside 0–100. */
  readonly value: number;
};

const styles = StyleSheet.create({
  fill: { height: "100%" },
  track: { borderWidth: 1, overflow: "hidden", width: "100%" },
});

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 100);
}

/** Token-driven determinate progress indicator for React Native. */
function GlassProgress({
  ref,
  style,
  testID,
  value,
  ...props
}: GlassProgressProps) {
  const theme = useTheme();
  const clamped = clampPercent(value);

  return (
    <View
      {...props}
      accessibilityRole="progressbar"
      accessibilityValue={{ max: 100, min: 0, now: clamped }}
      accessible
      ref={ref}
      style={[
        styles.track,
        {
          backgroundColor: theme.colors.muted,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.full,
          height: theme.spacing[2],
        },
        style,
      ]}
      testID={testID}
    >
      <View
        style={[
          styles.fill,
          {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.full,
            width: `${clamped}%`,
          },
        ]}
        testID={testID ? `${testID}-fill` : undefined}
      />
    </View>
  );
}
GlassProgress.displayName = "GlassProgress";

export { GlassProgress };
