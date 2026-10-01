"use client";

import type { Ref } from "react";
import {
  Pressable,
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import { useGroupDisabled } from "../../primitives/control-group";
import { toggleMultipleSelected } from "../../primitives/selection";
import { typeStyle } from "../../primitives/type-style";
import type { ControllableStateOptions } from "../../primitives/use-controllable-state";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";

/** Caller-identified tag. */
export type TagGroupItem = {
  readonly disabled?: boolean;
  readonly id: string;
  readonly label: string;
};
/** Props for a selectable native tag collection. */
export type TagGroupProps = Omit<ViewProps, "children"> & {
  readonly disabled?: boolean;
  readonly items: readonly TagGroupItem[];
  readonly label: string;
  readonly onRemove?: (id: string) => void;
  readonly ref?: Ref<View>;
  readonly removeLabel?: (label: string) => string;
  readonly selection?: ControllableStateOptions<ReadonlySet<string>>;
};

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  item: { alignItems: "center", borderWidth: 1, flexDirection: "row" },
  root: { flexDirection: "row", flexWrap: "wrap" },
});

/**
 * Native tags supporting stable-ID selection and explicit removal. Selectable
 * tags are toggle buttons; the group `label` is spoken as each tag's hint
 * because VoiceOver never reads a label on a non-focusable container.
 */
function TagGroup({
  disabled: ownDisabled = false,
  items,
  label,
  onRemove,
  ref,
  removeLabel,
  selection,
  style,
  ...props
}: TagGroupProps) {
  const disabled = useGroupDisabled(ownDisabled);
  const theme = useTheme();
  const fallbackSelection: ControllableStateOptions<ReadonlySet<string>> = {
    defaultValue: new Set<string>(),
    mode: "uncontrolled",
  };
  const [selectedIds, setSelectedIds] = useControllableState(
    selection ?? fallbackSelection,
  );
  const getId = (item: TagGroupItem) => item.id;
  return (
    <View
      ref={ref}
      style={[styles.root, { gap: theme.spacing[2] }, style]}
      {...props}
    >
      {items.map((item) => {
        const selected = selectedIds.has(item.id);
        const itemDisabled = disabled || item.disabled === true;
        return (
          <View
            key={item.id}
            style={[
              styles.item,
              {
                backgroundColor: selected
                  ? theme.colors.primary
                  : theme.colors.muted,
                borderColor: selected
                  ? theme.colors.primary
                  : theme.colors.border,
                borderRadius: theme.radius.full,
                opacity: itemDisabled ? 0.5 : 1,
              },
            ]}
          >
            {selection ? (
              <Pressable
                accessibilityHint={label}
                accessibilityLabel={item.label}
                accessibilityRole="togglebutton"
                accessibilityState={{
                  checked: selected,
                  disabled: itemDisabled,
                }}
                disabled={itemDisabled}
                onPress={() => {
                  setSelectedIds(
                    toggleMultipleSelected(selectedIds, item, getId),
                  );
                }}
                style={[styles.action, { paddingLeft: theme.spacing[3] }]}
              >
                <NativeText
                  style={typeStyle(
                    theme,
                    "bodySmall",
                    selected ? "primaryForeground" : "foreground",
                  )}
                >
                  {item.label}
                </NativeText>
              </Pressable>
            ) : (
              <View style={[styles.action, { paddingLeft: theme.spacing[3] }]}>
                <NativeText
                  accessibilityHint={label}
                  style={typeStyle(theme, "bodySmall", "foreground")}
                >
                  {item.label}
                </NativeText>
              </View>
            )}
            {onRemove && removeLabel ? (
              <Pressable
                accessibilityLabel={removeLabel(item.label)}
                accessibilityRole="button"
                accessibilityState={{ disabled: itemDisabled }}
                disabled={itemDisabled}
                onPress={() => {
                  onRemove(item.id);
                }}
                style={[styles.action, { paddingRight: theme.spacing[2] }]}
              >
                <NativeText
                  style={{
                    color: selected
                      ? theme.colors.primaryForeground
                      : theme.colors.foreground,
                  }}
                >
                  ×
                </NativeText>
              </Pressable>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
TagGroup.displayName = "TagGroup";

export { TagGroup };
