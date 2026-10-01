"use client";

import type { Ref } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useFocusWhenShown } from "../../../primitives/accessibility";
import {
  ModalLayer,
  type ModalLayerCloseReason,
} from "../../../primitives/modal-layer";
import type { SelectionKey } from "../../../primitives/selection";
import { typeStyle } from "../../../primitives/type-style";
import {
  controllableOptions,
  useControllableState,
} from "../../../primitives/use-controllable-state";
import { useReducedMotion } from "../../../primitives/use-reduced-motion";
import { useTheme } from "../../../theme/theme-provider";

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
  /**
   * Hint spoken on destructive items so their meaning does not rely on
   * colour. Defaults to "Destructive".
   */
  readonly destructiveLabel?: string;
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
  heading: { paddingHorizontal: 12 },
  surface: { borderTopWidth: 1, maxHeight: "80%", width: "100%" },
});

/**
 * Context menu represented truthfully as a native modal action list. The
 * menu `label` renders as the sheet's header and screen readers hear it when
 * the menu opens.
 */
function ContextMenu({
  cancelLabel,
  defaultOpen = false,
  destructiveLabel = "Destructive",
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
    controllableOptions(open, defaultOpen, onOpenChange),
  );
  const headingRef = useFocusWhenShown<Text>(visible);
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
        <Text
          accessibilityRole="header"
          ref={headingRef}
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
          {items.map((item) => (
            <Pressable
              accessibilityHint={
                item.destructive ? destructiveLabel : undefined
              }
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
                style={typeStyle(
                  theme,
                  "bodySmall",
                  item.destructive ? "destructive" : "popoverForeground",
                )}
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
