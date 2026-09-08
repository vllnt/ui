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

import type { ControllableStateOptions } from "../../primitives/use-controllable-state";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";

/** Props for a native one-time-code input. */
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
  const [value, setValue] = useControllableState(valueState);
  return (
    <View {...rootProps}>
      <TextInput
        {...props}
        accessibilityLiveRegion={invalid ? "polite" : undefined}
        accessibilityValue={{ text: `${value.length}/${length}` }}
        aria-invalid={invalid}
        inputMode="numeric"
        maxLength={length}
        onChangeText={(nextValue) => {
          setValue(normalizeCode(nextValue, length));
        }}
        ref={ref}
        style={[
          styles.input,
          theme.typography.scale.body,
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
          style={[
            theme.typography.scale.bodySmall,
            { color: theme.colors.destructive },
          ]}
        >
          {errorText}
        </NativeText>
      ) : null}
    </View>
  );
}
InputOTP.displayName = "InputOTP";

export { InputOTP };
