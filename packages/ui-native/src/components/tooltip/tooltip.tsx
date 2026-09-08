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

/** Props for explicit press and accessibility-help tooltip semantics. */
export type TooltipProps = {
  readonly children: ReactNode;
  readonly closeLabel: string;
  readonly defaultOpen?: boolean;
  readonly helpHint: string;
  readonly label: string;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onRequestClose?: (reason: ModalLayerCloseReason) => void;
  readonly open?: boolean;
  readonly ref?: Ref<View>;
  readonly trigger: ReactNode;
  readonly triggerLabel: string;
};

const styles = StyleSheet.create({
  close: { alignItems: "center", justifyContent: "center", minHeight: 44 },
  content: { flex: 1, justifyContent: "center" },
  surface: { alignSelf: "center", borderWidth: 1, maxWidth: 420, width: "88%" },
  trigger: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
});

/**
 * Native help disclosure opened by press. It deliberately does not claim
 * focus or hover behavior when a modal would immediately move focus away.
 */
function Tooltip({
  children,
  closeLabel,
  defaultOpen = false,
  helpHint,
  label,
  onOpenChange,
  onRequestClose,
  open,
  ref,
  trigger,
  triggerLabel,
}: TooltipProps) {
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
    <>
      <Pressable
        accessibilityHint={helpHint}
        accessibilityLabel={triggerLabel}
        accessibilityRole="button"
        accessibilityState={{ expanded: visible }}
        onPress={() => {
          setVisible(!visible);
        }}
        style={({ pressed }) => [
          styles.trigger,
          { opacity: pressed ? 0.8 : 1 },
        ]}
      >
        {typeof trigger === "string" || typeof trigger === "number" ? (
          <Text
            style={[
              theme.typography.scale.bodySmall,
              { color: theme.colors.foreground },
            ]}
          >
            {trigger}
          </Text>
        ) : (
          trigger
        )}
      </Pressable>
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
              gap: theme.spacing[3],
              padding: theme.spacing[4],
            },
          ]}
        >
          <Text
            accessibilityRole="header"
            style={[
              theme.typography.scale.bodySmall,
              {
                color: theme.colors.popoverForeground,
                fontWeight: theme.typography.fontWeight.caption,
              },
            ]}
          >
            {label}
          </Text>
          {typeof children === "string" || typeof children === "number" ? (
            <Text
              style={[
                theme.typography.scale.bodySmall,
                { color: theme.colors.popoverForeground },
              ]}
            >
              {children}
            </Text>
          ) : (
            children
          )}
          <Pressable
            accessibilityLabel={closeLabel}
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
              {closeLabel}
            </Text>
          </Pressable>
        </View>
      </ModalLayer>
    </>
  );
}
Tooltip.displayName = "Tooltip";

export { Tooltip };
