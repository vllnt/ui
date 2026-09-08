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

/** Caller-identified segment. */
export type SegmentedControlItem = {
  readonly disabled?: boolean;
  readonly id: string;
  readonly label: string;
};

/** Props for a native single-selection segmented control. */
export type SegmentedControlProps = Omit<ViewProps, "children"> & {
  readonly disabled?: boolean;
  readonly items: readonly SegmentedControlItem[];
  readonly label: string;
  readonly ref?: Ref<View>;
  readonly selection: ControllableStateOptions<string>;
};

const styles = StyleSheet.create({
  item: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
  },
  root: { flexDirection: "row", padding: 4 },
});

/** Native segmented control with radio semantics and 44-point targets. */
function SegmentedControl({
  disabled = false,
  items,
  label,
  ref,
  selection,
  style,
  ...props
}: SegmentedControlProps) {
  const theme = useTheme();
  const [selectedId, setSelectedId] = useControllableState(selection);
  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="radiogroup"
      ref={ref}
      style={[
        styles.root,
        { backgroundColor: theme.colors.muted, borderRadius: theme.radius.lg },
        style,
      ]}
      {...props}
    >
      {items.map((item) => {
        const selected = item.id === selectedId;
        const itemDisabled = disabled || item.disabled === true;
        return (
          <Pressable
            accessibilityLabel={item.label}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled: itemDisabled }}
            disabled={itemDisabled}
            key={item.id}
            onPress={() => {
              setSelectedId(item.id);
            }}
            style={[
              styles.item,
              {
                backgroundColor: selected
                  ? theme.colors.background
                  : theme.colors.muted,
                borderRadius: theme.radius.md,
                opacity: itemDisabled ? 0.5 : 1,
                paddingHorizontal: theme.spacing[3],
              },
            ]}
          >
            <NativeText
              numberOfLines={1}
              style={[
                theme.typography.scale.bodySmall,
                {
                  color: selected
                    ? theme.colors.foreground
                    : theme.colors.mutedForeground,
                  fontWeight: theme.typography.fontWeight.caption,
                },
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
SegmentedControl.displayName = "SegmentedControl";

export { SegmentedControl };
