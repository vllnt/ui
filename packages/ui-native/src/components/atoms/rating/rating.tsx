"use client";

import { type Ref, useId } from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";

import { useAnnounceOnChange } from "../../../primitives/accessibility";
import { useGroupDisabled } from "../../../primitives/control-group";
import { typeStyle } from "../../../primitives/type-style";
import {
  controllableOptions,
  useControllableState,
} from "../../../primitives/use-controllable-state";
import { useTheme } from "../../../theme/theme-provider";

/** Caller-localized labels for a native rating. */
export type RatingLabels = {
  readonly option: (value: number, max: number) => string;
  readonly value: (value: number, max: number) => string;
};

/** Glyph size of a native rating; each option keeps a 44-point target. */
export type RatingSize = "lg" | "md" | "sm";

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
  /** Glyph size; defaults to `lg`, the size native ratings always rendered. */
  readonly size?: RatingSize;
  readonly value?: number;
};

const MAX_OPTIONS = 100;
/** Theme type-scale entries whose font size each rating size uses. */
const GLYPH_SCALE = { lg: "h4", md: "h5", sm: "body" } as const;
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
  readonly groupLabel: string;
  readonly label: string;
  readonly onSelect: (value: number) => void;
  readonly readOnly: boolean;
  readonly size: RatingSize;
};

function RatingOption({
  activeValue,
  allowClear,
  choice,
  generatedId,
  groupLabel,
  label,
  onSelect,
  readOnly,
  size,
}: RatingOptionProps) {
  const theme = useTheme();
  const selected = choice === activeValue;
  return (
    <Pressable
      accessibilityHint={groupLabel}
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
          fontSize: theme.typography.scale[GLYPH_SCALE[size]].fontSize,
        }}
      >
        {choice <= activeValue ? "★" : "☆"}
      </Text>
    </Pressable>
  );
}
RatingOption.displayName = "RatingOption";

/**
 * Native radio-based rating with 44-point choices and localized value text.
 * The group `label` is each option's hint, because VoiceOver ignores labels on
 * non-focusable containers.
 */
function Rating({
  allowClear = false,
  defaultValue = 0,
  label,
  labels,
  max = 5,
  onValueChange,
  readOnly: ownReadOnly = false,
  ref,
  showValue = false,
  size = "lg",
  style,
  value,
  ...props
}: RatingProps) {
  const theme = useTheme();
  const readOnly = useGroupDisabled(ownReadOnly);
  const generatedId = useId();
  const safeMax = Number.isFinite(max)
    ? Math.min(MAX_OPTIONS, Math.max(1, Math.round(max)))
    : 5;
  const [currentValue, setCurrentValue] = useControllableState(
    controllableOptions(
      value === undefined ? undefined : normalize(value, safeMax),
      normalize(defaultValue, safeMax),
      onValueChange,
    ),
  );
  const choices = Array.from({ length: safeMax }, (_, index) => index + 1);
  const valueText = labels.value(normalize(currentValue, safeMax), safeMax);
  useAnnounceOnChange(showValue ? valueText : undefined, { liveRegion: true });

  return (
    <View
      {...props}
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
          groupLabel={label}
          key={choice}
          label={labels.option(choice, safeMax)}
          onSelect={setCurrentValue}
          readOnly={readOnly}
          size={size}
        />
      ))}
      {showValue ? (
        <Text
          accessibilityLiveRegion="polite"
          style={typeStyle(theme, "bodySmall", {
            color: "mutedForeground",
            marginStart: theme.spacing[2],
          })}
        >
          {valueText}
        </Text>
      ) : null}
    </View>
  );
}
Rating.displayName = "Rating";

export { Rating };
