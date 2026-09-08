import { type Ref, useState } from "react";

import { StyleSheet, TextInput, type TextInputProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** Props for the token-driven native text input. */
export type InputProps = TextInputProps & {
  readonly disabled?: boolean;
  readonly ref?: Ref<TextInput>;
};

const styles = StyleSheet.create({
  disabled: { opacity: 0.5 },
  input: { borderWidth: 1, minHeight: 40 },
});

/** Accessible single-line React Native text input. */
function Input({
  accessibilityState,
  disabled = false,
  editable,
  onBlur,
  onFocus,
  placeholderTextColor,
  ref,
  style,
  ...props
}: InputProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const isEditable = editable !== false && !disabled;

  return (
    <TextInput
      {...props}
      accessibilityState={{ ...accessibilityState, disabled: !isEditable }}
      editable={isEditable}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      placeholderTextColor={
        placeholderTextColor ?? theme.colors.mutedForeground
      }
      ref={ref}
      style={[
        styles.input,
        theme.typography.scale.bodySmall,
        {
          backgroundColor: theme.colors.background,
          borderColor: focused ? theme.colors.ring : theme.colors.input,
          borderRadius: theme.radius.md,
          color: theme.colors.foreground,
          paddingHorizontal: theme.spacing[3],
          paddingVertical: theme.spacing[2],
        },
        isEditable ? undefined : styles.disabled,
        style,
      ]}
    />
  );
}
Input.displayName = "Input";

export { Input };
