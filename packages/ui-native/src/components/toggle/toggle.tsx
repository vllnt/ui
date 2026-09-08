"use client";

import type { ReactNode, Ref } from "react";
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  Text as NativeText,
  type View,
} from "react-native";

import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";

/** Native visual treatments for a toggle action. */
export type ToggleVariant = "default" | "outline";

/** Props for a controlled or uncontrolled native toggle button. */
export type ToggleProps = Omit<PressableProps, "children"> & {
  readonly children: ReactNode;
  readonly defaultPressed?: boolean;
  readonly onPressedChange?: (pressed: boolean) => void;
  readonly pressed?: boolean;
  readonly ref?: Ref<View>;
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

/** Accessible native toggle action with selected-state semantics. */
function Toggle({
  accessibilityState,
  children,
  defaultPressed = false,
  disabled = false,
  onPress,
  onPressedChange,
  pressed,
  ref,
  style,
  variant = "default",
  ...props
}: ToggleProps) {
  const theme = useTheme();
  const [isPressed, setIsPressed] = useControllableState(
    pressed === undefined
      ? {
          defaultValue: defaultPressed,
          mode: "uncontrolled",
          onChange: onPressedChange,
        }
      : { mode: "controlled", onChange: onPressedChange, value: pressed },
  );
  const content =
    typeof children === "number" || typeof children === "string" ? (
      <NativeText
        style={[
          theme.typography.scale.bodySmall,
          {
            color: isPressed
              ? theme.colors.accentForeground
              : theme.colors.foreground,
            fontWeight: theme.typography.fontWeight.caption,
          },
        ]}
      >
        {children}
      </NativeText>
    ) : (
      children
    );

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{
        ...accessibilityState,
        disabled: disabled ?? undefined,
        selected: isPressed,
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
          paddingHorizontal: theme.spacing[3],
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
