"use client";

import type { ReactNode, Ref } from "react";
import {
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
import { InteractivePressable } from "../../../primitives/interactive-pressable";
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
  base: { alignItems: "center", justifyContent: "center" },
});

/**
 * Accessible native toggle button exposing its pressed state as `checked`. A
 * pressed toggle also draws a border frame inside its box, so the state reads
 * without colour and the toggle never changes size.
 */
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
    <InteractivePressable
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
      selected={isPressed}
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
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {content}
    </InteractivePressable>
  );
}
Toggle.displayName = "Toggle";

export { Toggle };
