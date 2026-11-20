"use client";

import { type ReactNode, type Ref, useEffect, useRef } from "react";

import { StyleSheet, Text, View } from "react-native";

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

/** Props for explicit press and accessibility-help tooltip semantics. */
export type TooltipProps = PlacementProps & {
  readonly children: ReactNode;
  readonly closeLabel: string;
  readonly defaultOpen?: boolean;
  /**
   * Milliseconds between pressing the trigger and the tooltip opening, for
   * pointer-free hover-intent parity. Defaults to 0: a press opens it at once
   * (web waits 700 ms for hover intent). Pressing again before it opens
   * cancels it.
   */
  readonly delayDuration?: number;
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
  anchored: { borderWidth: 1, maxWidth: 320, minWidth: 160 },
  close: { alignItems: "center", justifyContent: "center" },
  content: { flex: 1, justifyContent: "center" },
  surface: { alignSelf: "center", borderWidth: 1, maxWidth: 420, width: "88%" },
  trigger: {
    alignItems: "center",
    justifyContent: "center",
  },
});

/**
 * Native help disclosure opened by press and placed against its trigger. It
 * deliberately does not claim focus or hover behavior when a modal would
 * immediately move focus away.
 */
function Tooltip({
  align,
  alignOffset,
  children,
  closeLabel,
  defaultOpen = false,
  delayDuration = 0,
  helpHint,
  label,
  onOpenChange,
  onRequestClose,
  open,
  ref,
  side = "top",
  sideOffset,
  trigger,
  triggerLabel,
}: TooltipProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useControllableState(
    controllableOptions(open, defaultOpen, onOpenChange),
  );
  const triggerRef = useRef<View>(null);
  const pending = useRef<ReturnType<typeof setTimeout>>(undefined);
  const placement = useAnchoredPanel({
    active: visible,
    align,
    alignOffset,
    anchorRef: triggerRef,
    side,
    sideOffset,
  });
  const cancelPending = () => {
    clearTimeout(pending.current);
    pending.current = undefined;
  };
  useEffect(() => cancelPending, []);
  const close = (reason: ModalLayerCloseReason) => {
    cancelPending();
    onRequestClose?.(reason);
    setVisible(false);
  };
  const pressTrigger = () => {
    if (visible || pending.current !== undefined) {
      cancelPending();
      setVisible(false);
    } else if (delayDuration > 0) {
      pending.current = setTimeout(() => {
        pending.current = undefined;
        setVisible(true);
      }, delayDuration);
    } else {
      setVisible(true);
    }
  };

  return (
    <>
      <InteractivePressable
        accessibilityHint={helpHint}
        accessibilityLabel={triggerLabel}
        accessibilityRole="button"
        accessibilityState={{ expanded: visible }}
        onPress={pressTrigger}
        ref={triggerRef}
        style={styles.trigger}
      >
        {typeof trigger === "string" || typeof trigger === "number" ? (
          <Text style={typeStyle(theme, "bodySmall", "foreground")}>
            {trigger}
          </Text>
        ) : (
          trigger
        )}
      </InteractivePressable>
      <ModalLayer
        animationType={reduceMotion ? "none" : "fade"}
        contentProps={{ style: styles.content }}
        keyboardAvoidingViewProps={{ style: styles.content }}
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
              gap: theme.spacing[3],
              padding: theme.spacing[4],
            },
            placement.style,
          ]}
        >
          <Text
            accessibilityRole="header"
            style={typeStyle(theme, "bodySmall", {
              color: "popoverForeground",
              fontWeight: theme.typography.fontWeight.caption,
            })}
          >
            {label}
          </Text>
          {typeof children === "string" || typeof children === "number" ? (
            <Text style={typeStyle(theme, "bodySmall", "popoverForeground")}>
              {children}
            </Text>
          ) : (
            children
          )}
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
              },
            ]}
          >
            <Text style={{ color: theme.colors.secondaryForeground }}>
              {closeLabel}
            </Text>
          </InteractivePressable>
        </View>
      </ModalLayer>
    </>
  );
}
Tooltip.displayName = "Tooltip";

export { Tooltip };
