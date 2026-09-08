import type { ReactNode, Ref } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** Props for a native bottom action or navigation bar. */
export type BottomBarProps = Omit<ViewProps, "children" | "ref"> & {
  readonly center?: ReactNode;
  readonly leading?: ReactNode;
  readonly ref?: Ref<View>;
  readonly safeArea?: (content: ReactNode) => ReactNode;
  readonly trailing?: ReactNode;
};

const styles = StyleSheet.create({
  center: { alignItems: "center", flexShrink: 0, justifyContent: "center" },
  edge: { alignItems: "center", flex: 1, flexDirection: "row", minWidth: 0 },
  root: {
    alignItems: "center",
    borderTopWidth: 1,
    flexDirection: "row",
    minHeight: 56,
  },
  trailing: { justifyContent: "flex-end" },
});

/** Native bottom bar with caller-owned slots and optional safe-area wrapping. */
function BottomBar({
  center,
  leading,
  ref,
  safeArea,
  style,
  trailing,
  ...props
}: BottomBarProps) {
  const theme = useTheme();
  const bar = (
    <View
      {...props}
      accessibilityRole="toolbar"
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          gap: theme.spacing[3],
          paddingHorizontal: theme.spacing[4],
          paddingVertical: theme.spacing[2],
        },
        style,
      ]}
    >
      <View style={[styles.edge, { gap: theme.spacing[2] }]}>{leading}</View>
      <View style={styles.center}>{center}</View>
      <View style={[styles.edge, styles.trailing, { gap: theme.spacing[2] }]}>
        {trailing}
      </View>
    </View>
  );
  return safeArea ? safeArea(bar) : bar;
}
BottomBar.displayName = "BottomBar";

export { BottomBar };
