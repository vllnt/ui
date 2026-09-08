import type { ReactNode, Ref } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** One caller-identified native toolbar action. */
export type FloatingToolbarAction = {
  readonly disabled?: boolean;
  readonly icon?: ReactNode;
  readonly id: string;
  readonly label: string;
  readonly onPress: () => void;
  readonly variant?: "destructive" | "primary" | "secondary";
};

/** Localized labels for a floating toolbar. */
export type FloatingToolbarLabels = {
  readonly region: string;
};

/** Props for a toolbar positioned in its nearest native layout container. */
export type FloatingToolbarProps = Omit<ViewProps, "children" | "ref"> & {
  readonly actions: readonly FloatingToolbarAction[];
  readonly labels: FloatingToolbarLabels;
  readonly ref?: Ref<View>;
  readonly x: number;
  readonly y: number;
};

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  root: {
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
    position: "absolute",
  },
});

function actionColors(
  theme: ReturnType<typeof useTheme>,
  variant: NonNullable<FloatingToolbarAction["variant"]>,
) {
  if (variant === "primary") {
    return {
      backgroundColor: theme.colors.primary,
      color: theme.colors.primaryForeground,
    };
  }
  if (variant === "destructive") {
    return {
      backgroundColor: theme.colors.destructive,
      color: theme.colors.destructiveForeground,
    };
  }
  return {
    backgroundColor: theme.colors.secondary,
    color: theme.colors.secondaryForeground,
  };
}

/** Compact RN-core action bar with explicit host-owned coordinates. */
function FloatingToolbar({
  actions,
  labels,
  ref,
  style,
  x,
  y,
  ...props
}: FloatingToolbarProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      accessibilityLabel={labels.region}
      accessibilityRole="toolbar"
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.popover,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          gap: theme.spacing[1],
          left: x,
          padding: theme.spacing[1],
          top: y,
        },
        style,
      ]}
    >
      {actions.map((action) => {
        const colors = actionColors(theme, action.variant ?? "secondary");
        const handlePress = () => {
          action.onPress();
        };
        return (
          <Pressable
            accessibilityLabel={action.label}
            accessibilityRole="button"
            accessibilityState={{ disabled: action.disabled }}
            disabled={action.disabled}
            key={action.id}
            onPress={handlePress}
            style={({ pressed }) => [
              styles.action,
              {
                backgroundColor: colors.backgroundColor,
                borderRadius: theme.radius.md,
                gap: theme.spacing[2],
                opacity: action.disabled ? 0.5 : pressed ? 0.8 : 1,
                paddingHorizontal: theme.spacing[3],
              },
            ]}
          >
            {action.icon}
            <Text
              style={[
                theme.typography.scale.bodySmall,
                {
                  color: colors.color,
                  fontWeight: theme.typography.fontWeight.caption,
                },
              ]}
            >
              {action.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
FloatingToolbar.displayName = "FloatingToolbar";

export { FloatingToolbar };
