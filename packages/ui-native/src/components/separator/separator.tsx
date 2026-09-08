import type { Ref } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";

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

/** Token-driven divider, decorative by default. */
function Separator({
  decorative = true,
  orientation = "horizontal",
  ref,
  style,
  ...props
}: SeparatorProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      accessible={!decorative}
      ref={ref}
      role={decorative ? undefined : "separator"}
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
