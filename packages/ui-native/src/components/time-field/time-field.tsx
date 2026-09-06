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

/** Local wall-clock time ISO contract without a date or timezone. */
export type ISOTimeString = `${number}:${number}`;
/** Localized labels for TimeField. */
export type TimeFieldLabels = {
  readonly error: string;
  readonly input: string;
  readonly placeholder: string;
};
/** Props for a native ISO wall-clock editor. */
export type TimeFieldProps = Omit<
  TextInputProps,
  "defaultValue" | "onChangeText" | "value"
> & {
  readonly labels: TimeFieldLabels;
  readonly ref?: Ref<TextInput>;
  readonly valueState: ControllableStateOptions<ISOTimeString | undefined>;
};

function isISOTime(value: string): value is ISOTimeString {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;
  const [hour, minute] = value.split(":").map(Number);
  return (hour ?? 24) < 24 && (minute ?? 60) < 60;
}

/** Keyboard-friendly native time field committing only valid HH:mm values. */
function TimeField({
  labels,
  onBlur,
  onSubmitEditing,
  ref,
  style,
  valueState,
  ...props
}: TimeFieldProps) {
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
    if (isISOTime(draft)) {
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
          setDraft(text.replaceAll(/[^\d:]/g, "").slice(0, 5));
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
TimeField.displayName = "TimeField";

export { TimeField };
