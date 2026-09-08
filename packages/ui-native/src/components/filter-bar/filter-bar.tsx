"use client";

import type { ReactNode, Ref } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** Props for a native filter-control composition row. */
export type FilterBarProps = Omit<ViewProps, "children"> & {
  readonly children: ReactNode;
  readonly label: string;
  readonly ref?: Ref<View>;
};

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    minHeight: 44,
  },
});

/** Labelled native container for independently controlled filter inputs. */
function FilterBar({ children, label, ref, style, ...props }: FilterBarProps) {
  const theme = useTheme();
  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="toolbar"
      ref={ref}
      style={[styles.root, { gap: theme.spacing[2] }, style]}
      {...props}
    >
      {children}
    </View>
  );
}
FilterBar.displayName = "FilterBar";

export { FilterBar };
