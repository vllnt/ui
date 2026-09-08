"use client";

import { type Ref, useId } from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";

import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";

/** Caller-localized labels for a native rating. */
export type RatingLabels = {
  readonly option: (value: number, max: number) => string;
  readonly value: (value: number, max: number) => string;
};

/** Props for a controlled or uncontrolled native rating. */
export type RatingProps = Omit<ViewProps, "children"> & {
  readonly allowClear?: boolean;
  readonly defaultValue?: number;
  readonly label: string;
  readonly labels: RatingLabels;
  readonly max?: number;
  readonly onValueChange?: (value: number) => void;
  readonly readOnly?: boolean;
  readonly ref?: Ref<View>;
  readonly showValue?: boolean;
  readonly value?: number;
};

const MAX_OPTIONS = 100;
const styles = StyleSheet.create({
  option: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  root: { alignItems: "center", flexDirection: "row", flexWrap: "wrap" },
});

function normalize(value: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(0, Math.round(value)), max);
}

type RatingOptionProps = {
  readonly activeValue: number;
  readonly allowClear: boolean;
  readonly choice: number;
  readonly generatedId: string;
  readonly label: string;
  readonly onSelect: (value: number) => void;
  readonly readOnly: boolean;
};

function RatingOption({
  activeValue,
  allowClear,
  choice,
  generatedId,
  label,
  onSelect,
  readOnly,
}: RatingOptionProps) {
  const theme = useTheme();
  const selected = choice === activeValue;
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled: readOnly }}
      disabled={readOnly}
      nativeID={`${generatedId}-rating-${choice}`}
      onPress={() => {
        onSelect(allowClear && selected ? 0 : choice);
      }}
      style={({ pressed }) => [
        styles.option,
        { opacity: readOnly ? 0.6 : pressed ? 0.8 : 1 },
      ]}
    >
      <Text
        style={{
          color:
            choice <= activeValue
              ? theme.colors.primary
              : theme.colors.mutedForeground,
          fontSize: 24,
        }}
      >
        {choice <= activeValue ? "★" : "☆"}
      </Text>
    </Pressable>
  );
}
RatingOption.displayName = "RatingOption";

/** Native radio-based rating with 44-point choices and localized value text. */
function Rating({
  allowClear = false,
  defaultValue = 0,
  label,
  labels,
  max = 5,
  onValueChange,
  readOnly = false,
  ref,
  showValue = false,
  style,
  value,
  ...props
}: RatingProps) {
  const theme = useTheme();
  const generatedId = useId();
  const safeMax = Number.isFinite(max)
    ? Math.min(MAX_OPTIONS, Math.max(1, Math.round(max)))
    : 5;
  const [currentValue, setCurrentValue] = useControllableState(
    value === undefined
      ? {
          defaultValue: normalize(defaultValue, safeMax),
          mode: "uncontrolled",
          onChange: onValueChange,
        }
      : {
          mode: "controlled",
          onChange: onValueChange,
          value: normalize(value, safeMax),
        },
  );
  const choices = Array.from({ length: safeMax }, (_, index) => index + 1);

  return (
    <View
      {...props}
      accessibilityLabel={label}
      accessibilityRole="radiogroup"
      ref={ref}
      style={[styles.root, { gap: theme.spacing[1] }, style]}
    >
      {choices.map((choice) => (
        <RatingOption
          activeValue={normalize(currentValue, safeMax)}
          allowClear={allowClear}
          choice={choice}
          generatedId={generatedId}
          key={choice}
          label={labels.option(choice, safeMax)}
          onSelect={setCurrentValue}
          readOnly={readOnly}
        />
      ))}
      {showValue ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[
            theme.typography.scale.bodySmall,
            {
              color: theme.colors.mutedForeground,
              marginStart: theme.spacing[2],
            },
          ]}
        >
          {labels.value(normalize(currentValue, safeMax), safeMax)}
        </Text>
      ) : null}
    </View>
  );
}
Rating.displayName = "Rating";

export { Rating };
