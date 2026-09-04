import type { ReactNode, Ref } from "react";
import {
  KeyboardAvoidingView,
  type KeyboardAvoidingViewProps,
  Modal,
  type ModalProps,
  Platform,
  View,
  type ViewProps,
} from "react-native";

/** Reasons a modal layer asks its owner to close it. */
export type ModalLayerCloseReason = "accessibilityEscape" | "requestClose";

/** Native Modal props retained by the centralized modal layer. */
export type ModalLayerPresentationProps = Pick<
  ModalProps,
  | "allowSwipeDismissal"
  | "animationType"
  | "hardwareAccelerated"
  | "navigationBarTranslucent"
  | "onDismiss"
  | "onShow"
  | "presentationStyle"
  | "statusBarTranslucent"
  | "supportedOrientations"
>;

/** Props for a transparent, accessible native modal layer. */
export type ModalLayerProps = ModalLayerPresentationProps & {
  readonly children?: ReactNode;
  readonly contentProps?: Omit<
    ViewProps,
    "accessibilityViewIsModal" | "children" | "onAccessibilityEscape" | "ref"
  >;
  readonly keyboardAvoidingViewProps?: Omit<
    KeyboardAvoidingViewProps,
    "children" | "ref"
  >;
  readonly onClose: (reason: ModalLayerCloseReason) => void;
  readonly ref?: Ref<View>;
  readonly safeArea?: (content: ReactNode) => ReactNode;
  readonly visible: boolean;
};

/**
 * Central native modal contract for accessibility escape, Android hardware
 * back, keyboard avoidance, transparent presentation, and host safe areas.
 */
function ModalLayer({
  children,
  contentProps,
  keyboardAvoidingViewProps,
  onClose,
  ref,
  safeArea,
  visible,
  ...presentationProps
}: ModalLayerProps) {
  const content = safeArea ? safeArea(children) : children;
  const requestClose = () => {
    onClose("requestClose");
  };

  return (
    <Modal
      {...presentationProps}
      onRequestClose={requestClose}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        enabled
        {...keyboardAvoidingViewProps}
      >
        <View
          {...contentProps}
          accessibilityViewIsModal
          onAccessibilityEscape={() => {
            onClose("accessibilityEscape");
          }}
          ref={ref}
        >
          {content}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
ModalLayer.displayName = "ModalLayer";

export { ModalLayer };
