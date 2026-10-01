"use client";

import type { Ref } from "react";
import type { TextInput, TextInputProps } from "react-native";

import type { ControllableStateOptions } from "../../../primitives/use-controllable-state";

import { useISOTextField } from "./iso-text-field";

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
  const date = new Date(0);
  date.setUTCFullYear(year ?? 0, (month ?? 1) - 1, day ?? 0);
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === (month ?? 1) - 1 &&
    date.getUTCDate() === day
  );
}

/** Keyboard-friendly native date field committing only valid YYYY-MM-DD values. */
function DateField(props: DateFieldProps) {
  return useISOTextField(props, {
    isValid: isISODate,
    sanitize: (text) => text.replaceAll(/[^\d-]/g, "").slice(0, 10),
  });
}
DateField.displayName = "DateField";

export { DateField };
