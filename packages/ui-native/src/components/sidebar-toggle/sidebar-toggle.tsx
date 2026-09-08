import type { Ref } from "react";
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  Text as NativeText,
  type View,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { useSidebar } from "../sidebar-provider/sidebar-provider";

/** Props for the native sidebar toggle. */
export type SidebarToggleProps = Omit<
  PressableProps,
  "children" | "onPress" | "ref"
> & {
  readonly closeLabel?: string;
  readonly openLabel?: string;
  readonly ref?: Ref<View>;
};

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
});

/** Accessible native control for the nearest sidebar provider. */
function SidebarToggle({
  accessibilityLabel,
  closeLabel = "Close sidebar",
  disabled = false,
  openLabel = "Open sidebar",
  ref,
  style,
  ...props
}: SidebarToggleProps) {
  const theme = useTheme();
  const { open, toggle } = useSidebar();
  const label = accessibilityLabel ?? (open ? closeLabel : openLabel);

  return (
    <Pressable
      {...props}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled ?? undefined, expanded: open }}
      disabled={disabled}
      onPress={toggle}
      ref={ref}
      style={(state) => [
        styles.root,
        {
          backgroundColor: state.pressed ? theme.colors.accent : "transparent",
          borderRadius: theme.radius.md,
          opacity: disabled ? 0.5 : state.pressed ? 0.8 : 1,
        },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      <NativeText
        accessible={false}
        style={[theme.typography.scale.h5, { color: theme.colors.foreground }]}
      >
        {open ? "×" : "≡"}
      </NativeText>
    </Pressable>
  );
}
SidebarToggle.displayName = "SidebarToggle";

export { SidebarToggle };
