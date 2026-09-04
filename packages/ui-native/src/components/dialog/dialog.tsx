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

/** Props for a native modal dialog presentation. */
export type DialogProps = ModalLayerPresentationProps & {
  readonly children?: ReactNode;
  readonly closeLabel: string;
  readonly defaultOpen?: boolean;
  readonly description?: string;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onRequestClose?: (reason: ModalLayerCloseReason) => void;
  readonly open?: boolean;
  readonly ref?: Ref<View>;
  readonly safeArea?: (content: ReactNode) => ReactNode;
  readonly surfaceProps?: Omit<ViewProps, "children" | "ref">;
  readonly title: string;
};

const styles = StyleSheet.create({
  close: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  footer: {
    alignItems: "flex-end",
  },
  surface: {
    alignSelf: "center",
    borderWidth: 1,
    maxWidth: 560,
    width: "92%",
  },
});

/**
 * Controlled or uncontrolled native dialog using the host Modal and safe-area
 * boundary. It intentionally makes no browser focus-trap claim.
 */
function Dialog({
  children,
  closeLabel,
  defaultOpen = false,
  description,
  onOpenChange,
  onRequestClose,
  open,
  ref,
  safeArea,
  surfaceProps,
  title,
  ...presentationProps
}: DialogProps) {
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
          },
          surfaceProps?.style,
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
        <View style={styles.footer}>
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
              {closeLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </ModalLayer>
  );
}
Dialog.displayName = "Dialog";

export { Dialog };
