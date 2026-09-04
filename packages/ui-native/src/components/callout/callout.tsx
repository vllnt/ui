import type { ReactNode, Ref } from "react";
import {
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** Semantic tone for a native Callout. */
export type CalloutVariant =
  | "danger"
  | "info"
  | "note"
  | "success"
  | "tip"
  | "warning";

/** Props for a persistent native callout message. */
export type CalloutProps = Omit<ViewProps, "children"> & {
  readonly children: ReactNode;
  readonly icon?: ReactNode;
  readonly ref?: Ref<View>;
  readonly title?: string;
  readonly variant?: CalloutVariant;
};

const defaultTitles: Record<CalloutVariant, string> = {
  danger: "Danger",
  info: "Info",
  note: "Note",
  success: "Success",
  tip: "Tip",
  warning: "Warning",
};

const styles = StyleSheet.create({
  body: { flex: 1 },
  content: { alignItems: "flex-start", flexDirection: "row" },
  root: { borderLeftWidth: 4, borderWidth: 1 },
});

/** Accessible native callout using semantic theme colors. */
function Callout({
  accessibilityLabel,
  children,
  icon,
  ref,
  style,
  title,
  variant = "info",
  ...props
}: CalloutProps) {
  const theme = useTheme();
  const displayTitle = title ?? defaultTitles[variant];
  const emphasisColor =
    variant === "danger" ? theme.colors.destructive : theme.colors.foreground;

  return (
    <View
      {...props}
      accessibilityLabel={accessibilityLabel ?? displayTitle}
      accessibilityRole="alert"
      accessible
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.muted,
          borderColor:
            variant === "danger"
              ? theme.colors.destructive
              : theme.colors.border,
          borderRadius: theme.radius.lg,
          padding: theme.spacing[4],
        },
        style,
      ]}
    >
      <View style={[styles.content, { gap: theme.spacing[3] }]}>
        {icon ? <View accessibilityElementsHidden>{icon}</View> : null}
        <View style={[styles.body, { gap: theme.spacing[1] }]}>
          <NativeText
            style={[
              theme.typography.scale.body,
              {
                color: emphasisColor,
                fontWeight: theme.typography.fontWeight.heading,
              },
            ]}
          >
            {displayTitle}
          </NativeText>
          {typeof children === "string" || typeof children === "number" ? (
            <NativeText
              style={[
                theme.typography.scale.bodySmall,
                { color: theme.colors.foreground },
              ]}
            >
              {children}
            </NativeText>
          ) : (
            children
          )}
        </View>
      </View>
    </View>
  );
}
Callout.displayName = "Callout";

export { Callout };
