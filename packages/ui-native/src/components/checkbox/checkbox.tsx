"use client";

import type { Ref } from "react";
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  Text as NativeText,
  type View as NativeView,
  View,
} from "react-native";

import { decorativeProps } from "../../primitives/accessibility";
import { typeStyle } from "../../primitives/type-style";
import {
  controllableOptions,
  useControllableState,
} from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";

/** Checked values supported by the native checkbox. */
export type CheckboxCheckedState = "indeterminate" | boolean;

/**
 * Props for a controlled or uncontrolled native checkbox. Name it with
 * `label` (visible, part of the touch target) or `accessibilityLabel`.
 */
export type CheckboxProps = Omit<PressableProps, "children"> & {
  readonly checked?: CheckboxCheckedState;
  readonly defaultChecked?: CheckboxCheckedState;
  /** Visible label rendered beside the box; also the accessible name. */
  readonly label?: string;
  readonly onCheckedChange?: (checked: CheckboxCheckedState) => void;
  readonly ref?: Ref<NativeView>;
};

const styles = StyleSheet.create({
  indicator: {
    alignItems: "center",
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  root: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  withLabel: { flexDirection: "row", justifyContent: "flex-start" },
});

/** Accessible native checkbox with truthful mixed-state exposure. */
function Checkbox({
  accessibilityLabel,
  accessibilityState,
  checked,
  defaultChecked = false,
  disabled = false,
  label,
  onCheckedChange,
  onPress,
  ref,
  style,
  ...props
}: CheckboxProps) {
  const theme = useTheme();
  const [current, setCurrent] = useControllableState(
    controllableOptions(checked, defaultChecked, onCheckedChange),
  );
  const selected = current !== false;

  return (
    <Pressable
      {...props}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="checkbox"
      accessibilityState={{
        ...accessibilityState,
        checked: current === "indeterminate" ? "mixed" : current,
        disabled: disabled ?? undefined,
      }}
      disabled={disabled}
      onPress={(event) => {
        onPress?.(event);
        if (!event?.defaultPrevented) setCurrent(current !== true);
      }}
      ref={ref}
      style={(state) => [
        styles.root,
        label ? [styles.withLabel, { gap: theme.spacing[2] }] : undefined,
        { opacity: disabled ? 0.5 : state.pressed ? 0.8 : 1 },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      <View
        {...decorativeProps}
        style={[
          styles.indicator,
          {
            backgroundColor: selected
              ? theme.colors.primary
              : theme.colors.background,
            borderColor: selected ? theme.colors.primary : theme.colors.input,
            borderRadius: theme.radius.sm,
            borderWidth: 1,
          },
        ]}
      >
        {selected ? (
          <NativeText
            style={{
              color: theme.colors.primaryForeground,
              fontWeight: theme.typography.fontWeight.caption,
            }}
          >
            {current === "indeterminate" ? "−" : "✓"}
          </NativeText>
        ) : null}
      </View>
      {label ? (
        <NativeText style={typeStyle(theme, "bodySmall", "foreground")}>
          {label}
        </NativeText>
      ) : null}
    </Pressable>
  );
}
Checkbox.displayName = "Checkbox";

export { Checkbox };
