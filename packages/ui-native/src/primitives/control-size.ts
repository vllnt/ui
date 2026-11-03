import type { NativeTheme } from "@vllnt/ui-core";
import type { ViewStyle } from "react-native";

/** Size scale shared by Toggle, ToggleGroup and SegmentedControl. */
export type ControlSize = "default" | "lg" | "sm";

/**
 * Padding and height for a control size. Targets keep the 44-point touch
 * floor: `sm` tightens the padding and `lg` grows the height.
 */
export function controlSizeStyle(
  theme: NativeTheme,
  size: ControlSize,
): ViewStyle {
  if (size === "lg") {
    return {
      minHeight: Math.max(44, theme.spacing[12]),
      paddingHorizontal: theme.spacing[4],
    };
  }
  if (size === "sm") {
    return { minHeight: 44, paddingHorizontal: theme.spacing[2] };
  }
  return { minHeight: 44, paddingHorizontal: theme.spacing[3] };
}
