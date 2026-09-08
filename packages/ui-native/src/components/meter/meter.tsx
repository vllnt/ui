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

const MAX_SEGMENTS = 100;
const styles = StyleSheet.create({
  fill: { height: "100%" },
  root: { flexDirection: "row", height: 8, overflow: "hidden", width: "100%" },
  segment: { flex: 1, height: "100%" },
});

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getMeterValues(value: number, min: number, max: number) {
  const safeMin = Number.isFinite(min) ? min : 0;
  const proposedMax = Number.isFinite(max) ? max : safeMin + 100;
  const safeMax = proposedMax > safeMin ? proposedMax : safeMin + 1;
  const current = Number.isFinite(value)
    ? clamp(value, safeMin, safeMax)
    : safeMin;
  return {
    current,
    max: safeMax,
    min: safeMin,
    ratio:
      safeMax === safeMin
        ? 0
        : Number.isFinite(safeMax - safeMin)
          ? (current - safeMin) / (safeMax - safeMin)
          : (current / 2 - safeMin / 2) / (safeMax / 2 - safeMin / 2),
  };
}

function getFillColor(
  variant: MeterVariant,
  colors: ReturnType<typeof useTheme>["colors"],
): string {
  if (variant === "destructive") return colors.destructive;
  if (variant === "secondary") return colors.secondaryForeground;
  return colors.primary;
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
  const meter = getMeterValues(value, min, max);
  const segmentCount =
    segments !== undefined && Number.isFinite(segments) && segments > 0
      ? Math.min(MAX_SEGMENTS, Math.floor(segments))
      : 0;
  const filledSegments = Math.round(meter.ratio * segmentCount);
  const fillColor = getFillColor(variant, theme.colors);

  return (
    <View
      {...props}
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      accessibilityValue={{
        max: meter.max,
        min: meter.min,
        now: meter.current,
        text: valueText,
      }}
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
            { backgroundColor: fillColor, width: `${meter.ratio * 100}%` },
          ]}
        />
      )}
    </View>
  );
}
Meter.displayName = "Meter";

export { Meter };
