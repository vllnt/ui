"use client";

import type { ReactNode, Ref } from "react";
import { StyleSheet, Text, View, type ViewProps } from "react-native";

import { useFocusWhenShown } from "../../../primitives/accessibility";
import { InteractivePressable } from "../../../primitives/interactive-pressable";
import {
  ModalLayer,
  type ModalLayerCloseReason,
  type ModalLayerPresentationProps,
} from "../../../primitives/modal-layer";
import { typeStyle } from "../../../primitives/type-style";
import {
  controllableOptions,
  useControllableState,
} from "../../../primitives/use-controllable-state";
import { useReducedMotion } from "../../../primitives/use-reduced-motion";
import { useTheme } from "../../../theme/theme-provider";

/** Veil drawn behind a modal {@link Dialog}. */
export type DialogOverlay = "none" | "scrim";

const SCRIM_OPACITY = 0.8;

/** Props for a native modal dialog presentation. */
export type DialogProps = ModalLayerPresentationProps & {
  readonly children?: ReactNode;
  readonly closeLabel: string;
  readonly defaultOpen?: boolean;
  readonly description?: string;
  /** `false` draws the dialog in place, with no veil, over a live page. */
  readonly modal?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onRequestClose?: (reason: ModalLayerCloseReason) => void;
  readonly open?: boolean;
  /**
   * Veil behind a modal dialog. `"scrim"` (default) dims the page with the
   * background colour; `"none"` draws nothing. A non-modal dialog has no veil.
   */
  readonly overlay?: DialogOverlay;
  readonly ref?: Ref<View>;
  readonly safeArea?: (content: ReactNode) => ReactNode;
  readonly surfaceProps?: Omit<ViewProps, "children" | "ref">;
  readonly title: string;
};

const styles = StyleSheet.create({
  close: {
    alignItems: "center",
    justifyContent: "center",
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
  modal = true,
  onOpenChange,
  onRequestClose,
  open,
  overlay = "scrim",
  ref,
  safeArea,
  surfaceProps,
  title,
  ...presentationProps
}: DialogProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useControllableState(
    controllableOptions(open, defaultOpen, onOpenChange),
  );
  const titleRef = useFocusWhenShown<Text>(visible && !modal);
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
      modal={modal}
      onClose={close}
      ref={ref}
      safeArea={safeArea}
      scrimStyle={
        overlay === "scrim"
          ? { backgroundColor: theme.colors.background, opacity: SCRIM_OPACITY }
          : undefined
      }
      visible={visible}
    >
      <View
        {...surfaceProps}
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
          ref={titleRef}
          style={typeStyle(theme, "bodyLarge", {
            color: "foreground",
            fontWeight: theme.typography.fontWeight.heading,
          })}
        >
          {title}
        </Text>
        {description ? (
          <Text style={typeStyle(theme, "bodySmall", "mutedForeground")}>
            {description}
          </Text>
        ) : null}
        {children}
        <View style={styles.footer}>
          <InteractivePressable
            accessibilityLabel={closeLabel}
            accessibilityRole="button"
            filled
            onPress={() => {
              close("requestClose");
            }}
            style={[
              styles.close,
              {
                backgroundColor: theme.colors.secondary,
                borderRadius: theme.radius.md,
                paddingHorizontal: theme.spacing[4],
              },
            ]}
          >
            <Text style={typeStyle(theme, "bodySmall", "secondaryForeground")}>
              {closeLabel}
            </Text>
          </InteractivePressable>
        </View>
      </View>
    </ModalLayer>
  );
}
Dialog.displayName = "Dialog";

export { Dialog };
