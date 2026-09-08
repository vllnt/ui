import type { ButtonSize, ButtonVariant } from "@vllnt/ui-core";
import type { Ref } from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  Text as NativeText,
  type TextStyle,
  type View,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

import { resolveButtonStyles } from "./button-styles";

/** Props for the React Native Button renderer. */
export type ButtonProps = Omit<PressableProps, "children"> & {
  /** Native text content styled for the selected semantic variant. */
  readonly children: number | string;
  readonly ref?: Ref<View>;
  readonly size?: ButtonSize;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly variant?: ButtonVariant;
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    textAlign: "center",
  },
});

/** Accessible native action with the same semantic variants as the web Button. */
function Button({
  accessibilityLabel,
  accessibilityState,
  children,
  disabled = false,
  ref,
  size = "default",
  style,
  textStyle,
  variant = "default",
  ...props
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled === true;
  const resolved = resolveButtonStyles(theme, variant, size);
  const content = (
    <NativeText
      style={[
        styles.text,
        theme.typography.scale.bodySmall,
        { fontWeight: theme.typography.fontWeight.caption },
        resolved.text,
        textStyle,
      ]}
    >
      {children}
    </NativeText>
  );

  return (
    <Pressable
      {...props}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, disabled: isDisabled }}
      disabled={isDisabled}
      ref={ref}
      style={(state) => [
        styles.base,
        { borderRadius: theme.radius.md, gap: theme.spacing[2] },
        resolved.container,
        state.pressed ? styles.pressed : undefined,
        isDisabled ? styles.disabled : undefined,
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {content}
    </Pressable>
  );
}
Button.displayName = "Button";

export { Button };
