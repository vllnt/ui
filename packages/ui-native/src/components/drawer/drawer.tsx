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

/** Props for a bottom-anchored native modal drawer. */
export type DrawerProps = {
  readonly children?: ReactNode;
  readonly closeLabel: string;
  readonly defaultOpen?: boolean;
  readonly description?: string;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onRequestClose?: (reason: ModalLayerCloseReason) => void;
  readonly open?: boolean;
  readonly ref?: Ref<View>;
  readonly safeArea?: (content: ReactNode) => ReactNode;
  readonly title: string;
};

const styles = StyleSheet.create({
  close: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  content: { flex: 1, justifyContent: "flex-end" },
  handle: { alignSelf: "center", height: 4, width: 48 },
  surface: { borderTopWidth: 1, width: "100%" },
});

/** Bottom modal presentation; native dismissal maps back to owned open state. */
function Drawer({
  children,
  closeLabel,
  defaultOpen = false,
  description,
  onOpenChange,
  onRequestClose,
  open,
  ref,
  safeArea,
  title,
}: DrawerProps) {
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
      presentationStyle="overFullScreen"
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
            borderTopLeftRadius: theme.radius.lg,
            borderTopRightRadius: theme.radius.lg,
            gap: theme.spacing[4],
            padding: theme.spacing[4],
          },
        ]}
      >
        <View
          accessible={false}
          style={[
            styles.handle,
            {
              backgroundColor: theme.colors.muted,
              borderRadius: theme.radius.full,
            },
          ]}
        />
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
        <Pressable
          accessibilityLabel={closeLabel}
          accessibilityRole="button"
          onPress={() => {
            close("requestClose");
          }}
          style={({ pressed }) => [
            styles.close,
            {
              backgroundColor: theme.colors.secondary,
              borderRadius: theme.radius.md,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={{ color: theme.colors.secondaryForeground }}>
            {closeLabel}
          </Text>
        </Pressable>
      </View>
    </ModalLayer>
  );
}
Drawer.displayName = "Drawer";

export { Drawer };
