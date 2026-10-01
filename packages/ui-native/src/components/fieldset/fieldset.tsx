import type { Ref } from "react";
import {
  StyleSheet,
  Text as NativeText,
  type Text as NativeTextInstance,
  type TextProps,
  View,
  type ViewProps,
} from "react-native";

import {
  ControlGroupContext,
  useNestedControlGroup,
} from "../../primitives/control-group";
import { typeStyle } from "../../primitives/type-style";
import { useTheme } from "../../theme/theme-provider";

/** Props for a native group of related fields. */
export type FieldsetProps = ViewProps & {
  /** Marks the group unavailable. Native does not cascade this state; disable child controls individually. */
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

/**
 * Native grouping surface for related fields. VoiceOver ignores labels and
 * state on non-focusable containers, so `disabled` reaches the package
 * buttons and inputs inside, and `accessibilityLabel` becomes their hint.
 */
function Fieldset({
  accessibilityLabel,
  accessibilityState: _accessibilityState,
  children,
  disabled = false,
  ref,
  style,
  ...props
}: FieldsetProps) {
  const theme = useTheme();
  const group = useNestedControlGroup({ disabled, label: accessibilityLabel });
  return (
    <View
      {...props}
      accessibilityRole="none"
      ref={ref}
      style={[
        styles.root,
        { gap: theme.spacing[4], opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      <ControlGroupContext value={group}>{children}</ControlGroupContext>
    </View>
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
        ...typeStyle(theme, "bodySmall", {
          color: "foreground",
          fontWeight: theme.typography.fontWeight.caption,
        }),
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
