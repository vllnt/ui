"use client";

import { type Ref, useRef, useState } from "react";

import {
  type AccessibilityActionEvent,
  type GestureResponderEvent,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";

import { useGroupDisabled } from "../../../primitives/control-group";
import { useControllableState } from "../../../primitives/use-controllable-state";
import { useTheme } from "../../../theme/theme-provider";

/** Axis a native slider runs along. */
export type SliderOrientation = "horizontal" | "vertical";

/**
 * Props for a single-value native slider. The web `minStepsBetweenThumbs`
 * prop has no native counterpart because this slider has one thumb, and the
 * web `name`, `form` and `dir` props are DOM-only.
 */
export type SliderProps = Omit<
  ViewProps,
  | "children"
  | "onAccessibilityAction"
  | "onLayout"
  | "onResponderGrant"
  | "onResponderMove"
  | "onResponderRelease"
  | "onResponderTerminate"
  | "onStartShouldSetResponder"
> & {
  /** Screen-reader name of the decrement action. Defaults to "Decrease". */
  readonly decrementLabel?: string;
  readonly defaultValue?: number;
  readonly disabled?: boolean;
  /** Screen-reader name of the increment action. Defaults to "Increase". */
  readonly incrementLabel?: string;
  /**
   * Runs the track the other way: the minimum sits at the end edge (right for
   * `"horizontal"`, top for `"vertical"`). Defaults to `false`.
   */
  readonly inverted?: boolean;
  readonly max?: number;
  readonly min?: number;
  readonly onValueChange?: (value: number) => void;
  /**
   * Runs once when a drag ends (or is cancelled) on a different value than it
   * started on, and after each screen-reader step that moves the value. It
   * gets the final value; `onValueChange` still runs on every move.
   */
  readonly onValueCommit?: (value: number) => void;
  /** Axis of the slider. Defaults to `"horizontal"`, as on web. */
  readonly orientation?: SliderOrientation;
  readonly ref?: Ref<View>;
  readonly step?: number;
  readonly value?: number;
  /**
   * Spoken value. Defaults to the number itself so iOS does not read the
   * position as a percentage of the range.
   */
  readonly valueText?: string;
};

const styles = StyleSheet.create({
  fill: { height: "100%" },
  root: { height: 44, justifyContent: "center", width: "100%" },
  thumb: { height: 20, marginLeft: -10, position: "absolute", width: 20 },
  track: { height: 8, overflow: "hidden", width: "100%" },
  verticalFill: { width: "100%" },
  verticalRoot: { alignItems: "center", height: "100%", width: 44 },
  verticalThumb: {
    height: 20,
    marginTop: -10,
    position: "absolute",
    width: 20,
  },
  verticalTrack: { height: "100%", overflow: "hidden", width: 8 },
});

type SliderAxis = {
  /** The minimum sits at the end edge (right or bottom) of the track. */
  readonly reversed: boolean;
  readonly vertical: boolean;
};

function axisOf(orientation: SliderOrientation, inverted: boolean): SliderAxis {
  const vertical = orientation === "vertical";
  return { reversed: vertical !== inverted, vertical };
}

function fillDirection({
  reversed,
  vertical,
}: SliderAxis): "column" | "column-reverse" | "row" | "row-reverse" {
  if (vertical) return reversed ? "column-reverse" : "column";
  return reversed ? "row-reverse" : "row";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** NaN falls back to the lower bound; ±Infinity clamps to the range. */
function normalizeValue(
  value: number,
  min: number,
  max: number,
  step: number,
): number {
  if (max <= min || Number.isNaN(value)) return min;
  const stepped = min + Math.round((value - min) / step) * step;
  return clamp(stepped, min, max);
}

/**
 * Native slider with adjustable actions and a simple track gesture, running
 * along either axis. It intentionally supports one value and does not claim
 * DOM range parity. A vertical slider is 44 points wide and takes its height
 * from its parent, so give it a parent (or `style`) with a definite height.
 */
function Slider({
  accessibilityState,
  decrementLabel = "Decrease",
  defaultValue,
  disabled: ownDisabled = false,
  incrementLabel = "Increase",
  inverted = false,
  max: maxProperty = 100,
  min: minProperty = 0,
  onValueChange,
  onValueCommit,
  orientation = "horizontal",
  ref,
  step: stepProperty = 1,
  style,
  value,
  valueText,
  ...props
}: SliderProps) {
  const disabled = useGroupDisabled(ownDisabled);
  const theme = useTheme();
  // Non-finite bounds and non-positive steps would render NaN styles.
  const min = Number.isFinite(minProperty) ? minProperty : 0;
  const max = Number.isFinite(maxProperty) ? maxProperty : min + 100;
  const step =
    Number.isFinite(stepProperty) && stepProperty > 0 ? stepProperty : 1;
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
  const [trackSize, setTrackSize] = useState({ height: 0, width: 0 });
  const dragged = useRef<{ latest: number; start: number }>(undefined);
  const axis = axisOf(orientation, inverted);
  const trackLength = axis.vertical ? trackSize.height : trackSize.width;
  const range = upperBound - min;
  const ratio = range === 0 ? 0 : (currentValue - min) / range;
  const edgeOffset = axis.reversed ? 1 - ratio : ratio;

  const update = (nextValue: number): number => {
    const next = normalizeValue(nextValue, min, upperBound, step);
    if (!disabled) setCurrentValue(next);
    return next;
  };
  const updateFromGesture = (event: GestureResponderEvent) => {
    if (trackLength <= 0) return;
    const { locationX, locationY } = event.nativeEvent;
    const gestureOffset = clamp(
      (axis.vertical ? locationY : locationX) / trackLength,
      0,
      1,
    );
    const gestureRatio = axis.reversed ? 1 - gestureOffset : gestureOffset;
    const next = update(min + gestureRatio * range);
    if (dragged.current) dragged.current.latest = next;
  };
  const startDrag = (event: GestureResponderEvent) => {
    dragged.current = { latest: currentValue, start: currentValue };
    updateFromGesture(event);
  };
  const endDrag = () => {
    const drag = dragged.current;
    dragged.current = undefined;
    if (!disabled && drag !== undefined && drag.latest !== drag.start) {
      onValueCommit?.(drag.latest);
    }
  };
  const stepBy = (direction: -1 | 1) => {
    const next = update(currentValue + direction * step);
    if (!disabled && next !== currentValue) onValueCommit?.(next);
  };
  const handleAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === "increment") stepBy(1);
    if (event.nativeEvent.actionName === "decrement") stepBy(-1);
  };

  return (
    <View
      {...props}
      accessibilityActions={[
        { label: decrementLabel, name: "decrement" },
        { label: incrementLabel, name: "increment" },
      ]}
      accessibilityRole="adjustable"
      accessibilityState={{ ...accessibilityState, disabled }}
      accessibilityValue={{
        max: upperBound,
        min,
        now: currentValue,
        text: valueText ?? String(currentValue),
      }}
      accessible
      onAccessibilityAction={handleAccessibilityAction}
      onLayout={(event) => {
        const { height, width } = event.nativeEvent.layout;
        setTrackSize({ height, width });
      }}
      onResponderGrant={startDrag}
      onResponderMove={updateFromGesture}
      onResponderRelease={endDrag}
      onResponderTerminate={endDrag}
      onStartShouldSetResponder={() => !disabled}
      ref={ref}
      style={[
        axis.vertical ? styles.verticalRoot : styles.root,
        { opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          axis.vertical ? styles.verticalTrack : styles.track,
          {
            backgroundColor: theme.colors.secondary,
            borderRadius: theme.radius.full,
            flexDirection: fillDirection(axis),
          },
        ]}
      >
        <View
          style={[
            axis.vertical ? styles.verticalFill : styles.fill,
            { backgroundColor: theme.colors.primary },
            axis.vertical
              ? { height: `${ratio * 100}%` }
              : { width: `${ratio * 100}%` },
          ]}
        />
      </View>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          axis.vertical ? styles.verticalThumb : styles.thumb,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.primary,
            borderRadius: theme.radius.full,
            borderWidth: 2,
          },
          axis.vertical
            ? { top: `${edgeOffset * 100}%` }
            : { left: `${edgeOffset * 100}%` },
        ]}
      />
    </View>
  );
}
Slider.displayName = "Slider";

export { Slider };
