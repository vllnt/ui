"use client";

import type { ReactNode, Ref } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import {
  ControlGroupContext,
  useNestedControlGroup,
} from "../../primitives/control-group";
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

/**
 * Labelled native container for independently controlled filter inputs.
 * VoiceOver ignores labels on non-focusable containers, so package buttons
 * and inputs inside speak `label` as their hint.
 */
function FilterBar({ children, label, ref, style, ...props }: FilterBarProps) {
  const theme = useTheme();
  const group = useNestedControlGroup({ label });
  return (
    <ControlGroupContext value={group}>
      <View
        accessibilityRole="toolbar"
        ref={ref}
        style={[styles.root, { gap: theme.spacing[2] }, style]}
        {...props}
      >
        {children}
      </View>
    </ControlGroupContext>
  );
}
FilterBar.displayName = "FilterBar";

export { FilterBar };
