"use client";

import type { Ref } from "react";
import {
  StyleSheet,
  Text as NativeText,
  TextInput,
  type TextInputProps,
  View,
  type ViewProps,
} from "react-native";

import {
  joinAccessibilityText,
  useAnnounceOnChange,
} from "../../../primitives/accessibility";
import { useGroupDisabled } from "../../../primitives/control-group";
import { typeStyle } from "../../../primitives/type-style";
import type { ControllableStateOptions } from "../../../primitives/use-controllable-state";
import { useControllableState } from "../../../primitives/use-controllable-state";
import { useTheme } from "../../../theme/theme-provider";

/**
 * Props for a native one-time-code input. `accessibilityLabel` defaults to
 * "One-time code"; pass a localized name. The entered count and the error are
 * spoken as the hint so the typed digits stay the field's value.
 */
export type InputOTPProps = Omit<
  TextInputProps,
  "defaultValue" | "maxLength" | "onChangeText" | "value"
> & {
  readonly errorText?: string;
  readonly invalid?: boolean;
  readonly length: number;
  readonly ref?: Ref<TextInput>;
  readonly rootProps?: ViewProps;
  readonly valueState: ControllableStateOptions<string>;
};

const styles = StyleSheet.create({
  input: { borderWidth: 1, minHeight: 44, textAlign: "center", width: "100%" },
});

function normalizeCode(value: string, length: number): string {
  return value.replaceAll(/\D/g, "").slice(0, length);
}

/** Native numeric OTP editor with system one-time-code autofill semantics. */
function InputOTP({
  accessibilityHint,
  accessibilityLabel = "One-time code",
  errorText,
  invalid = false,
  length,
  ref,
  rootProps,
  style,
  valueState,
  ...props
}: InputOTPProps) {
  const theme = useTheme();
  const locked = useGroupDisabled(props.editable === false);
  const [value, setValue] = useControllableState(valueState);
  const error = invalid ? errorText : undefined;
  useAnnounceOnChange(error, { liveRegion: true });
  return (
    <View {...rootProps}>
      <TextInput
        {...props}
        accessibilityHint={joinAccessibilityText([
          error,
          `${value.length}/${length}`,
          accessibilityHint,
        ])}
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: locked, ...props.accessibilityState }}
        editable={!locked}
        inputMode="numeric"
        maxLength={length}
        onChangeText={(nextValue) => {
          setValue(normalizeCode(nextValue, length));
        }}
        ref={ref}
        style={[
          styles.input,
          theme.typography.scale.body,
          locked ? { opacity: 0.5 } : undefined,
          {
            backgroundColor: theme.colors.background,
            borderColor: invalid
              ? theme.colors.destructive
              : theme.colors.input,
            borderRadius: theme.radius.md,
            color: theme.colors.foreground,
            letterSpacing: theme.spacing[3],
            paddingHorizontal: theme.spacing[3],
          },
          style,
        ]}
        textContentType="oneTimeCode"
        value={value}
      />
      {invalid && errorText ? (
        <NativeText
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          style={typeStyle(theme, "bodySmall", "destructive")}
        >
          {errorText}
        </NativeText>
      ) : null}
    </View>
  );
}
InputOTP.displayName = "InputOTP";

export { InputOTP };
