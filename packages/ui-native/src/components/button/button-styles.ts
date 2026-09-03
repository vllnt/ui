import type { ButtonSize, ButtonVariant, NativeTheme } from "@vllnt/ui-core";
import type { TextStyle, ViewStyle } from "react-native";

export type ButtonResolvedStyles = {
  readonly container: ViewStyle;
  readonly text: TextStyle;
};

function resolveButtonSizeStyle(
  theme: NativeTheme,
  size: ButtonSize,
): ViewStyle {
  const sizes: Record<ButtonSize, ViewStyle> = {
    default: {
      minHeight: 44,
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[2],
    },
    icon: { height: 44, paddingHorizontal: theme.spacing[2], width: 44 },
    lg: {
      minHeight: 48,
      paddingHorizontal: theme.spacing[8],
      paddingVertical: theme.spacing[3],
    },
    sm: {
      minHeight: 44,
      paddingHorizontal: theme.spacing[3],
      paddingVertical: theme.spacing[2],
    },
  };
  return sizes[size];
}

function solidStyles(
  backgroundColor: string,
  color: string,
): ButtonResolvedStyles {
  return { container: { backgroundColor }, text: { color } };
}

function transparentStyles(color: string): ButtonResolvedStyles {
  return { container: { backgroundColor: "transparent" }, text: { color } };
}

function linkStyles(theme: NativeTheme): ButtonResolvedStyles {
  return {
    ...transparentStyles(theme.colors.primary),
    text: { color: theme.colors.primary, textDecorationLine: "underline" },
  };
}

function outlineStyles(theme: NativeTheme): ButtonResolvedStyles {
  return {
    container: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.input,
      borderWidth: 1,
    },
    text: { color: theme.colors.foreground },
  };
}

function resolveButtonVariantStyles(
  theme: NativeTheme,
  variant: ButtonVariant,
): ButtonResolvedStyles {
  if (variant === "default")
    return solidStyles(theme.colors.primary, theme.colors.primaryForeground);
  if (variant === "destructive")
    return solidStyles(
      theme.colors.destructive,
      theme.colors.destructiveForeground,
    );
  if (variant === "secondary")
    return solidStyles(
      theme.colors.secondary,
      theme.colors.secondaryForeground,
    );
  if (variant === "ghost") return transparentStyles(theme.colors.foreground);
  if (variant === "link") return linkStyles(theme);
  return outlineStyles(theme);
}

/** Resolves Button's shared variants into native semantic styles. */
export function resolveButtonStyles(
  theme: NativeTheme,
  variant: ButtonVariant,
  size: ButtonSize,
): ButtonResolvedStyles {
  const variantStyles = resolveButtonVariantStyles(theme, variant);
  return {
    container: {
      ...resolveButtonSizeStyle(theme, size),
      ...variantStyles.container,
    },
    text: variantStyles.text,
  };
}
