"use client";

import type { Ref } from "react";
import type { TextInput, TextInputProps } from "react-native";

import type { ControllableStateOptions } from "../../../primitives/use-controllable-state";
import { useISOTextField } from "../../molecules/date-field/iso-text-field";

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
function TimeField(props: TimeFieldProps) {
  return useISOTextField(props, {
    isValid: isISOTime,
    sanitize: (text) => text.replaceAll(/[^\d:]/g, "").slice(0, 5),
  });
}
TimeField.displayName = "TimeField";

export { TimeField };
