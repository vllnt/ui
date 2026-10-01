"use client";

import { type Ref, useState } from "react";

import {
  Text as NativeText,
  type TextInput,
  type TextInputProps,
  View,
} from "react-native";

import {
  joinAccessibilityText,
  useAnnounceOnChange,
} from "../../../primitives/accessibility";
import { typeStyle } from "../../../primitives/type-style";
import {
  type ControllableStateOptions,
  useControllableState,
} from "../../../primitives/use-controllable-state";
import { useTheme } from "../../../theme/theme-provider";
import { Input } from "../../atoms/input/input";

/** Props shared by the text-based native ISO date and time fields. */
type ISOTextFieldProps<TValue extends string> = Omit<
  TextInputProps,
  "defaultValue" | "onChangeText" | "value"
> & {
  readonly labels: {
    readonly error: string;
    readonly input: string;
    readonly placeholder: string;
  };
  readonly ref?: Ref<TextInput>;
  readonly valueState: ControllableStateOptions<TValue | undefined>;
};

/** Accepted ISO format: full-value validation plus keystroke sanitizing. */
type ISOTextFormat<TValue extends string> = {
  readonly isValid: (value: string) => value is TValue;
  readonly sanitize: (text: string) => string;
};

/** Renders a keyboard-friendly field that commits only values `format` accepts. */
function useISOTextField<TValue extends string>(
  {
    accessibilityHint,
    labels,
    onBlur,
    onSubmitEditing,
    ref,
    style,
    valueState,
    ...props
  }: ISOTextFieldProps<TValue>,
  format: ISOTextFormat<TValue>,
) {
  const theme = useTheme();
  const [value, setValue] = useControllableState(valueState);
  const [draft, setDraft] = useState<string>(value ?? "");
  const [editing, setEditing] = useState(false);
  const [invalid, setInvalid] = useState(false);
  useAnnounceOnChange(invalid ? labels.error : undefined, { liveRegion: true });
  const commit = () => {
    if (draft.length === 0) {
      setInvalid(false);
      setValue(undefined);
      return;
    }
    if (format.isValid(draft)) {
      setInvalid(false);
      setValue(draft);
    } else setInvalid(true);
  };
  return (
    <View>
      <Input
        {...props}
        accessibilityHint={joinAccessibilityText([
          invalid ? labels.error : undefined,
          accessibilityHint,
        ])}
        accessibilityLabel={labels.input}
        inputMode="text"
        onBlur={(event) => {
          commit();
          setEditing(false);
          onBlur?.(event);
        }}
        onChangeText={(text) => {
          setDraft(format.sanitize(text));
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
          style={typeStyle(theme, "bodySmall", "destructive")}
        >
          {labels.error}
        </NativeText>
      ) : null}
    </View>
  );
}

export { useISOTextField };
