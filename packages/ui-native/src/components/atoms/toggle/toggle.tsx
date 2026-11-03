"use client";

import type { ReactNode, Ref } from "react";
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  Text as NativeText,
  type View,
} from "react-native";

import { useGroupDisabled } from "../../../primitives/control-group";
import {
  type ControlSize,
  controlSizeStyle,
} from "../../../primitives/control-size";
import { typeStyle } from "../../../primitives/type-style";
import {
  controllableOptions,
  useControllableState,
} from "../../../primitives/use-controllable-state";
import { useTheme } from "../../../theme/theme-provider";

/** Native visual treatments for a toggle action. */
export type ToggleVariant = "default" | "outline";

/** Native size scale of a toggle; targets stay at least 44 points. */
export type ToggleSize = ControlSize;

/** Props for a controlled or uncontrolled native toggle button. */
export type ToggleProps = Omit<PressableProps, "children"> & {
  readonly children: ReactNode;
  readonly defaultPressed?: boolean;
  readonly onPressedChange?: (pressed: boolean) => void;
  readonly pressed?: boolean;
  readonly ref?: Ref<View>;
  readonly size?: ToggleSize;
  readonly variant?: ToggleVariant;
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.8 },
});

/** Accessible native toggle button exposing its pressed state as `checked`. */
function Toggle({
  accessibilityState,
  children,
  defaultPressed = false,
  disabled: ownDisabled = false,
  onPress,
  onPressedChange,
  pressed,
  ref,
  size = "default",
  style,
  variant = "default",
  ...props
}: ToggleProps) {
  const disabled = useGroupDisabled(ownDisabled);
  const theme = useTheme();
  const [isPressed, setIsPressed] = useControllableState(
    controllableOptions(pressed, defaultPressed, onPressedChange),
  );
  const content =
    typeof children === "number" || typeof children === "string" ? (
      <NativeText
        style={typeStyle(theme, "bodySmall", {
          color: isPressed ? "accentForeground" : "foreground",
          fontWeight: theme.typography.fontWeight.caption,
        })}
      >
        {children}
      </NativeText>
    ) : (
      children
    );

  return (
    <Pressable
      {...props}
      accessibilityRole="togglebutton"
      accessibilityState={{
        ...accessibilityState,
        checked: isPressed,
        disabled: disabled ?? undefined,
      }}
      disabled={disabled}
      onPress={(event) => {
        onPress?.(event);
        if (!event?.defaultPrevented) setIsPressed(!isPressed);
      }}
      ref={ref}
      style={(state) => [
        styles.base,
        {
          backgroundColor: isPressed ? theme.colors.accent : "transparent",
          borderColor: theme.colors.input,
          borderRadius: theme.radius.md,
          borderWidth: variant === "outline" ? 1 : 0,
          ...controlSizeStyle(theme, size),
          paddingVertical: theme.spacing[2],
        },
        state.pressed ? styles.pressed : undefined,
        disabled ? styles.disabled : undefined,
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {content}
    </Pressable>
  );
}
Toggle.displayName = "Toggle";

export { Toggle };
