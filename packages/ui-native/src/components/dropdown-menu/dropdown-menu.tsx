"use client";

import type { Ref } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  ModalLayer,
  type ModalLayerCloseReason,
} from "../../primitives/modal-layer";
import {
  isSingleSelected,
  type SelectionKey,
  selectSingle,
} from "../../primitives/selection";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useReducedMotion } from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";

/** Stable native dropdown item. */
export type DropdownMenuItem = {
  readonly destructive?: boolean;
  readonly disabled?: boolean;
  readonly id: SelectionKey;
  readonly label: string;
};
/** Props for a modal native dropdown list. */
export type DropdownMenuProps = {
  readonly cancelLabel: string;
  readonly defaultOpen?: boolean;
  readonly defaultSelectedId?: SelectionKey;
  readonly items: readonly DropdownMenuItem[];
  readonly label: string;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onRequestClose?: (reason: ModalLayerCloseReason) => void;
  readonly onSelect?: (id: SelectionKey) => void;
  readonly open?: boolean;
  readonly ref?: Ref<View>;
  readonly selectedId?: SelectionKey;
};

const getItemId = (item: DropdownMenuItem) => item.id;
const styles = StyleSheet.create({
  cancel: { alignItems: "center", justifyContent: "center", minHeight: 44 },
  content: { flex: 1, justifyContent: "center" },
  item: { justifyContent: "center", minHeight: 44 },
  surface: {
    alignSelf: "center",
    borderWidth: 1,
    maxHeight: "80%",
    maxWidth: 560,
    width: "92%",
  },
});

/** Modal list interpretation of a dropdown for native platforms. */
function DropdownMenu({
  cancelLabel,
  defaultOpen = false,
  defaultSelectedId,
  items,
  label,
  onOpenChange,
  onRequestClose,
  onSelect,
  open,
  ref,
  selectedId,
}: DropdownMenuProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useControllableState(
    open === undefined
      ? {
          defaultValue: defaultOpen,
          mode: "uncontrolled",
          onChange: onOpenChange,
        }
      : { mode: "controlled", onChange: onOpenChange, value: open },
  );
  const [selection, setSelection] = useControllableState(
    selectedId === undefined
      ? { defaultValue: defaultSelectedId, mode: "uncontrolled" }
      : { mode: "controlled", value: selectedId },
  );
  const close = (reason: ModalLayerCloseReason) => {
    onRequestClose?.(reason);
    setVisible(false);
  };

  return (
    <ModalLayer
      animationType={reduceMotion ? "none" : "fade"}
      contentProps={{ style: styles.content }}
      keyboardAvoidingViewProps={{ style: styles.content }}
      onClose={close}
      ref={ref}
      visible={visible}
    >
      <View
        accessibilityLabel={label}
        accessibilityRole="menu"
        style={[
          styles.surface,
          {
            backgroundColor: theme.colors.popover,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            gap: theme.spacing[2],
            padding: theme.spacing[2],
          },
        ]}
      >
        <ScrollView>
          {items.map((item) => {
            const selected = isSingleSelected(selection, item, getItemId);
            return (
              <Pressable
                accessibilityLabel={item.label}
                accessibilityRole="menuitem"
                accessibilityState={{
                  disabled: item.disabled === true,
                  selected,
                }}
                disabled={item.disabled === true}
                key={item.id}
                onPress={() => {
                  setSelection(selectSingle(selection, item, getItemId));
                  onSelect?.(item.id);
                  setVisible(false);
                }}
                style={({ pressed }) => [
                  styles.item,
                  {
                    backgroundColor:
                      selected || pressed
                        ? theme.colors.accent
                        : theme.colors.popover,
                    borderRadius: theme.radius.sm,
                    opacity: item.disabled ? 0.5 : 1,
                    paddingHorizontal: theme.spacing[3],
                  },
                ]}
              >
                <Text
                  style={[
                    theme.typography.scale.bodySmall,
                    {
                      color: item.destructive
                        ? theme.colors.destructive
                        : theme.colors.popoverForeground,
                      fontWeight: selected
                        ? theme.typography.fontWeight.caption
                        : theme.typography.fontWeight.body,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable
          accessibilityLabel={cancelLabel}
          accessibilityRole="button"
          onPress={() => {
            close("requestClose");
          }}
          style={[
            styles.cancel,
            {
              backgroundColor: theme.colors.secondary,
              borderRadius: theme.radius.md,
            },
          ]}
        >
          <Text style={{ color: theme.colors.secondaryForeground }}>
            {cancelLabel}
          </Text>
        </Pressable>
      </View>
    </ModalLayer>
  );
}
DropdownMenu.displayName = "DropdownMenu";

export { DropdownMenu };
