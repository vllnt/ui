import type { Ref } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";

export type MeterVariant = "default" | "destructive" | "secondary";
/** Props for a static native measurement bar. */
export type MeterProps = Omit<ViewProps, "children"> & {
  readonly label: string;
  readonly max?: number;
  readonly min?: number;
  readonly ref?: Ref<View>;
  readonly segments?: number;
  readonly value: number;
  readonly valueText?: string;
  readonly variant?: MeterVariant;
};

const styles = StyleSheet.create({
  fill: { height: "100%" },
  root: { flexDirection: "row", height: 8, overflow: "hidden", width: "100%" },
  segment: { flex: 1, height: "100%" },
});

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Static range measurement exposed through React Native's progress-bar semantics. */
function Meter({
  label,
  max = 100,
  min = 0,
  ref,
  segments,
  style,
  value,
  valueText,
  variant = "default",
  ...props
}: MeterProps) {
  const theme = useTheme();
  const safeMax = max > min ? max : min + 1;
  const current = clamp(value, min, safeMax);
  const ratio = (current - min) / (safeMax - min);
  const segmentCount =
    segments !== undefined && segments > 0 ? Math.floor(segments) : 0;
  const filledSegments = Math.round(ratio * segmentCount);
  const fillColor =
    variant === "destructive"
      ? theme.colors.destructive
      : variant === "secondary"
        ? theme.colors.secondaryForeground
        : theme.colors.primary;

  return (
    <View
      {...props}
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      accessibilityValue={{ max: safeMax, min, now: current, text: valueText }}
      accessible
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor:
            segmentCount > 0 ? "transparent" : theme.colors.muted,
          borderRadius: theme.radius.full,
          gap: segmentCount > 0 ? theme.spacing[1] / 2 : 0,
        },
        style,
      ]}
    >
      {segmentCount > 0 ? (
        Array.from({ length: segmentCount }, (_entry, index) => (
          <View
            key={`meter-segment-${index}`}
            style={[
              styles.segment,
              {
                backgroundColor:
                  index < filledSegments ? fillColor : theme.colors.muted,
                borderRadius: theme.radius.full,
              },
            ]}
          />
        ))
      ) : (
        <View
          style={[
            styles.fill,
            { backgroundColor: fillColor, width: `${ratio * 100}%` },
          ]}
        />
      )}
    </View>
  );
}
Meter.displayName = "Meter";

export { Meter };
