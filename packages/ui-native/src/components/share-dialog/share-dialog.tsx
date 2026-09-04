"use client";

import type { ReactNode, Ref } from "react";
import type { ShareContent, ShareOptions } from "react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  ModalLayer,
  type ModalLayerCloseReason,
  type ModalLayerPresentationProps,
} from "../../primitives/modal-layer";
import {
  defaultPlatformServices,
  type PlatformServiceOverrides,
  type ShareResult,
} from "../../primitives/platform-services";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useReducedMotion } from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";

/** Props for a native share presentation backed by an injectable service. */
export type ShareDialogProps = ModalLayerPresentationProps & {
  readonly cancelLabel: string;
  readonly children?: ReactNode;
  readonly content: ShareContent;
  readonly defaultOpen?: boolean;
  readonly description?: string;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onRequestClose?: (reason: ModalLayerCloseReason) => void;
  readonly onShareError?: (error: unknown) => void;
  readonly onShareResult?: (result: ShareResult) => void;
  readonly open?: boolean;
  readonly options?: ShareOptions;
  readonly ref?: Ref<View>;
  readonly safeArea?: (content: ReactNode) => ReactNode;
  readonly services?: PlatformServiceOverrides;
  readonly shareLabel: string;
  readonly title: string;
  readonly unavailableLabel: string;
};

const styles = StyleSheet.create({
  action: { alignItems: "center", justifyContent: "center", minHeight: 44 },
  actions: { flexDirection: "row", justifyContent: "flex-end" },
  content: { flex: 1, justifyContent: "center" },
  surface: { alignSelf: "center", borderWidth: 1, maxWidth: 560, width: "92%" },
});

/** Native share dialog with truthful unavailable and result states. */
function ShareDialog({
  cancelLabel,
  children,
  content,
  defaultOpen = false,
  description,
  onOpenChange,
  onRequestClose,
  onShareError,
  onShareResult,
  open,
  options,
  ref,
  safeArea,
  services,
  shareLabel,
  title,
  unavailableLabel,
  ...presentationProps
}: ShareDialogProps) {
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
  const shareService =
    services === undefined ? defaultPlatformServices.share : services.share;
  const available = shareService !== undefined;
  const close = (reason: ModalLayerCloseReason) => {
    onRequestClose?.(reason);
    setVisible(false);
  };
  const share = async () => {
    if (!shareService) return;
    try {
      const result = await shareService.share(content, options);
      onShareResult?.(result);
      setVisible(false);
    } catch (error: unknown) {
      onShareError?.(error);
    }
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
        style={[
          styles.surface,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
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
        {available ? null : (
          <Text
            accessibilityLiveRegion="polite"
            style={{ color: theme.colors.mutedForeground }}
          >
            {unavailableLabel}
          </Text>
        )}
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
            <Text style={{ color: theme.colors.secondaryForeground }}>
              {cancelLabel}
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel={available ? shareLabel : unavailableLabel}
            accessibilityRole="button"
            accessibilityState={{ disabled: !available }}
            disabled={!available}
            onPress={() => void share()}
            style={({ pressed }) => [
              styles.action,
              {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.md,
                opacity: available ? (pressed ? 0.8 : 1) : 0.5,
                paddingHorizontal: theme.spacing[4],
              },
            ]}
          >
            <Text
              accessibilityElementsHidden={!available}
              importantForAccessibility={available ? "auto" : "no"}
              style={{ color: theme.colors.primaryForeground }}
            >
              {available ? shareLabel : unavailableLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </ModalLayer>
  );
}
ShareDialog.displayName = "ShareDialog";

export { ShareDialog };
