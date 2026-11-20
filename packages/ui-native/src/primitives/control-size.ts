import type { NativeTheme } from "@vllnt/ui-core";
import type { ViewStyle } from "react-native";

import { interactionTokens } from "./interaction-state";

/** Size scale shared by Toggle, ToggleGroup and SegmentedControl. */
export type ControlSize = "default" | "lg" | "sm";

/**
 * Touch target floor every pressable keeps, from the interaction tokens.
 *
 * @param theme - Active native theme.
 * @returns A style holding the floor height and width.
 */
export function targetFloorStyle(theme: NativeTheme): ViewStyle {
  const { targetMin } = interactionTokens(theme);
  return { minHeight: targetMin, minWidth: targetMin };
}

/**
 * Padding and height for a control size. Targets keep the touch floor: `sm`
 * tightens the padding and `lg` grows the height.
 *
 * @param theme - Active native theme.
 * @param size - Size step of the control.
 * @returns The height and horizontal padding for that size.
 */
export function controlSizeStyle(
  theme: NativeTheme,
  size: ControlSize,
): ViewStyle {
  const { targetMin } = interactionTokens(theme);
  if (size === "lg") {
    return {
      minHeight: Math.max(targetMin, theme.spacing[12]),
      paddingHorizontal: theme.spacing[4],
    };
  }
  if (size === "sm") {
    return { minHeight: targetMin, paddingHorizontal: theme.spacing[2] };
  }
  return { minHeight: targetMin, paddingHorizontal: theme.spacing[3] };
}
