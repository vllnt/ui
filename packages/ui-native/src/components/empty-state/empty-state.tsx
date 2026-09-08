import type { ReactNode, Ref } from "react";
import {
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** Native empty-state visual size. */
export type EmptyStateSize = "lg" | "md" | "sm";
/** Props for a native empty-state summary. */
export type EmptyStateProps = Omit<ViewProps, "children"> & {
  readonly children?: ReactNode;
  readonly description?: ReactNode;
  readonly icon?: ReactNode;
  readonly ref?: Ref<View>;
  readonly size?: EmptyStateSize;
  readonly title?: ReactNode;
};

const styles = StyleSheet.create({
  actions: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  root: { alignItems: "center", justifyContent: "center" },
  text: { textAlign: "center" },
});

function EmptyStateIcon({
  icon,
  size,
}: Pick<EmptyStateProps, "icon" | "size">) {
  const theme = useTheme();
  if (!icon) return null;
  const iconSize = size === "lg" ? 64 : size === "sm" ? 32 : 48;
  return (
    <View
      accessible={false}
      style={{
        alignItems: "center",
        backgroundColor: theme.colors.muted,
        borderRadius: theme.radius.full,
        height: iconSize,
        justifyContent: "center",
        width: iconSize,
      }}
    >
      {icon}
    </View>
  );
}
EmptyStateIcon.displayName = "EmptyStateIcon";

function EmptyStateCopy({
  description,
  size,
  title,
}: Pick<EmptyStateProps, "description" | "size" | "title">) {
  const theme = useTheme();
  const titleScale =
    size === "lg"
      ? theme.typography.scale.h5
      : size === "sm"
        ? theme.typography.scale.body
        : theme.typography.scale.bodyLarge;
  const descriptionScale =
    size === "sm"
      ? theme.typography.scale.caption
      : theme.typography.scale.bodySmall;
  return (
    <>
      {title ? (
        <NativeText
          accessibilityRole="header"
          style={[
            styles.text,
            titleScale,
            {
              color: theme.colors.foreground,
              fontWeight: theme.typography.fontWeight.heading,
            },
          ]}
        >
          {title}
        </NativeText>
      ) : null}
      {description ? (
        <NativeText
          style={[
            styles.text,
            descriptionScale,
            { color: theme.colors.mutedForeground },
          ]}
        >
          {description}
        </NativeText>
      ) : null}
    </>
  );
}
EmptyStateCopy.displayName = "EmptyStateCopy";

/** Centered summary for an empty collection or result set. */
function EmptyState({
  children,
  description,
  icon,
  ref,
  size = "md",
  style,
  title,
  ...props
}: EmptyStateProps) {
  const theme = useTheme();
  const padding =
    size === "lg"
      ? theme.spacing[16]
      : size === "sm"
        ? theme.spacing[6]
        : theme.spacing[12];
  return (
    <View
      {...props}
      accessibilityRole="summary"
      ref={ref}
      style={[styles.root, { gap: theme.spacing[3], padding }, style]}
    >
      <EmptyStateIcon icon={icon} size={size} />
      <EmptyStateCopy description={description} size={size} title={title} />
      {children ? (
        <View
          style={[
            styles.actions,
            { gap: theme.spacing[2], marginTop: theme.spacing[2] },
          ]}
        >
          {children}
        </View>
      ) : null}
    </View>
  );
}
EmptyState.displayName = "EmptyState";

export { EmptyState };
