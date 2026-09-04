"use client";

import type { ReactNode, Ref } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";

import {
  ModalLayer,
  type ModalLayerCloseReason,
  type ModalLayerPresentationProps,
} from "../../primitives/modal-layer";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useReducedMotion } from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";

/** Props for a safe native completion decision dialog. */
export type CompletionDialogProps = ModalLayerPresentationProps & {
  readonly cancelLabel: string;
  readonly closeLabel: string;
  readonly confirmLabel: string;
  readonly defaultOpen?: boolean;
  readonly description?: ReactNode;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onRequestClose?: (reason: ModalLayerCloseReason) => void;
  readonly open?: boolean;
  readonly ref?: Ref<View>;
  readonly safeArea?: (content: ReactNode) => ReactNode;
  readonly surfaceProps?: Omit<ViewProps, "children" | "ref">;
  readonly title: string;
};

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  actions: { flexDirection: "row" },
  backdrop: { flex: 1, justifyContent: "center" },
  close: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
    position: "absolute",
    right: 8,
    top: 8,
  },
  surface: { alignSelf: "center", borderWidth: 1, maxWidth: 480, width: "92%" },
});

/** Native modal handling Android back and accessibility escape through ModalLayer. */
function CompletionDialog({
  cancelLabel,
  closeLabel,
  confirmLabel,
  defaultOpen = false,
  description,
  onCancel,
  onConfirm,
  onOpenChange,
  onRequestClose,
  open,
  ref,
  safeArea,
  surfaceProps,
  title,
  ...presentationProps
}: CompletionDialogProps) {
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
      contentProps={{
        style: [styles.backdrop, { backgroundColor: theme.colors.muted }],
      }}
      keyboardAvoidingViewProps={{ style: styles.backdrop }}
      onClose={close}
      ref={ref}
      safeArea={safeArea}
      visible={visible}
    >
      <View
        {...surfaceProps}
        accessibilityLabel={title}
        style={[
          styles.surface,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            gap: theme.spacing[4],
            padding: theme.spacing[6],
            paddingTop: theme.spacing[8],
          },
          surfaceProps?.style,
        ]}
      >
        <Pressable
          accessibilityLabel={closeLabel}
          accessibilityRole="button"
          onPress={() => {
            close("requestClose");
          }}
          style={styles.close}
        >
          <Text style={{ color: theme.colors.mutedForeground, fontSize: 20 }}>
            ×
          </Text>
        </Pressable>
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
        {description ? (
          <View style={{ gap: theme.spacing[2] }}>{description}</View>
        ) : null}
        <View style={[styles.actions, { gap: theme.spacing[2] }]}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              onCancel();
              setVisible(false);
            }}
            style={({ pressed }) => [
              styles.action,
              {
                backgroundColor: theme.colors.secondary,
                borderRadius: theme.radius.md,
                opacity: pressed ? 0.8 : 1,
                paddingHorizontal: theme.spacing[3],
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
            accessibilityRole="button"
            onPress={() => {
              onConfirm();
              setVisible(false);
            }}
            style={({ pressed }) => [
              styles.action,
              {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.md,
                opacity: pressed ? 0.8 : 1,
                paddingHorizontal: theme.spacing[3],
              },
            ]}
          >
            <Text
              style={[
                theme.typography.scale.bodySmall,
                { color: theme.colors.primaryForeground },
              ]}
            >
              {confirmLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </ModalLayer>
  );
}
CompletionDialog.displayName = "CompletionDialog";

export { CompletionDialog };
