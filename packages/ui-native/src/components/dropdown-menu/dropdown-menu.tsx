"use client";

import type { Ref } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAnnounceOnChange } from "../../primitives/accessibility";
import {
  ModalLayer,
  type ModalLayerCloseReason,
} from "../../primitives/modal-layer";
import {
  isSingleSelected,
  type SelectionKey,
  selectSingle,
} from "../../primitives/selection";
import { typeStyle } from "../../primitives/type-style";
import {
  controllableOptions,
  useControllableState,
} from "../../primitives/use-controllable-state";
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
  /**
   * Hint spoken on destructive items so their meaning does not rely on
   * colour. Defaults to "Destructive".
   */
  readonly destructiveLabel?: string;
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
  heading: { paddingHorizontal: 12, paddingTop: 4 },
  item: { justifyContent: "center", minHeight: 44 },
  surface: {
    alignSelf: "center",
    borderWidth: 1,
    maxHeight: "80%",
    maxWidth: 560,
    width: "92%",
  },
});

/**
 * Modal list interpretation of a dropdown for native platforms. The menu
 * `label` renders as the sheet's header and screen readers hear it when the
 * menu opens.
 */
function DropdownMenu({
  cancelLabel,
  defaultOpen = false,
  defaultSelectedId,
  destructiveLabel = "Destructive",
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
    controllableOptions(open, defaultOpen, onOpenChange),
  );
  const [selection, setSelection] = useControllableState(
    controllableOptions(selectedId, defaultSelectedId),
  );
  useAnnounceOnChange(visible ? label : undefined, { initial: true });
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
        <Text
          accessibilityRole="header"
          style={[
            styles.heading,
            ...typeStyle(theme, "bodySmall", {
              color: "popoverForeground",
              fontWeight: theme.typography.fontWeight.heading,
            }),
          ]}
        >
          {label}
        </Text>
        <ScrollView>
          {items.map((item) => {
            const selected = isSingleSelected(selection, item, getItemId);
            return (
              <Pressable
                accessibilityHint={
                  item.destructive ? destructiveLabel : undefined
                }
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
                  style={typeStyle(theme, "bodySmall", {
                    color: item.destructive
                      ? "destructive"
                      : "popoverForeground",
                    fontWeight: selected
                      ? theme.typography.fontWeight.caption
                      : theme.typography.fontWeight.body,
                  })}
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
