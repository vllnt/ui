"use client";

import type { ReactNode, Ref } from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  Text as NativeText,
  type TextStyle,
  type View,
} from "react-native";

import {
  defaultLinkingService,
  type LinkingService,
  type OpenUrlResult,
} from "../../primitives/platform-services";
import { useTheme } from "../../theme/theme-provider";

/** Native visual emphasis for a link. */
export type LinkVariant = "default" | "muted" | "underline";

/** Props for a native link backed by a real Linking service. */
export type LinkProps = Omit<PressableProps, "children"> & {
  readonly children: ReactNode;
  readonly href: string;
  readonly linking?: LinkingService;
  readonly onOpenError?: (error: unknown) => void;
  readonly onOpenResult?: (result: OpenUrlResult) => void;
  readonly ref?: Ref<View>;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly variant?: LinkVariant;
};

const styles = StyleSheet.create({
  disabled: { opacity: 0.5 },
  root: {
    alignItems: "center",
    alignSelf: "flex-start",
    justifyContent: "center",
    minHeight: 44,
  },
});

/** Opens its URL through injected or React Native default Linking. */
function Link({
  accessibilityLabel,
  accessibilityState,
  children,
  disabled = false,
  href,
  linking = defaultLinkingService,
  onOpenError,
  onOpenResult,
  onPress,
  ref,
  style,
  textStyle,
  variant = "default",
  ...props
}: LinkProps) {
  const theme = useTheme();
  const color =
    variant === "muted" ? theme.colors.mutedForeground : theme.colors.primary;
  const content =
    typeof children === "number" || typeof children === "string" ? (
      <NativeText
        style={[
          theme.typography.scale.bodySmall,
          {
            color,
            fontWeight:
              variant === "muted"
                ? theme.typography.fontWeight.body
                : theme.typography.fontWeight.caption,
            textDecorationLine: variant === "underline" ? "underline" : "none",
          },
          textStyle,
        ]}
      >
        {children}
      </NativeText>
    ) : (
      children
    );

  return (
    <Pressable
      {...props}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="link"
      accessibilityState={{
        ...accessibilityState,
        disabled: disabled ?? undefined,
      }}
      disabled={disabled}
      onPress={(event) => {
        onPress?.(event);
        if (event?.defaultPrevented) return;
        void linking.openUrl(href).then(
          (result) => {
            onOpenResult?.(result);
          },
          (error: unknown) => {
            onOpenError?.(error);
          },
        );
      }}
      ref={ref}
      style={(state) => [
        styles.root,
        state.pressed ? { opacity: 0.8 } : undefined,
        disabled ? styles.disabled : undefined,
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {content}
    </Pressable>
  );
}
Link.displayName = "Link";

export { Link };
