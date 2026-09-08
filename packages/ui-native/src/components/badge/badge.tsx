import type { BadgeVariant, NativeTheme } from "@vllnt/ui-core";
import type { ReactNode, Ref } from "react";
import {
  type StyleProp,
  StyleSheet,
  Text as NativeText,
  type TextStyle,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** Props for the React Native Badge renderer. */
export type BadgeProps = ViewProps & {
  readonly children: ReactNode;
  readonly ref?: Ref<View>;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly variant?: BadgeVariant;
};

type BadgeResolvedStyles = {
  readonly container: ViewStyle;
  readonly text: TextStyle;
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 24,
  },
});

function resolveBadgeStyles(
  theme: NativeTheme,
  variant: BadgeVariant,
): BadgeResolvedStyles {
  const variants: Record<BadgeVariant, BadgeResolvedStyles> = {
    default: {
      container: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
      },
      text: { color: theme.colors.primaryForeground },
    },
    destructive: {
      container: {
        backgroundColor: theme.colors.destructive,
        borderColor: theme.colors.destructive,
      },
      text: { color: theme.colors.destructiveForeground },
    },
    outline: {
      container: {
        backgroundColor: "transparent",
        borderColor: theme.colors.border,
      },
      text: { color: theme.colors.foreground },
    },
    secondary: {
      container: {
        backgroundColor: theme.colors.secondary,
        borderColor: theme.colors.secondary,
      },
      text: { color: theme.colors.secondaryForeground },
    },
  };
  return variants[variant];
}

/** Compact status label using shared semantic Badge variants. */
function Badge({
  children,
  ref,
  style,
  textStyle,
  variant = "default",
  ...props
}: BadgeProps) {
  const theme = useTheme();
  const resolved = resolveBadgeStyles(theme, variant);

  return (
    <View
      {...props}
      ref={ref}
      style={[
        styles.base,
        {
          borderRadius: theme.radius.full,
          paddingHorizontal: theme.spacing[2],
          paddingVertical: theme.spacing[1] / 2,
        },
        resolved.container,
        style,
      ]}
    >
      <NativeText
        style={[
          theme.typography.scale.caption,
          { fontWeight: theme.typography.fontWeight.heading },
          resolved.text,
          textStyle,
        ]}
      >
        {children}
      </NativeText>
    </View>
  );
}
Badge.displayName = "Badge";

export { Badge };
