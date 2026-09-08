import type { Ref } from "react";
import {
  StyleSheet,
  Text as NativeText,
  type Text as NativeTextInstance,
  type TextProps,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

type NativeViewProps = ViewProps & { readonly ref?: Ref<View> };
type NativeCardTextProps = TextProps & {
  readonly ref?: Ref<NativeTextInstance>;
};

/** Props shared by Card's native view regions. */
export type CardProps = NativeViewProps;
/** Props for the native CardHeader region. */
export type CardHeaderProps = NativeViewProps;
/** Props for the native CardContent region. */
export type CardContentProps = NativeViewProps;
/** Props for the native CardFooter region. */
export type CardFooterProps = NativeViewProps;
/** Props for native Card title text. */
export type CardTitleProps = NativeCardTextProps;
/** Props for native Card description text. */
export type CardDescriptionProps = NativeCardTextProps;

const styles = StyleSheet.create({
  footer: {
    alignItems: "center",
    flexDirection: "row",
  },
  root: {
    borderWidth: 1,
  },
});

/** Token-driven native card surface. */
function Card({ ref, style, ...props }: CardProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
        },
        style,
      ]}
    />
  );
}
Card.displayName = "Card";

/** Top region for a native Card. */
function CardHeader({ ref, style, ...props }: CardHeaderProps) {
  const theme = useTheme();
  return (
    <View {...props} ref={ref} style={[{ padding: theme.spacing[6] }, style]} />
  );
}
CardHeader.displayName = "CardHeader";

/** Heading text for a native Card. */
function CardTitle({ ref, style, ...props }: CardTitleProps) {
  const theme = useTheme();
  return (
    <NativeText
      {...props}
      accessibilityRole="header"
      ref={ref}
      style={[
        theme.typography.scale.h4,
        {
          color: theme.colors.cardForeground,
          fontWeight: theme.typography.fontWeight.heading,
        },
        style,
      ]}
    />
  );
}
CardTitle.displayName = "CardTitle";

/** Supporting text for a native Card. */
function CardDescription({ ref, style, ...props }: CardDescriptionProps) {
  const theme = useTheme();
  return (
    <NativeText
      {...props}
      ref={ref}
      style={[
        theme.typography.scale.bodySmall,
        {
          color: theme.colors.mutedForeground,
          marginTop: theme.spacing[2],
        },
        style,
      ]}
    />
  );
}
CardDescription.displayName = "CardDescription";

/** Main content region for a native Card. */
function CardContent({ ref, style, ...props }: CardContentProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      ref={ref}
      style={[
        {
          paddingBottom: theme.spacing[6],
          paddingHorizontal: theme.spacing[6],
        },
        style,
      ]}
    />
  );
}
CardContent.displayName = "CardContent";

/** Action region for a native Card. */
function CardFooter({ ref, style, ...props }: CardFooterProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      ref={ref}
      style={[
        styles.footer,
        {
          paddingBottom: theme.spacing[6],
          paddingHorizontal: theme.spacing[6],
        },
        style,
      ]}
    />
  );
}
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
