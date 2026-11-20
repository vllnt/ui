"use client";

import type { Ref } from "react";
import {
  type PressableProps,
  StyleSheet,
  Text as NativeText,
  type View as NativeView,
  View,
} from "react-native";

import {
  decorativeProps,
  requiredHint,
} from "../../../primitives/accessibility";
import { useGroupDisabled } from "../../../primitives/control-group";
import { InteractivePressable } from "../../../primitives/interactive-pressable";
import { typeStyle } from "../../../primitives/type-style";
import {
  controllableOptions,
  useControllableState,
} from "../../../primitives/use-controllable-state";
import { useTheme } from "../../../theme/theme-provider";

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
  /**
   * Marks the checkbox as required. Screen readers hear it in the hint; web
   * draws no visible marker for it, so neither does native.
   */
  readonly required?: boolean;
  /** Spoken word for `required`. Defaults to "Required". */
  readonly requiredLabel?: string;
};

const styles = StyleSheet.create({
  indicator: {
    alignItems: "center",
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  root: { alignItems: "center", justifyContent: "center" },
  withLabel: { flexDirection: "row", justifyContent: "flex-start" },
});

/**
 * Accessible native checkbox with truthful mixed-state exposure. Its mark
 * (a check or a dash) is the selection cue that does not rely on colour.
 */
function Checkbox({
  accessibilityHint,
  accessibilityLabel,
  accessibilityState,
  checked,
  defaultChecked = false,
  disabled: ownDisabled = false,
  label,
  onCheckedChange,
  onPress,
  ref,
  required,
  requiredLabel,
  style,
  ...props
}: CheckboxProps) {
  const disabled = useGroupDisabled(ownDisabled);
  const theme = useTheme();
  const [current, setCurrent] = useControllableState(
    controllableOptions(checked, defaultChecked, onCheckedChange),
  );
  const selected = current !== false;

  return (
    <InteractivePressable
      {...props}
      accessibilityHint={requiredHint(
        accessibilityHint,
        required,
        requiredLabel,
      )}
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
        { borderRadius: theme.radius.md },
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
        <NativeText
          style={typeStyle(theme, "bodySmall", {
            color: "foreground",
            flexShrink: 1,
          })}
        >
          {label}
        </NativeText>
      ) : null}
    </InteractivePressable>
  );
}
Checkbox.displayName = "Checkbox";

export { Checkbox };
