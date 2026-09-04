import { type Ref, useState } from "react";

import {
  Pressable,
  StyleSheet,
  Text as NativeText,
  type TextInput,
  type TextInputProps,
  View,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Input } from "../input/input";

/** Props for a native password input with a visibility action. */
export type PasswordInputProps = Omit<TextInputProps, "secureTextEntry"> & {
  readonly disabled?: boolean;
  readonly hideLabel?: string;
  readonly ref?: Ref<TextInput>;
  readonly showLabel?: string;
};

const styles = StyleSheet.create({
  input: { flex: 1, paddingRight: 72 },
  root: { justifyContent: "center", width: "100%" },
  toggle: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    minWidth: 64,
    position: "absolute",
    right: 0,
    top: 0,
  },
});

/** Native secure text input with an explicit show or hide action. */
function PasswordInput({
  disabled = false,
  hideLabel = "Hide password",
  ref,
  showLabel = "Show password",
  style,
  ...props
}: PasswordInputProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const label = visible ? hideLabel : showLabel;

  return (
    <View style={styles.root}>
      <Input
        {...props}
        disabled={disabled}
        ref={ref}
        secureTextEntry={!visible}
        style={[styles.input, style]}
      />
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => {
          setVisible((previous) => !previous);
        }}
        style={styles.toggle}
      >
        <NativeText
          style={[
            theme.typography.scale.caption,
            {
              color: theme.colors.mutedForeground,
              fontWeight: theme.typography.fontWeight.caption,
            },
          ]}
        >
          {visible ? "Hide" : "Show"}
        </NativeText>
      </Pressable>
    </View>
  );
}
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
