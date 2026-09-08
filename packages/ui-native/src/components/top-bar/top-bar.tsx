import type { ReactNode, Ref } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Text } from "../text/text";

/** Props for a token-driven native top application bar. */
export type TopBarProps = Omit<ViewProps, "children" | "ref"> & {
  readonly center?: ReactNode;
  readonly leading?: ReactNode;
  readonly ref?: Ref<View>;
  readonly safeArea?: (content: ReactNode) => ReactNode;
  readonly subtitle?: string;
  readonly title?: string;
  readonly trailing?: ReactNode;
};

const styles = StyleSheet.create({
  center: { alignItems: "center", flexShrink: 0, justifyContent: "center" },
  edge: { alignItems: "center", flex: 1, flexDirection: "row", minWidth: 0 },
  root: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 56,
  },
  trailing: { justifyContent: "flex-end" },
});

/** Native top bar with caller-owned slots and optional safe-area wrapping. */
function TopBar({
  center,
  leading,
  ref,
  safeArea,
  style,
  subtitle,
  title,
  trailing,
  ...props
}: TopBarProps) {
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
          borderBottomColor: theme.colors.border,
          gap: theme.spacing[3],
          paddingHorizontal: theme.spacing[4],
        },
        style,
      ]}
    >
      <View style={[styles.edge, { gap: theme.spacing[2] }]}>
        {leading}
        {title || subtitle ? (
          <View style={{ flex: 1, minWidth: 0 }}>
            {title ? (
              <Text numberOfLines={1} weight="medium">
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text numberOfLines={1} size="caption" tone="muted">
                {subtitle}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
      <View style={styles.center}>{center}</View>
      <View style={[styles.edge, styles.trailing, { gap: theme.spacing[2] }]}>
        {trailing}
      </View>
    </View>
  );
  return safeArea ? safeArea(bar) : bar;
}
TopBar.displayName = "TopBar";

export { TopBar };
