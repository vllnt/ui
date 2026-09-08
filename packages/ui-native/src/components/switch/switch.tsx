import type { Ref } from "react";
import {
  Switch as NativeSwitch,
  type SwitchProps as NativeSwitchProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** Props for the controlled native binary switch. */
export type SwitchProps = Omit<NativeSwitchProps, "onValueChange" | "value"> & {
  readonly checked: boolean;
  readonly onCheckedChange?: (checked: boolean) => void;
  readonly ref?: Ref<NativeSwitch>;
};

/** Platform-native controlled switch with semantic checked and disabled state. */
function Switch({
  accessibilityState,
  checked,
  disabled = false,
  onCheckedChange,
  ref,
  ...props
}: SwitchProps) {
  const theme = useTheme();
  return (
    <NativeSwitch
      {...props}
      accessibilityRole="switch"
      accessibilityState={{
        ...accessibilityState,
        checked,
        disabled,
      }}
      disabled={disabled}
      ios_backgroundColor={theme.colors.input}
      onValueChange={onCheckedChange}
      ref={ref}
      thumbColor={
        checked ? theme.colors.primaryForeground : theme.colors.background
      }
      trackColor={{ false: theme.colors.input, true: theme.colors.primary }}
      value={checked}
    />
  );
}
Switch.displayName = "Switch";

export { Switch };
