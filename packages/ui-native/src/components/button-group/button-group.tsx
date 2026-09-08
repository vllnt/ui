"use client";

import type { ReactNode, Ref } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** Props for a visually related native button group. */
export type ButtonGroupProps = Omit<ViewProps, "children"> & {
  readonly children: ReactNode;
  readonly label: string;
  readonly orientation?: "horizontal" | "vertical";
  readonly ref?: Ref<View>;
};

const styles = StyleSheet.create({
  horizontal: { alignItems: "stretch", flexDirection: "row" },
  vertical: { alignItems: "stretch", flexDirection: "column" },
});

/** Groups native actions without changing the semantics of child buttons. */
function ButtonGroup({
  children,
  label,
  orientation = "horizontal",
  ref,
  style,
  ...props
}: ButtonGroupProps) {
  const theme = useTheme();
  return (
    <View
      accessibilityLabel={label}
      ref={ref}
      style={[
        orientation === "horizontal" ? styles.horizontal : styles.vertical,
        { gap: theme.spacing[1] },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
ButtonGroup.displayName = "ButtonGroup";

export { ButtonGroup };
