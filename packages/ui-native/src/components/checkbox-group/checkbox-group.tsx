"use client";

import type { Ref } from "react";
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

/** Caller-identified checkbox item. */
export type CheckboxGroupItem = {
  readonly disabled?: boolean;
  readonly id: string;
  readonly label: string;
};
/** Props for a native checkbox group. */
export type CheckboxGroupProps = Omit<ViewProps, "children"> & {
  readonly disabled?: boolean;
  readonly items: readonly CheckboxGroupItem[];
  readonly label: string;
  readonly orientation?: "horizontal" | "vertical";
  readonly ref?: Ref<View>;
  readonly selection: ControllableStateOptions<ReadonlySet<string>>;
};

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    borderWidth: 1,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  item: { alignItems: "center", flexDirection: "row", minHeight: 44 },
  wrap: { flexWrap: "wrap" },
});

/** Native related-checkbox group backed by stable caller IDs. */
function CheckboxGroup({
  disabled = false,
  items,
  label,
  orientation = "vertical",
  ref,
  selection,
  style,
  ...props
}: CheckboxGroupProps) {
  const theme = useTheme();
  const [selectedIds, setSelectedIds] = useControllableState(selection);
  const getId = (item: CheckboxGroupItem) => item.id;
  return (
    <View
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      ref={ref}
      style={[
        orientation === "horizontal"
          ? [styles.wrap, { flexDirection: "row", gap: theme.spacing[3] }]
          : { gap: theme.spacing[1] },
        style,
      ]}
      {...props}
    >
      {items.map((item) => {
        const checked = selectedIds.has(item.id);
        const itemDisabled = disabled || item.disabled === true;
        return (
          <Pressable
            accessibilityLabel={item.label}
            accessibilityRole="checkbox"
            accessibilityState={{ checked, disabled: itemDisabled }}
            disabled={itemDisabled}
            key={item.id}
            onPress={() => {
              setSelectedIds(toggleMultipleSelected(selectedIds, item, getId));
            }}
            style={[
              styles.item,
              { gap: theme.spacing[2], opacity: itemDisabled ? 0.5 : 1 },
            ]}
          >
            <View
              style={[
                styles.box,
                {
                  backgroundColor: checked
                    ? theme.colors.primary
                    : theme.colors.background,
                  borderColor: checked
                    ? theme.colors.primary
                    : theme.colors.input,
                  borderRadius: theme.radius.sm,
                },
              ]}
            >
              {checked ? (
                <NativeText style={{ color: theme.colors.primaryForeground }}>
                  ✓
                </NativeText>
              ) : null}
            </View>
            <NativeText
              style={[
                theme.typography.scale.bodySmall,
                { color: theme.colors.foreground },
              ]}
            >
              {item.label}
            </NativeText>
          </Pressable>
        );
      })}
    </View>
  );
}
CheckboxGroup.displayName = "CheckboxGroup";

export { CheckboxGroup };
