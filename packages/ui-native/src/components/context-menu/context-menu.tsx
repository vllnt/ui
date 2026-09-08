"use client";

import type { Ref } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  ModalLayer,
  type ModalLayerCloseReason,
} from "../../primitives/modal-layer";
import type { SelectionKey } from "../../primitives/selection";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useReducedMotion } from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";

/** Stable contextual action shown in a native modal list. */
export type ContextMenuItem = {
  readonly destructive?: boolean;
  readonly disabled?: boolean;
  readonly id: SelectionKey;
  readonly label: string;
};
/** Props for a native contextual action list. */
export type ContextMenuProps = {
  readonly cancelLabel: string;
  readonly defaultOpen?: boolean;
  readonly items: readonly ContextMenuItem[];
  readonly label: string;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onRequestClose?: (reason: ModalLayerCloseReason) => void;
  readonly onSelect?: (id: SelectionKey) => void;
  readonly open?: boolean;
  readonly ref?: Ref<View>;
};

const styles = StyleSheet.create({
  action: { justifyContent: "center", minHeight: 44 },
  content: { flex: 1, justifyContent: "flex-end" },
  surface: { borderTopWidth: 1, maxHeight: "80%", width: "100%" },
});

/** Context menu represented truthfully as a native modal action list. */
function ContextMenu({
  cancelLabel,
  defaultOpen = false,
  items,
  label,
  onOpenChange,
  onRequestClose,
  onSelect,
  open,
  ref,
}: ContextMenuProps) {
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
  const close = (reason: ModalLayerCloseReason) => {
    onRequestClose?.(reason);
    setVisible(false);
  };

  return (
    <ModalLayer
      animationType={reduceMotion ? "none" : "slide"}
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
            borderTopLeftRadius: theme.radius.lg,
            borderTopRightRadius: theme.radius.lg,
            gap: theme.spacing[2],
            padding: theme.spacing[4],
          },
        ]}
      >
        <ScrollView>
          {items.map((item) => (
            <Pressable
              accessibilityLabel={item.label}
              accessibilityRole="menuitem"
              accessibilityState={{ disabled: item.disabled === true }}
              disabled={item.disabled === true}
              key={item.id}
              onPress={() => {
                onSelect?.(item.id);
                setVisible(false);
              }}
              style={({ pressed }) => [
                styles.action,
                {
                  backgroundColor: pressed
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
                  },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <Pressable
          accessibilityLabel={cancelLabel}
          accessibilityRole="button"
          onPress={() => {
            close("requestClose");
          }}
          style={[
            styles.action,
            {
              backgroundColor: theme.colors.secondary,
              borderRadius: theme.radius.md,
              paddingHorizontal: theme.spacing[3],
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
ContextMenu.displayName = "ContextMenu";

export { ContextMenu };
