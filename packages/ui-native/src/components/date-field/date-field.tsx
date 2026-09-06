"use client";

import { type Ref, useState } from "react";

import {
  Text as NativeText,
  type TextInput,
  type TextInputProps,
  View,
} from "react-native";

import type { ControllableStateOptions } from "../../primitives/use-controllable-state";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";
import { Input } from "../input/input";

/** Calendar-date ISO contract without a timezone component. */
export type ISODateString = `${number}-${number}-${number}`;
/** Localized labels for a text-based native date field. */
export type DateFieldLabels = {
  readonly error: string;
  readonly input: string;
  readonly placeholder: string;
};
/** Props for a native ISO calendar-date editor. */
export type DateFieldProps = Omit<
  TextInputProps,
  "defaultValue" | "onChangeText" | "value"
> & {
  readonly labels: DateFieldLabels;
  readonly ref?: Ref<TextInput>;
  readonly valueState: ControllableStateOptions<ISODateString | undefined>;
};

function isISODate(value: string): value is ISODateString {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year ?? 0, (month ?? 1) - 1, day ?? 0);
  return (
    date.getFullYear() === year &&
    date.getMonth() === (month ?? 1) - 1 &&
    date.getDate() === day
  );
}

/** Keyboard-friendly native date field committing only valid YYYY-MM-DD values. */
function DateField({
  labels,
  onBlur,
  onSubmitEditing,
  ref,
  style,
  valueState,
  ...props
}: DateFieldProps) {
  const theme = useTheme();
  const [value, setValue] = useControllableState(valueState);
  const [draft, setDraft] = useState(value ?? "");
  const [editing, setEditing] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const commit = () => {
    if (draft.length === 0) {
      setInvalid(false);
      setValue(undefined);
      return;
    }
    if (isISODate(draft)) {
      setInvalid(false);
      setValue(draft);
    } else setInvalid(true);
  };
  return (
    <View>
      <Input
        {...props}
        accessibilityLabel={labels.input}
        aria-invalid={invalid}
        inputMode="numeric"
        onBlur={(event) => {
          commit();
          setEditing(false);
          onBlur?.(event);
        }}
        onChangeText={(text) => {
          setDraft(text.replaceAll(/[^\d-]/g, "").slice(0, 10));
          setInvalid(false);
        }}
        onFocus={(event) => {
          setDraft(value ?? "");
          setEditing(true);
          props.onFocus?.(event);
        }}
        onSubmitEditing={(event) => {
          commit();
          onSubmitEditing?.(event);
        }}
        placeholder={labels.placeholder}
        ref={ref}
        returnKeyType="done"
        style={[{ minHeight: 44 }, style]}
        value={
          editing
            ? draft
            : valueState.mode === "controlled"
              ? (value ?? "")
              : (value ?? draft)
        }
      />
      {invalid ? (
        <NativeText
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          style={[
            theme.typography.scale.bodySmall,
            { color: theme.colors.destructive },
          ]}
        >
          {labels.error}
        </NativeText>
      ) : null}
    </View>
  );
}
DateField.displayName = "DateField";

export { DateField };
