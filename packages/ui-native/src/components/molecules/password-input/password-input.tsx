import { type Ref, useState } from "react";

import {
  Pressable,
  StyleSheet,
  Text as NativeText,
  type TextInput,
  type TextInputProps,
  View,
} from "react-native";

import { useGroupDisabled } from "../../../primitives/control-group";
import { typeStyle } from "../../../primitives/type-style";
import { useTheme } from "../../../theme/theme-provider";
import { Input } from "../../atoms/input/input";

/** Props for a native password input with a visibility action. */
export type PasswordInputProps = Omit<TextInputProps, "secureTextEntry"> & {
  readonly disabled?: boolean;
  readonly hideLabel?: string;
  readonly ref?: Ref<TextInput>;
  readonly showLabel?: string;
};

const styles = StyleSheet.create({
  input: { flex: 1 },
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
  disabled: ownDisabled = false,
  hideLabel = "Hide password",
  ref,
  showLabel = "Show password",
  style,
  ...props
}: PasswordInputProps) {
  const disabled = useGroupDisabled(ownDisabled);
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [toggleWidth, setToggleWidth] = useState(72);
  const label = visible ? hideLabel : showLabel;

  return (
    <View style={styles.root}>
      <Input
        {...props}
        disabled={disabled}
        ref={ref}
        secureTextEntry={!visible}
        style={[styles.input, { paddingRight: toggleWidth }, style]}
      />
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onLayout={(event) => {
          setToggleWidth(Math.max(72, event.nativeEvent.layout.width));
        }}
        onPress={() => {
          setVisible((previous) => !previous);
        }}
        style={styles.toggle}
      >
        <NativeText
          style={typeStyle(theme, "caption", {
            color: "mutedForeground",
            fontWeight: theme.typography.fontWeight.caption,
          })}
        >
          {label}
        </NativeText>
      </Pressable>
    </View>
  );
}
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
