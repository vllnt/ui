import { type ReactNode, type Ref, useState } from "react";

import {
  Pressable,
  type PressableProps,
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** Semantic native banner variants. */
export type BannerVariant = "destructive" | "info" | "success" | "warning";
/** Props for a persistent native announcement. */
export type BannerProps = Omit<ViewProps, "children"> & {
  readonly children?: ReactNode;
  readonly dismissible?: boolean;
  readonly dismissLabel?: string;
  readonly icon?: ReactNode;
  readonly onDismiss?: () => void;
  readonly ref?: Ref<View>;
  readonly variant?: BannerVariant;
};
/** Props for an action rendered inside a banner. */
export type BannerActionProps = PressableProps & { readonly ref?: Ref<View> };

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 32,
  },
  body: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dismiss: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  root: {
    alignItems: "flex-start",
    borderBottomWidth: 1,
    flexDirection: "row",
    width: "100%",
  },
});

/** Native announcement bar with optional local dismissal. */
function Banner({
  children,
  dismissible = false,
  dismissLabel = "Dismiss",
  icon,
  onDismiss,
  ref,
  style,
  variant = "info",
  ...props
}: BannerProps) {
  const theme = useTheme();
  const [dismissed, setDismissed] = useState(false);
  const urgent = variant === "destructive" || variant === "warning";
  if (dismissed) return null;

  return (
    <View
      {...props}
      accessibilityRole={urgent ? "alert" : "summary"}
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor:
            variant === "destructive"
              ? theme.colors.destructive
              : theme.colors.muted,
          borderColor:
            variant === "destructive"
              ? theme.colors.destructive
              : theme.colors.border,
          gap: theme.spacing[3],
          paddingHorizontal: theme.spacing[4],
          paddingVertical: theme.spacing[3],
        },
        style,
      ]}
    >
      {icon ? <View accessible={false}>{icon}</View> : null}
      <View style={[styles.body, { gap: theme.spacing[3] }]}>{children}</View>
      {dismissible ? (
        <Pressable
          accessibilityLabel={dismissLabel}
          accessibilityRole="button"
          onPress={() => {
            setDismissed(true);
            onDismiss?.();
          }}
          style={styles.dismiss}
        >
          <NativeText
            style={{
              color:
                variant === "destructive"
                  ? theme.colors.destructiveForeground
                  : theme.colors.foreground,
            }}
          >
            ×
          </NativeText>
        </Pressable>
      ) : null}
    </View>
  );
}
Banner.displayName = "Banner";

/** Compact native action for a banner body. */
function BannerAction({
  children,
  disabled = false,
  ref,
  style,
  ...props
}: BannerActionProps) {
  const theme = useTheme();
  const isDisabled = disabled === true;
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ ...props.accessibilityState, disabled: isDisabled }}
      disabled={isDisabled}
      ref={ref}
      style={(state) => [
        styles.action,
        {
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          opacity: state.pressed ? 0.8 : isDisabled ? 0.5 : 1,
          paddingHorizontal: theme.spacing[3],
        },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {typeof children === "function" ? children : children}
    </Pressable>
  );
}
BannerAction.displayName = "BannerAction";

export { Banner, BannerAction };
