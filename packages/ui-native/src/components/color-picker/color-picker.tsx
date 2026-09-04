"use client";

import type { Ref } from "react";
import {
  Pressable,
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import type { ControllableStateOptions } from "../../primitives/use-controllable-state";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";

/** Host-defined semantic color choice. */
export type ColorChoice = {
  readonly color: string;
  readonly id: string;
  readonly label: string;
};
/** Props for an honest preset-only native color picker. */
export type ColorPickerProps = Omit<ViewProps, "children"> & {
  readonly colors: readonly ColorChoice[];
  readonly disabled?: boolean;
  readonly label: string;
  readonly ref?: Ref<View>;
  readonly selection: ControllableStateOptions<string>;
};

const styles = StyleSheet.create({
  item: { alignItems: "center", flexDirection: "row", minHeight: 44 },
  root: { flexDirection: "row", flexWrap: "wrap" },
  swatch: { borderWidth: 1, height: 28, width: 28 },
});

/** Preset color selector; arbitrary spectrum picking is intentionally unsupported. */
function ColorPicker({
  colors,
  disabled = false,
  label,
  ref,
  selection,
  style,
  ...props
}: ColorPickerProps) {
  const theme = useTheme();
  const [selectedId, setSelectedId] = useControllableState(selection);
  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="radiogroup"
      ref={ref}
      style={[styles.root, { gap: theme.spacing[2] }, style]}
      {...props}
    >
      {colors.map((choice) => {
        const selected = choice.id === selectedId;
        return (
          <Pressable
            accessibilityLabel={choice.label}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled }}
            disabled={disabled}
            key={choice.id}
            onPress={() => {
              setSelectedId(choice.id);
            }}
            style={[
              styles.item,
              { gap: theme.spacing[2], opacity: disabled ? 0.5 : 1 },
            ]}
          >
            <View
              style={[
                styles.swatch,
                {
                  backgroundColor: choice.color,
                  borderColor: selected
                    ? theme.colors.ring
                    : theme.colors.border,
                  borderRadius: theme.radius.full,
                },
              ]}
            />
            <NativeText
              style={[
                theme.typography.scale.bodySmall,
                { color: theme.colors.foreground },
              ]}
            >
              {choice.label}
            </NativeText>
          </Pressable>
        );
      })}
    </View>
  );
}
ColorPicker.displayName = "ColorPicker";

export { ColorPicker };
