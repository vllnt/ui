import type { ButtonSize, ButtonVariant, NativeTheme } from "@vllnt/ui-core";
import type { TextStyle, ViewStyle } from "react-native";

import {
  type InteractionState,
  interactionTokens,
} from "../../../primitives/interaction-state";

export type ButtonResolvedStyles = {
  readonly container: ViewStyle;
  readonly text: TextStyle;
};

function resolveButtonSizeStyle(
  theme: NativeTheme,
  size: ButtonSize,
): ViewStyle {
  const { targetMin } = interactionTokens(theme);
  const sizes: Record<ButtonSize, ViewStyle> = {
    default: {
      minHeight: targetMin,
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[2],
    },
    icon: {
      height: targetMin,
      paddingHorizontal: theme.spacing[2],
      width: targetMin,
    },
    lg: {
      minHeight: 48,
      paddingHorizontal: theme.spacing[8],
      paddingVertical: theme.spacing[3],
    },
    sm: {
      minHeight: targetMin,
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

/** Variants that paint their own fill, so hover dims them instead of tinting. */
const FILLED_VARIANTS: ReadonlySet<ButtonVariant> = new Set([
  "default",
  "destructive",
  "secondary",
]);

/**
 * Whether a variant paints its own fill.
 *
 * @param variant - Button variant.
 * @returns True for the solid variants.
 */
export function isFilledButtonVariant(variant: ButtonVariant): boolean {
  return FILLED_VARIANTS.has(variant);
}

/**
 * Label cue for a ghost button, which has no fill or border to show a state:
 * the label underlines on hover, focus or press, so the state reads without
 * colour.
 *
 * @param variant - Button variant.
 * @param state - Current interaction state.
 * @returns The extra label style, or undefined when there is none.
 */
export function buttonStateTextStyle(
  variant: ButtonVariant,
  state: InteractionState,
): TextStyle | undefined {
  const active = state.hovered || state.focused || state.pressed;
  return variant === "ghost" && active && !state.disabled
    ? { textDecorationLine: "underline" }
    : undefined;
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
