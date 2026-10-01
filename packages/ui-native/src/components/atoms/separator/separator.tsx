import type { Ref } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../../../theme/theme-provider";

/** Props for a horizontal or vertical native separator. */
export type SeparatorProps = ViewProps & {
  readonly decorative?: boolean;
  readonly orientation?: "horizontal" | "vertical";
  readonly ref?: Ref<View>;
};

const styles = StyleSheet.create({
  horizontal: { height: 1, width: "100%" },
  vertical: { height: "100%", width: 1 },
});

/**
 * Token-driven divider, decorative by default. A non-decorative separator
 * needs an `accessibilityLabel` to become a screen-reader stop, so it never
 * adds an unnamed stop.
 */
function Separator({
  decorative = true,
  orientation = "horizontal",
  ref,
  style,
  ...props
}: SeparatorProps) {
  const theme = useTheme();
  const exposed =
    !decorative &&
    props.accessibilityLabel !== undefined &&
    props.accessibilityLabel !== "";
  return (
    <View
      {...props}
      accessible={exposed}
      ref={ref}
      role={exposed ? "separator" : undefined}
      style={[
        orientation === "horizontal" ? styles.horizontal : styles.vertical,
        { backgroundColor: theme.colors.border },
        style,
      ]}
    />
  );
}
Separator.displayName = "Separator";

export { Separator };
