import type { Ref } from "react";
import {
  type PressableProps,
  StyleSheet,
  Text as NativeText,
  type View,
} from "react-native";

import { InteractivePressable } from "../../../primitives/interactive-pressable";
import { typeStyle } from "../../../primitives/type-style";
import { useTheme } from "../../../theme/theme-provider";
import { useSidebar } from "../../atoms/sidebar-provider/sidebar-provider";

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
    <InteractivePressable
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
          borderRadius: theme.radius.md,
        },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      <NativeText
        accessible={false}
        style={typeStyle(theme, "h5", "foreground")}
      >
        {open ? "×" : "≡"}
      </NativeText>
    </InteractivePressable>
  );
}
SidebarToggle.displayName = "SidebarToggle";

export { SidebarToggle };
