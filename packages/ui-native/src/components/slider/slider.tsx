"use client";

import { type Ref, useState } from "react";

import {
  type AccessibilityActionEvent,
  type GestureResponderEvent,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";

import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";

/** Props for a horizontal, single-value native slider. */
export type SliderProps = Omit<
  ViewProps,
  | "children"
  | "onAccessibilityAction"
  | "onLayout"
  | "onResponderGrant"
  | "onResponderMove"
  | "onStartShouldSetResponder"
> & {
  readonly defaultValue?: number;
  readonly disabled?: boolean;
  readonly max?: number;
  readonly min?: number;
  readonly onValueChange?: (value: number) => void;
  readonly ref?: Ref<View>;
  readonly step?: number;
  readonly value?: number;
  readonly valueText?: string;
};

const styles = StyleSheet.create({
  fill: { height: "100%" },
  root: { height: 44, justifyContent: "center", width: "100%" },
  thumb: { height: 20, marginLeft: -10, position: "absolute", width: 20 },
  track: { height: 8, overflow: "hidden", width: "100%" },
});

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeValue(
  value: number,
  min: number,
  max: number,
  step: number,
): number {
  if (max <= min) return min;
  const safeStep = step > 0 ? step : 1;
  const stepped = min + Math.round((value - min) / safeStep) * safeStep;
  return clamp(stepped, min, max);
}

/**
 * Horizontal native slider with adjustable actions and a simple track gesture.
 * It intentionally supports one value and does not claim DOM range parity.
 */
function Slider({
  accessibilityState,
  defaultValue,
  disabled = false,
  max = 100,
  min = 0,
  onValueChange,
  ref,
  step = 1,
  style,
  value,
  valueText,
  ...props
}: SliderProps) {
  const theme = useTheme();
  const upperBound = Math.max(min, max);
  const initialValue = normalizeValue(
    value ?? defaultValue ?? min,
    min,
    upperBound,
    step,
  );
  const [storedValue, setCurrentValue] = useControllableState(
    value === undefined
      ? {
          defaultValue: initialValue,
          mode: "uncontrolled",
          onChange: onValueChange,
        }
      : {
          mode: "controlled",
          onChange: onValueChange,
          value: normalizeValue(value, min, upperBound, step),
        },
  );
  const currentValue = normalizeValue(storedValue, min, upperBound, step);
  const [trackWidth, setTrackWidth] = useState(0);
  const range = upperBound - min;
  const ratio = range === 0 ? 0 : (currentValue - min) / range;

  const update = (nextValue: number) => {
    if (disabled) return;
    setCurrentValue(normalizeValue(nextValue, min, upperBound, step));
  };
  const updateFromGesture = (event: GestureResponderEvent) => {
    if (trackWidth <= 0) return;
    const gestureRatio = clamp(event.nativeEvent.locationX / trackWidth, 0, 1);
    update(min + gestureRatio * range);
  };
  const handleAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === "increment") {
      update(currentValue + (step > 0 ? step : 1));
    }
    if (event.nativeEvent.actionName === "decrement") {
      update(currentValue - (step > 0 ? step : 1));
    }
  };

  return (
    <View
      {...props}
      accessibilityActions={[
        { label: "Decrease", name: "decrement" },
        { label: "Increase", name: "increment" },
      ]}
      accessibilityRole="adjustable"
      accessibilityState={{ ...accessibilityState, disabled }}
      accessibilityValue={{
        max: upperBound,
        min,
        now: currentValue,
        text: valueText,
      }}
      accessible
      onAccessibilityAction={handleAccessibilityAction}
      onLayout={(event) => {
        setTrackWidth(event.nativeEvent.layout.width);
      }}
      onResponderGrant={updateFromGesture}
      onResponderMove={updateFromGesture}
      onStartShouldSetResponder={() => !disabled}
      ref={ref}
      style={[styles.root, { opacity: disabled ? 0.5 : 1 }, style]}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.track,
          {
            backgroundColor: theme.colors.secondary,
            borderRadius: theme.radius.full,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              backgroundColor: theme.colors.primary,
              width: `${ratio * 100}%`,
            },
          ]}
        />
      </View>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.thumb,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.primary,
            borderRadius: theme.radius.full,
            borderWidth: 2,
            left: `${ratio * 100}%`,
          },
        ]}
      />
    </View>
  );
}
Slider.displayName = "Slider";

export { Slider };
