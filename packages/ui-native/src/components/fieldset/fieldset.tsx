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

/** Props for a native group of related fields. */
export type FieldsetProps = ViewProps & {
  readonly disabled?: boolean;
  readonly ref?: Ref<View>;
};
/** Props for a visible native field-group legend. */
export type FieldsetLegendProps = TextProps & {
  readonly ref?: Ref<NativeTextInstance>;
};
/** Props for the spaced body of a native field group. */
export type FieldsetContentProps = ViewProps & { readonly ref?: Ref<View> };

const styles = StyleSheet.create({ root: { width: "100%" } });

/** Accessible native grouping surface for related fields. */
function Fieldset({
  accessibilityState,
  disabled = false,
  ref,
  style,
  ...props
}: FieldsetProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      accessibilityRole="none"
      accessibilityState={{ ...accessibilityState, disabled }}
      accessible
      ref={ref}
      style={[
        styles.root,
        { gap: theme.spacing[4], opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    />
  );
}
Fieldset.displayName = "Fieldset";

/** Visible heading for a native field group. */
function FieldsetLegend({ ref, style, ...props }: FieldsetLegendProps) {
  const theme = useTheme();
  return (
    <NativeText
      {...props}
      accessibilityRole="header"
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
FieldsetLegend.displayName = "FieldsetLegend";

/** Spaced native body for related controls. */
function FieldsetContent({ ref, style, ...props }: FieldsetContentProps) {
  const theme = useTheme();
  return (
    <View {...props} ref={ref} style={[{ gap: theme.spacing[4] }, style]} />
  );
}
FieldsetContent.displayName = "FieldsetContent";

export { Fieldset, FieldsetContent, FieldsetLegend };
