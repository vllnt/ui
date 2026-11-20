"use client";

import type { ReactNode, Ref, RefObject } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useFocusWhenShown } from "../../../primitives/accessibility";
import {
  type PlacementProps,
  useAnchoredPanel,
} from "../../../primitives/anchored-placement";
import { InteractivePressable } from "../../../primitives/interactive-pressable";
import {
  ModalLayer,
  type ModalLayerCloseReason,
} from "../../../primitives/modal-layer";
import { typeStyle } from "../../../primitives/type-style";
import {
  controllableOptions,
  useControllableState,
} from "../../../primitives/use-controllable-state";
import { useReducedMotion } from "../../../primitives/use-reduced-motion";
import { useTheme } from "../../../theme/theme-provider";

/** Props for a native popover surface. */
export type PopoverProps = PlacementProps & {
  /**
   * Element the popover opens against, like web `PopoverAnchor`. Without it
   * (or when it cannot be measured) the popover stays centred and the
   * placement props do not apply.
   */
  readonly anchorRef?: RefObject<null | View>;
  readonly cancelLabel: string;
  readonly children?: ReactNode;
  readonly defaultOpen?: boolean;
  readonly description?: string;
  readonly label: string;
  /** `false` draws the popover in place instead of in a host Modal. */
  readonly modal?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onRequestClose?: (reason: ModalLayerCloseReason) => void;
  readonly open?: boolean;
  readonly ref?: Ref<View>;
};

const styles = StyleSheet.create({
  anchored: {
    borderWidth: 1,
    maxHeight: "80%",
    maxWidth: 560,
    width: 288,
  },
  close: { alignItems: "center", justifyContent: "center" },
  content: { flex: 1, justifyContent: "center" },
  surface: {
    alignSelf: "center",
    borderWidth: 1,
    maxHeight: "80%",
    maxWidth: 560,
    width: "92%",
  },
});

/**
 * Native popover: a modal surface, placed against `anchorRef` when one is
 * given and centred otherwise.
 */
function Popover({
  align,
  alignOffset,
  anchorRef,
  cancelLabel,
  children,
  defaultOpen = false,
  description,
  label,
  modal = true,
  onOpenChange,
  onRequestClose,
  open,
  ref,
  side,
  sideOffset,
}: PopoverProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useControllableState(
    controllableOptions(open, defaultOpen, onOpenChange),
  );
  const titleRef = useFocusWhenShown<Text>(visible && !modal);
  const placement = useAnchoredPanel({
    active: visible,
    align,
    alignOffset,
    anchorRef,
    side,
    sideOffset,
  });
  const close = (reason: ModalLayerCloseReason) => {
    onRequestClose?.(reason);
    setVisible(false);
  };

  return (
    <ModalLayer
      animationType={reduceMotion ? "none" : "fade"}
      contentProps={{ style: styles.content }}
      keyboardAvoidingViewProps={{ style: styles.content }}
      modal={modal}
      onClose={close}
      ref={ref}
      visible={visible}
    >
      <View
        onLayout={placement.onLayout}
        style={[
          placement.style ? styles.anchored : styles.surface,
          {
            backgroundColor: theme.colors.popover,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            gap: theme.spacing[4],
            padding: theme.spacing[4],
          },
          placement.style,
        ]}
      >
        <Text
          accessibilityRole="header"
          ref={titleRef}
          style={typeStyle(theme, "bodyLarge", {
            color: "popoverForeground",
            fontWeight: theme.typography.fontWeight.heading,
          })}
        >
          {label}
        </Text>
        {description ? (
          <Text style={typeStyle(theme, "bodySmall", "mutedForeground")}>
            {description}
          </Text>
        ) : null}
        {children}
        <InteractivePressable
          accessibilityLabel={cancelLabel}
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
            },
          ]}
        >
          <Text style={{ color: theme.colors.secondaryForeground }}>
            {cancelLabel}
          </Text>
        </InteractivePressable>
      </View>
    </ModalLayer>
  );
}
Popover.displayName = "Popover";

export { Popover };
