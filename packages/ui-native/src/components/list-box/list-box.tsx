"use client";

import { type Ref, useMemo } from "react";

import {
  Pressable,
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import { toggleMultipleSelected } from "../../primitives/selection";
import type { ControllableStateOptions } from "../../primitives/use-controllable-state";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";

/** Caller-identified option displayed by ListBox. */
export type ListBoxOption = {
  readonly disabled?: boolean;
  readonly id: string;
  readonly label: string;
};

/** Props for a native single- or multiple-selection list. */
export type ListBoxProps = Omit<ViewProps, "children"> & {
  readonly disabled?: boolean;
  readonly label: string;
  readonly mode?: "multiple" | "single";
  readonly options: readonly ListBoxOption[];
  readonly ref?: Ref<View>;
  readonly selection: ControllableStateOptions<ReadonlySet<string>>;
};

const styles = StyleSheet.create({
  option: { justifyContent: "center", minHeight: 44 },
  root: { borderWidth: 1, overflow: "hidden" },
});

/** Accessible native list whose selection is keyed only by caller IDs. */
function ListBox({
  disabled = false,
  label,
  mode = "single",
  options,
  ref,
  selection,
  style,
  ...props
}: ListBoxProps) {
  const theme = useTheme();
  const [selectedIds, setSelectedIds] = useControllableState(selection);
  const getId = useMemo(() => (option: ListBoxOption) => option.id, []);

  return (
    <View
      {...props}
      accessibilityLabel={label}
      accessibilityRole={mode === "single" ? "radiogroup" : "list"}
      accessibilityState={{ disabled }}
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
    >
      {options.map((option) => {
        const selected = selectedIds.has(option.id);
        const optionDisabled = disabled || option.disabled === true;
        return (
          <Pressable
            accessibilityLabel={option.label}
            accessibilityRole={mode === "single" ? "radio" : "checkbox"}
            accessibilityState={{
              checked: selected,
              disabled: optionDisabled,
              selected,
            }}
            disabled={optionDisabled}
            key={option.id}
            onPress={() => {
              if (mode === "single") {
                setSelectedIds(new Set([option.id]));
              } else {
                setSelectedIds(
                  toggleMultipleSelected(selectedIds, option, getId),
                );
              }
            }}
            style={[
              styles.option,
              {
                backgroundColor: selected
                  ? theme.colors.accent
                  : theme.colors.background,
                opacity: optionDisabled ? 0.5 : 1,
                paddingHorizontal: theme.spacing[3],
              },
            ]}
          >
            <NativeText
              style={[
                theme.typography.scale.bodySmall,
                { color: theme.colors.foreground },
              ]}
            >
              {selected ? "✓ " : ""}
              {option.label}
            </NativeText>
          </Pressable>
        );
      })}
    </View>
  );
}
ListBox.displayName = "ListBox";

export { ListBox };
