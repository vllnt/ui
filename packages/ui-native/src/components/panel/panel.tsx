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

type PanelViewProps = ViewProps & { readonly ref?: Ref<View> };
type PanelTextProps = TextProps & { readonly ref?: Ref<NativeTextInstance> };

/** Props for the native panel surface and view regions. */
export type PanelProps = PanelViewProps;
/** Props for the panel header. */
export type PanelHeaderProps = PanelViewProps;
/** Props for the panel body. */
export type PanelBodyProps = PanelViewProps;
/** Props for the panel footer. */
export type PanelFooterProps = PanelViewProps;
/** Props for the panel title. */
export type PanelTitleProps = PanelTextProps;
/** Props for the panel description. */
export type PanelDescriptionProps = PanelTextProps;

const styles = StyleSheet.create({
  borderBottom: { borderBottomWidth: 1 },
  borderTop: { borderTopWidth: 1 },
  footer: { alignItems: "center", flexDirection: "row" },
  root: { borderWidth: 1, overflow: "hidden" },
});

/** Bordered native content surface. */
function Panel({ ref, style, ...props }: PanelProps) {
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
          borderRadius: theme.radius.lg,
        },
        style,
      ]}
    />
  );
}
Panel.displayName = "Panel";

/** Header region separated from the panel body. */
function PanelHeader({ ref, style, ...props }: PanelHeaderProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      ref={ref}
      style={[
        styles.borderBottom,
        {
          borderColor: theme.colors.border,
          gap: theme.spacing[1],
          paddingHorizontal: theme.spacing[4],
          paddingVertical: theme.spacing[3],
        },
        style,
      ]}
    />
  );
}
PanelHeader.displayName = "PanelHeader";

/** Accessible panel heading. */
function PanelTitle({ ref, style, ...props }: PanelTitleProps) {
  const theme = useTheme();
  return (
    <NativeText
      {...props}
      accessibilityRole="header"
      ref={ref}
      style={[
        theme.typography.scale.bodySmall,
        {
          color: theme.colors.cardForeground,
          fontWeight: theme.typography.fontWeight.heading,
        },
        style,
      ]}
    />
  );
}
PanelTitle.displayName = "PanelTitle";

/** Supporting panel text. */
function PanelDescription({ ref, style, ...props }: PanelDescriptionProps) {
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
PanelDescription.displayName = "PanelDescription";

/** Main panel content region. */
function PanelBody({ ref, style, ...props }: PanelBodyProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      ref={ref}
      style={[
        {
          paddingHorizontal: theme.spacing[4],
          paddingVertical: theme.spacing[3],
        },
        style,
      ]}
    />
  );
}
PanelBody.displayName = "PanelBody";

/** Footer region separated from the panel body. */
function PanelFooter({ ref, style, ...props }: PanelFooterProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      ref={ref}
      style={[
        styles.borderTop,
        styles.footer,
        {
          borderColor: theme.colors.border,
          paddingHorizontal: theme.spacing[4],
          paddingVertical: theme.spacing[3],
        },
        style,
      ]}
    />
  );
}
PanelFooter.displayName = "PanelFooter";

export {
  Panel,
  PanelBody,
  PanelDescription,
  PanelFooter,
  PanelHeader,
  PanelTitle,
};
