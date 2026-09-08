"use client";

import type { ReactNode, Ref } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  ModalLayer,
  type ModalLayerCloseReason,
  type ModalLayerPresentationProps,
} from "../../primitives/modal-layer";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useReducedMotion } from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";

/** Props for a native confirmation alert. */
export type AlertDialogProps = ModalLayerPresentationProps & {
  readonly actionDisabled?: boolean;
  readonly actionLabel: string;
  readonly cancelLabel: string;
  readonly children?: ReactNode;
  readonly defaultOpen?: boolean;
  readonly description: string;
  readonly destructive?: boolean;
  readonly onAction: () => void;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onRequestClose?: (reason: ModalLayerCloseReason) => void;
  readonly open?: boolean;
  readonly ref?: Ref<View>;
  readonly safeArea?: (content: ReactNode) => ReactNode;
  readonly title: string;
};

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  content: { flex: 1, justifyContent: "center" },
  disabled: { opacity: 0.5 },
  surface: {
    alignSelf: "center",
    borderWidth: 1,
    maxWidth: 560,
    width: "92%",
  },
});

/** Native destructive or neutral confirmation with explicit action ownership. */
function AlertDialog({
  actionDisabled = false,
  actionLabel,
  cancelLabel,
  children,
  defaultOpen = false,
  description,
  destructive = true,
  onAction,
  onOpenChange,
  onRequestClose,
  open,
  ref,
  safeArea,
  title,
  ...presentationProps
}: AlertDialogProps) {
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
      {...presentationProps}
      animationType={
        reduceMotion ? "none" : (presentationProps.animationType ?? "fade")
      }
      contentProps={{ style: styles.content }}
      keyboardAvoidingViewProps={{ style: styles.content }}
      onClose={close}
      ref={ref}
      safeArea={safeArea}
      visible={visible}
    >
      <View
        accessibilityLabel={title}
        accessibilityRole="alert"
        style={[
          styles.surface,
          {
            backgroundColor: theme.colors.background,
            borderColor: destructive
              ? theme.colors.destructive
              : theme.colors.border,
            borderRadius: theme.radius.md,
            gap: theme.spacing[4],
            padding: theme.spacing[6],
          },
        ]}
      >
        <Text
          accessibilityRole="header"
          style={[
            theme.typography.scale.bodyLarge,
            {
              color: theme.colors.foreground,
              fontWeight: theme.typography.fontWeight.heading,
            },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            theme.typography.scale.bodySmall,
            { color: theme.colors.mutedForeground },
          ]}
        >
          {description}
        </Text>
        {children}
        <View style={[styles.actions, { gap: theme.spacing[2] }]}>
          <Pressable
            accessibilityLabel={cancelLabel}
            accessibilityRole="button"
            onPress={() => {
              close("requestClose");
            }}
            style={({ pressed }) => [
              styles.action,
              {
                backgroundColor: theme.colors.secondary,
                borderRadius: theme.radius.md,
                opacity: pressed ? 0.8 : 1,
                paddingHorizontal: theme.spacing[4],
              },
            ]}
          >
            <Text
              style={[
                theme.typography.scale.bodySmall,
                { color: theme.colors.secondaryForeground },
              ]}
            >
              {cancelLabel}
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel={actionLabel}
            accessibilityRole="button"
            accessibilityState={{ disabled: actionDisabled }}
            disabled={actionDisabled}
            onPress={() => {
              onAction();
              setVisible(false);
            }}
            style={({ pressed }) => [
              styles.action,
              {
                backgroundColor: destructive
                  ? theme.colors.destructive
                  : theme.colors.primary,
                borderRadius: theme.radius.md,
                opacity: pressed ? 0.8 : 1,
                paddingHorizontal: theme.spacing[4],
              },
              actionDisabled ? styles.disabled : undefined,
            ]}
          >
            <Text
              style={[
                theme.typography.scale.bodySmall,
                {
                  color: destructive
                    ? theme.colors.destructiveForeground
                    : theme.colors.primaryForeground,
                  fontWeight: theme.typography.fontWeight.caption,
                },
              ]}
            >
              {actionLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </ModalLayer>
  );
}
AlertDialog.displayName = "AlertDialog";

export { AlertDialog };
