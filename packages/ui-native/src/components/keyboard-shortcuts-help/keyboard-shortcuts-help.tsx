"use client";

import type { ReactNode, Ref } from "react";
import {
  Pressable,
  ScrollView,
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

/** Hardware-keyboard guidance supplied by the host application. */
export type KeyboardShortcut = {
  readonly description: string;
  readonly id: string;
  readonly keys: readonly string[];
};

/** Caller-localized native shortcut help labels. */
export type KeyboardShortcutsHelpLabels = {
  readonly close: string;
  readonly hardwareKeyboardGuidance: string;
  readonly title: string;
};

/** Props for native hardware-keyboard guidance. */
export type KeyboardShortcutsHelpProps = ModalLayerPresentationProps & {
  readonly defaultOpen?: boolean;
  readonly footer?: ReactNode;
  readonly labels: KeyboardShortcutsHelpLabels;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onRequestClose?: (reason: ModalLayerCloseReason) => void;
  readonly open?: boolean;
  readonly ref?: Ref<View>;
  readonly safeArea?: (content: ReactNode) => ReactNode;
  readonly shortcuts: readonly KeyboardShortcut[];
  readonly surfaceProps?: Omit<ViewProps, "children" | "ref">;
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "center" },
  close: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  key: {
    alignItems: "center",
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 32,
    minWidth: 32,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 44,
  },
  surface: {
    alignSelf: "center",
    borderWidth: 1,
    maxHeight: "80%",
    maxWidth: 480,
    width: "92%",
  },
});

/**
 * Displays host-provided guidance for connected hardware keyboards. It does not
 * register browser shortcuts or claim that every native device has a keyboard.
 */
function KeyboardShortcutsHelp({
  defaultOpen = false,
  footer,
  labels,
  onOpenChange,
  onRequestClose,
  open,
  ref,
  safeArea,
  shortcuts,
  surfaceProps,
  ...presentationProps
}: KeyboardShortcutsHelpProps) {
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
        accessibilityLabel={labels.title}
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
        <View style={styles.header}>
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
            {labels.title}
          </Text>
          <Pressable
            accessibilityLabel={labels.close}
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
        </View>
        <Text
          style={[
            theme.typography.scale.bodySmall,
            { color: theme.colors.mutedForeground },
          ]}
        >
          {labels.hardwareKeyboardGuidance}
        </Text>
        <ScrollView contentContainerStyle={{ gap: theme.spacing[2] }}>
          {shortcuts.map((shortcut) => (
            <View
              accessibilityLabel={`${shortcut.description}: ${shortcut.keys.join(" + ")}`}
              accessible
              key={shortcut.id}
              style={[styles.row, { gap: theme.spacing[3] }]}
            >
              <Text
                style={[
                  theme.typography.scale.bodySmall,
                  { color: theme.colors.mutedForeground, flex: 1 },
                ]}
              >
                {shortcut.description}
              </Text>
              <View
                accessibilityElementsHidden
                importantForAccessibility="no"
                style={{ flexDirection: "row", gap: theme.spacing[1] }}
              >
                {shortcut.keys.map((key, index) => (
                  <View
                    key={`${shortcut.id}-${index}`}
                    style={[
                      styles.key,
                      {
                        backgroundColor: theme.colors.muted,
                        borderColor: theme.colors.border,
                        borderRadius: theme.radius.sm,
                        paddingHorizontal: theme.spacing[2],
                      },
                    ]}
                  >
                    <Text
                      style={[
                        theme.typography.scale.caption,
                        { color: theme.colors.foreground },
                      ]}
                    >
                      {key}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
        {footer ? <View style={{ alignItems: "center" }}>{footer}</View> : null}
      </View>
    </ModalLayer>
  );
}
KeyboardShortcutsHelp.displayName = "KeyboardShortcutsHelp";

export { KeyboardShortcutsHelp };
