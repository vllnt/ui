import type { Ref } from "react";
import {
  Text as NativeText,
  type Text as NativeTextInstance,
  type TextProps,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** Native alert tone. */
export type AlertVariant = "default" | "destructive";

/** Props for a native alert region. */
export type AlertProps = ViewProps & {
  readonly ref?: Ref<View>;
  readonly variant?: AlertVariant;
};
/** Props for the heading inside a native alert. */
export type AlertTitleProps = TextProps & {
  readonly ref?: Ref<NativeTextInstance>;
};
/** Props for supporting alert text. */
export type AlertDescriptionProps = TextProps & {
  readonly ref?: Ref<NativeTextInstance>;
};

/** Time-sensitive native announcement surface. */
function Alert({
  accessibilityLabel,
  accessibilityLiveRegion,
  ref,
  style,
  variant = "default",
  ...props
}: AlertProps) {
  const theme = useTheme();

  return (
    <View
      {...props}
      accessibilityLabel={accessibilityLabel}
      accessibilityLiveRegion={
        accessibilityLiveRegion ??
        (variant === "destructive" ? "assertive" : "polite")
      }
      accessible
      ref={ref}
      role="alert"
      style={[
        {
          backgroundColor:
            variant === "destructive"
              ? theme.colors.muted
              : theme.colors.background,
          borderColor:
            variant === "destructive"
              ? theme.colors.destructive
              : theme.colors.border,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          gap: theme.spacing[1],
          padding: theme.spacing[4],
        },
        style,
      ]}
    />
  );
}
Alert.displayName = "Alert";

/** Heading for a native alert. */
function AlertTitle({ ref, style, ...props }: AlertTitleProps) {
  const theme = useTheme();
  return (
    <NativeText
      {...props}
      accessibilityRole="header"
      aria-level={5}
      ref={ref}
      style={[
        theme.typography.scale.body,
        {
          color: theme.colors.foreground,
          fontWeight: theme.typography.fontWeight.caption,
        },
        style,
      ]}
    />
  );
}
AlertTitle.displayName = "AlertTitle";

/** Supporting content for a native alert. */
function AlertDescription({ ref, style, ...props }: AlertDescriptionProps) {
  const theme = useTheme();
  return (
    <NativeText
      {...props}
      ref={ref}
      style={[
        theme.typography.scale.bodySmall,
        { color: theme.colors.mutedForeground },
        style,
      ]}
    />
  );
}
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, AlertTitle };
