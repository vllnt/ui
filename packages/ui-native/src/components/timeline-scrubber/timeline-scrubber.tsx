"use client";

import type { Ref } from "react";
import {
  Pressable,
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import {
  decorativeProps,
  joinAccessibilityText,
} from "../../primitives/accessibility";
import { typeStyle } from "../../primitives/type-style";
import type { ControllableStateOptions } from "../../primitives/use-controllable-state";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useReducedMotion } from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";

/** Caller-identified timeline milestone. */
export type TimelineTick = {
  readonly id: string;
  readonly label?: string;
  readonly value: number;
};
/** Localized labels for TimelineScrubber. */
export type TimelineScrubberLabels = {
  readonly decrement: string;
  readonly increment: string;
  readonly region: string;
};
/** Props for the RN-core timeline scrubber model. */
export type TimelineScrubberProps = Omit<
  ViewProps,
  | "accessibilityActions"
  | "accessibilityLabel"
  | "accessibilityRole"
  | "accessibilityValue"
  | "children"
  | "onAccessibilityAction"
  | "ref"
> & {
  readonly end: number;
  readonly formatValue: (value: number) => string;
  readonly labels: TimelineScrubberLabels;
  readonly ref?: Ref<View>;
  readonly start: number;
  readonly step?: number;
  readonly ticks?: readonly TimelineTick[];
  readonly valueState: ControllableStateOptions<number>;
};

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  controls: { alignItems: "center", flexDirection: "row" },
  fill: { height: 4 },
  track: { flex: 1, height: 4 },
});
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Accessible adjustable timeline using RN-core increment/decrement actions.
 * Direct drag gestures are intentionally unavailable without a host slider.
 * The value readout is the adjustable element (it speaks the tick label at
 * the current value, and lists all tick labels as its hint); the step buttons
 * are separate siblings so VoiceOver, Switch Control, and Voice Control reach
 * them. `ref` and `style` apply to the outer layout; the other view props
 * (such as `testID`) apply to the adjustable element.
 */
function TimelineScrubber({
  end,
  formatValue,
  labels,
  ref,
  start,
  step = 1,
  style,
  ticks,
  valueState,
  ...props
}: TimelineScrubberProps) {
  const theme = useTheme();
  useReducedMotion();
  const safeEnd = end > start ? end : start + 1;
  const safeStep = Number.isFinite(step) && step > 0 ? step : 1;
  const [value, setValue] = useControllableState(valueState);
  const current = clamp(value, start, safeEnd);
  const ratio = (current - start) / (safeEnd - start);
  const change = (offset: number) => {
    setValue(clamp(current + offset, start, safeEnd));
  };
  const tickLabels = (ticks ?? []).flatMap((tick) =>
    tick.label === undefined ? [] : [tick.label],
  );
  const currentTick = ticks?.find((tick) => tick.value === current)?.label;
  return (
    <View ref={ref} style={[{ gap: theme.spacing[1] }, style]}>
      <View
        {...props}
        accessibilityActions={[
          { label: labels.decrement, name: "decrement" },
          { label: labels.increment, name: "increment" },
        ]}
        accessibilityHint={joinAccessibilityText(tickLabels, ", ")}
        accessibilityLabel={labels.region}
        accessibilityRole="adjustable"
        accessibilityValue={{
          max: safeEnd,
          min: start,
          now: current,
          text: joinAccessibilityText([formatValue(current), currentTick], ", "),
        }}
        accessible
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === "decrement") change(-safeStep);
          if (event.nativeEvent.actionName === "increment") change(safeStep);
        }}
      >
        <NativeText style={typeStyle(theme, "caption", "mutedForeground")}>
          {formatValue(current)}
        </NativeText>
      </View>
      <View style={styles.controls}>
        <Pressable
          accessibilityLabel={labels.decrement}
          accessibilityRole="button"
          onPress={() => {
            change(-safeStep);
          }}
          style={styles.action}
        >
          <NativeText style={{ color: theme.colors.foreground }}>−</NativeText>
        </Pressable>
        <View
          {...decorativeProps}
          style={[
            styles.track,
            {
              backgroundColor: theme.colors.muted,
              borderRadius: theme.radius.full,
            },
          ]}
        >
          <View
            style={[
              styles.fill,
              {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.full,
                width: `${ratio * 100}%`,
              },
            ]}
          />
        </View>
        <Pressable
          accessibilityLabel={labels.increment}
          accessibilityRole="button"
          onPress={() => {
            change(safeStep);
          }}
          style={styles.action}
        >
          <NativeText style={{ color: theme.colors.foreground }}>+</NativeText>
        </Pressable>
      </View>
    </View>
  );
}
TimelineScrubber.displayName = "TimelineScrubber";

export { TimelineScrubber };
