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

export type ItemSize = "default" | "sm";
export type ItemVariant = "default" | "muted" | "outline";
type ItemViewProps = ViewProps & { readonly ref?: Ref<View> };
type ItemTextProps = TextProps & { readonly ref?: Ref<NativeTextInstance> };

export type ItemProps = ItemViewProps & {
  readonly size?: ItemSize;
  readonly variant?: ItemVariant;
};
export type ItemMediaProps = ItemViewProps;
export type ItemContentProps = ItemViewProps;
export type ItemActionsProps = ItemViewProps;
export type ItemTitleProps = ItemTextProps;
export type ItemDescriptionProps = ItemTextProps;

const styles = StyleSheet.create({
  actions: { alignItems: "center", flexDirection: "row", flexShrink: 0 },
  content: { flex: 1, minWidth: 0 },
  media: { alignItems: "center", flexShrink: 0, justifyContent: "center" },
  root: { alignItems: "center", flexDirection: "row" },
});

/** Flexible native row with media, content, and action slots. */
function Item({
  ref,
  size = "default",
  style,
  variant = "default",
  ...props
}: ItemProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor:
            variant === "muted" ? theme.colors.muted : "transparent",
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          borderWidth: variant === "outline" ? 1 : 0,
          gap: theme.spacing[3],
          padding: size === "sm" ? theme.spacing[2] : theme.spacing[3],
        },
        style,
      ]}
    />
  );
}
Item.displayName = "Item";

function ItemMedia({ ref, style, ...props }: ItemMediaProps) {
  return <View {...props} ref={ref} style={[styles.media, style]} />;
}
ItemMedia.displayName = "ItemMedia";

function ItemContent({ ref, style, ...props }: ItemContentProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      ref={ref}
      style={[styles.content, { gap: theme.spacing[1] / 2 }, style]}
    />
  );
}
ItemContent.displayName = "ItemContent";

function ItemTitle({ ref, style, ...props }: ItemTitleProps) {
  const theme = useTheme();
  return (
    <NativeText
      {...props}
      ref={ref}
      style={[
        theme.typography.scale.bodySmall,
        {
          color: theme.colors.foreground,
          fontWeight: theme.typography.fontWeight.caption,
        },
        style,
      ]}
    />
  );
}
ItemTitle.displayName = "ItemTitle";

function ItemDescription({ ref, style, ...props }: ItemDescriptionProps) {
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
ItemDescription.displayName = "ItemDescription";

function ItemActions({ ref, style, ...props }: ItemActionsProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      ref={ref}
      style={[styles.actions, { gap: theme.spacing[2] }, style]}
    />
  );
}
ItemActions.displayName = "ItemActions";

export {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
};
