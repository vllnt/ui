"use client";

import type { ReactNode, Ref } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  ModalLayer,
  type ModalLayerCloseReason,
} from "../../primitives/modal-layer";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useReducedMotion } from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";

/** Props for a native modal popover surface. */
export type PopoverProps = {
  readonly cancelLabel: string;
  readonly children?: ReactNode;
  readonly defaultOpen?: boolean;
  readonly description?: string;
  readonly label: string;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onRequestClose?: (reason: ModalLayerCloseReason) => void;
  readonly open?: boolean;
  readonly ref?: Ref<View>;
};

const styles = StyleSheet.create({
  close: { alignItems: "center", justifyContent: "center", minHeight: 44 },
  content: { flex: 1, justifyContent: "center" },
  surface: {
    alignSelf: "center",
    borderWidth: 1,
    maxHeight: "80%",
    maxWidth: 560,
    width: "92%",
  },
});

/** Native popover represented as a modal surface, not browser positioning. */
function Popover({
  cancelLabel,
  children,
  defaultOpen = false,
  description,
  label,
  onOpenChange,
  onRequestClose,
  open,
  ref,
}: PopoverProps) {
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
      animationType={reduceMotion ? "none" : "fade"}
      contentProps={{ style: styles.content }}
      keyboardAvoidingViewProps={{ style: styles.content }}
      onClose={close}
      ref={ref}
      visible={visible}
    >
      <View
        accessibilityLabel={label}
        style={[
          styles.surface,
          {
            backgroundColor: theme.colors.popover,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            gap: theme.spacing[4],
            padding: theme.spacing[4],
          },
        ]}
      >
        <Text
          accessibilityRole="header"
          style={[
            theme.typography.scale.bodyLarge,
            {
              color: theme.colors.popoverForeground,
              fontWeight: theme.typography.fontWeight.heading,
            },
          ]}
        >
          {label}
        </Text>
        {description ? (
          <Text
            style={[
              theme.typography.scale.bodySmall,
              { color: theme.colors.mutedForeground },
            ]}
          >
            {description}
          </Text>
        ) : null}
        {children}
        <Pressable
          accessibilityLabel={cancelLabel}
          accessibilityRole="button"
          onPress={() => {
            close("requestClose");
          }}
          style={[
            styles.close,
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
Popover.displayName = "Popover";

export { Popover };
