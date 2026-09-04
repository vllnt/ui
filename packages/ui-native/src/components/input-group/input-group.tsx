import type { Ref } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Input, type InputProps } from "../input/input";

/** Props for the native input group frame. */
export type InputGroupProps = ViewProps & { readonly ref?: Ref<View> };
/** Props for a leading or trailing native input addon. */
export type InputGroupAddonProps = ViewProps & {
  readonly align?: "leading" | "trailing";
  readonly ref?: Ref<View>;
};
/** Props for the borderless input inside an input group. */
export type InputGroupInputProps = InputProps;

const styles = StyleSheet.create({
  addon: { alignItems: "center", flexShrink: 0, justifyContent: "center" },
  input: { borderRadius: 0, borderWidth: 0, flex: 1 },
  root: {
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 40,
    overflow: "hidden",
    width: "100%",
  },
});

/** Native frame grouping a text input with adjacent content. */
function InputGroup({ ref, style, ...props }: InputGroupProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      accessibilityRole="none"
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.input,
          borderRadius: theme.radius.md,
        },
        style,
      ]}
    />
  );
}
InputGroup.displayName = "InputGroup";

/** Leading or trailing content inside an input group. */
function InputGroupAddon({
  align = "leading",
  ref,
  style,
  ...props
}: InputGroupAddonProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      ref={ref}
      style={[
        styles.addon,
        align === "leading"
          ? { paddingLeft: theme.spacing[3] }
          : { paddingRight: theme.spacing[3] },
        style,
      ]}
    />
  );
}
InputGroupAddon.displayName = "InputGroupAddon";

/** Borderless text input that fills an input group. */
function InputGroupInput({ ref, style, ...props }: InputGroupInputProps) {
  return <Input {...props} ref={ref} style={[styles.input, style]} />;
}
InputGroupInput.displayName = "InputGroupInput";

export { InputGroup, InputGroupAddon, InputGroupInput };
