import { isValidElement, type ReactNode, type Ref, useState } from "react";

import {
  Pressable,
  type PressableProps,
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import {
  decorativeProps,
  useAnnounceOnChange,
} from "../../primitives/accessibility";
import { TextColorContext } from "../../primitives/text-color";
import { useTheme } from "../../theme/theme-provider";
import { Text } from "../text/text";

/** Semantic native banner variants. */
export type BannerVariant = "destructive" | "info" | "success" | "warning";
/**
 * Props for a persistent native announcement. Urgent variants announce
 * `accessibilityLabel`, or by default the text found in their children.
 */
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
    minHeight: 44,
    minWidth: 44,
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

function textContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node))
    return node
      .map((child: ReactNode) => textContent(child))
      .filter((text) => text.length > 0)
      .join(", ");
  if (isValidElement<{ readonly children?: ReactNode }>(node))
    return textContent(node.props.children);
  return "";
}

function BannerBody({
  children,
  gap,
  surfaceColor,
}: {
  readonly children?: ReactNode;
  readonly gap: number;
  readonly surfaceColor?: string;
}) {
  return (
    <TextColorContext value={surfaceColor}>
      <View style={[styles.body, { gap }]}>
        {typeof children === "string" || typeof children === "number" ? (
          <Text>{children}</Text>
        ) : (
          children
        )}
      </View>
    </TextColorContext>
  );
}
BannerBody.displayName = "BannerBody";

function BannerDismiss({
  color,
  label,
  onPress,
}: {
  readonly color: string;
  readonly label: string;
  readonly onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.dismiss}
    >
      <NativeText style={{ color }}>×</NativeText>
    </Pressable>
  );
}
BannerDismiss.displayName = "BannerDismiss";

function liveRegionFor(variant: BannerVariant) {
  if (variant === "destructive") return "assertive";
  return variant === "warning" ? "polite" : undefined;
}

/**
 * Native announcement bar with optional local dismissal. Screen readers speak
 * destructive and warning banners when they appear (TalkBack through a live
 * region, iOS through an announcement); the icon slot is decorative, and
 * package `Text` inside a destructive banner uses the destructive foreground.
 */
function Banner({
  accessibilityLabel,
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
  const liveRegion = props.accessibilityLiveRegion ?? liveRegionFor(variant);
  const announces = liveRegion !== undefined && liveRegion !== "none";
  const destructive = variant === "destructive";
  const foreground = destructive
    ? theme.colors.destructiveForeground
    : theme.colors.foreground;
  useAnnounceOnChange(
    announces && !dismissed
      ? (accessibilityLabel ?? textContent(children))
      : undefined,
    { initial: true, liveRegion: true },
  );
  if (dismissed) return null;

  return (
    <View
      {...props}
      accessibilityLabel={accessibilityLabel}
      accessibilityLiveRegion={liveRegion}
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: destructive
            ? theme.colors.destructive
            : theme.colors.muted,
          borderColor: destructive
            ? theme.colors.destructive
            : theme.colors.border,
          gap: theme.spacing[3],
          paddingHorizontal: theme.spacing[4],
          paddingVertical: theme.spacing[3],
        },
        style,
      ]}
    >
      {icon ? <View {...decorativeProps}>{icon}</View> : null}
      <BannerBody
        gap={theme.spacing[3]}
        surfaceColor={destructive ? foreground : undefined}
      >
        {children}
      </BannerBody>
      {dismissible ? (
        <BannerDismiss
          color={foreground}
          label={dismissLabel}
          onPress={() => {
            setDismissed(true);
            onDismiss?.();
          }}
        />
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
