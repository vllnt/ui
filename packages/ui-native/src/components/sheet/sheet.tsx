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

/** Native sheet edge. */
export type SheetSide = "bottom" | "left" | "right" | "top";
/** Props for an edge-anchored native modal sheet. */
export type SheetProps = {
  readonly children?: ReactNode;
  readonly closeLabel: string;
  readonly defaultOpen?: boolean;
  readonly description?: string;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onRequestClose?: (reason: ModalLayerCloseReason) => void;
  readonly open?: boolean;
  readonly ref?: Ref<View>;
  readonly safeArea?: (content: ReactNode) => ReactNode;
  readonly side?: SheetSide;
  readonly title: string;
};

const styles = StyleSheet.create({
  close: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  content: { flex: 1 },
  horizontal: { height: "100%", width: "82%" },
  surface: { borderWidth: 1 },
  vertical: { maxHeight: "82%", width: "100%" },
});

/** Edge modal presentation without browser-positioning or focus-trap claims. */
function Sheet({
  children,
  closeLabel,
  defaultOpen = false,
  description,
  onOpenChange,
  onRequestClose,
  open,
  ref,
  safeArea,
  side = "right",
  title,
}: SheetProps) {
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
  const horizontal = side === "left" || side === "right";

  return (
    <ModalLayer
      animationType={reduceMotion ? "none" : "slide"}
      contentProps={{
        style: [
          styles.content,
          {
            alignItems:
              side === "left"
                ? "flex-start"
                : side === "right"
                  ? "flex-end"
                  : "stretch",
            justifyContent:
              side === "top"
                ? "flex-start"
                : side === "bottom"
                  ? "flex-end"
                  : "center",
          },
        ],
      }}
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
          horizontal ? styles.horizontal : styles.vertical,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
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
Sheet.displayName = "Sheet";

export { Sheet };
