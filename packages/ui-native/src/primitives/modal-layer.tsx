import { type ReactNode, type Ref, useEffect } from "react";

import {
  BackHandler,
  KeyboardAvoidingView,
  type KeyboardAvoidingViewProps,
  Modal,
  type ModalProps,
  Platform,
  type StyleProp,
  StyleSheet,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { decorativeProps } from "./accessibility";

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
  /**
   * Web `modal`. `true` (default) presents a host Modal that blocks the page
   * and hides it from screen readers. `false` draws the layer in place, over
   * the nearest positioned parent, so the page behind stays visible, touchable
   * and readable; Android back and the accessibility escape gesture still
   * close it. Presentation props of the host Modal do not apply in place.
   */
  readonly modal?: boolean;
  readonly onClose: (reason: ModalLayerCloseReason) => void;
  readonly ref?: Ref<View>;
  readonly safeArea?: (content: ReactNode) => ReactNode;
  /**
   * Style of a decorative veil drawn behind the children of a modal layer. It
   * is never drawn in place, and it takes no touches.
   */
  readonly scrimStyle?: StyleProp<ViewStyle>;
  readonly visible: boolean;
};

type LayerBodyProps = Pick<
  ModalLayerProps,
  | "children"
  | "contentProps"
  | "keyboardAvoidingViewProps"
  | "onClose"
  | "ref"
  | "scrimStyle"
> & { readonly modal: boolean };

const styles = StyleSheet.create({
  fill: { flex: 1 },
  inline: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1000,
  },
  scrim: { bottom: 0, left: 0, position: "absolute", right: 0, top: 0 },
});

function LayerBody({
  children,
  contentProps,
  keyboardAvoidingViewProps,
  modal,
  onClose,
  ref,
  scrimStyle,
}: LayerBodyProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      enabled
      pointerEvents={modal ? "auto" : "box-none"}
      {...keyboardAvoidingViewProps}
      style={[
        styles.fill,
        modal ? null : styles.inline,
        keyboardAvoidingViewProps?.style,
      ]}
    >
      <View
        pointerEvents={modal ? "auto" : "box-none"}
        {...contentProps}
        accessibilityViewIsModal={modal}
        onAccessibilityEscape={() => {
          onClose("accessibilityEscape");
        }}
        ref={ref}
        style={[styles.fill, contentProps?.style]}
      >
        {modal && scrimStyle ? (
          <View
            {...decorativeProps}
            pointerEvents="none"
            style={[styles.scrim, scrimStyle]}
          />
        ) : null}
        {children}
      </View>
    </KeyboardAvoidingView>
  );
}

function InlineLayer({
  onClose,
  visible,
  ...body
}: Omit<LayerBodyProps, "modal"> & { readonly visible: boolean }) {
  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        onClose("requestClose");
        return true;
      },
    );
    return () => {
      subscription.remove();
    };
  }, [onClose, visible]);

  return visible ? (
    <LayerBody {...body} modal={false} onClose={onClose} />
  ) : null;
}

/**
 * Central native modal contract for accessibility escape, Android hardware
 * back, keyboard avoidance, transparent presentation, and host safe areas.
 * With `modal={false}` the layer keeps the same contract in place, without a
 * host Modal.
 */
function ModalLayer({
  children,
  contentProps,
  keyboardAvoidingViewProps,
  modal = true,
  onClose,
  ref,
  safeArea,
  scrimStyle,
  visible,
  ...presentationProps
}: ModalLayerProps) {
  const content = safeArea ? safeArea(children) : children;
  const body = {
    children: content,
    contentProps,
    keyboardAvoidingViewProps,
    onClose,
    ref,
    scrimStyle,
  };

  if (!modal) return <InlineLayer {...body} visible={visible} />;

  return (
    <Modal
      {...presentationProps}
      onRequestClose={() => {
        onClose("requestClose");
      }}
      transparent
      visible={visible}
    >
      <LayerBody {...body} modal />
    </Modal>
  );
}
ModalLayer.displayName = "ModalLayer";

export { ModalLayer };
