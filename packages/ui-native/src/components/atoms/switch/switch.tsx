import type { Ref } from "react";
import {
  Switch as NativeSwitch,
  type SwitchProps as NativeSwitchProps,
} from "react-native";

import { requiredHint } from "../../../primitives/accessibility";
import { useGroupDisabled } from "../../../primitives/control-group";
import {
  controllableOptions,
  useControllableState,
} from "../../../primitives/use-controllable-state";
import { useTheme } from "../../../theme/theme-provider";

/**
 * Props for the controlled or uncontrolled native binary switch. Pass
 * `checked` to control it; otherwise it starts at `defaultChecked`.
 */
export type SwitchProps = Omit<NativeSwitchProps, "onValueChange" | "value"> & {
  readonly checked?: boolean;
  readonly defaultChecked?: boolean;
  readonly onCheckedChange?: (checked: boolean) => void;
  readonly ref?: Ref<NativeSwitch>;
  /**
   * Marks the switch as required. Screen readers hear it in the hint; web
   * draws no visible marker for it, so neither does native.
   */
  readonly required?: boolean;
  /** Spoken word for `required`. Defaults to "Required". */
  readonly requiredLabel?: string;
};

/**
 * Platform-native switch with semantic checked and disabled state. The web
 * `name`, `value` and `form` props are DOM form fields with no native
 * counterpart, so they are not part of this API.
 */
function Switch({
  accessibilityHint,
  accessibilityState,
  checked,
  defaultChecked = false,
  disabled: ownDisabled = false,
  onCheckedChange,
  ref,
  required,
  requiredLabel,
  ...props
}: SwitchProps) {
  const disabled = useGroupDisabled(ownDisabled);
  const theme = useTheme();
  const [current, setCurrent] = useControllableState(
    controllableOptions(checked, defaultChecked, onCheckedChange),
  );
  return (
    <NativeSwitch
      {...props}
      accessibilityHint={requiredHint(
        accessibilityHint,
        required,
        requiredLabel,
      )}
      accessibilityRole="switch"
      accessibilityState={{
        ...accessibilityState,
        checked: current,
        disabled,
      }}
      disabled={disabled}
      ios_backgroundColor={theme.colors.input}
      onValueChange={setCurrent}
      ref={ref}
      thumbColor={
        current ? theme.colors.primaryForeground : theme.colors.background
      }
      trackColor={{ false: theme.colors.input, true: theme.colors.primary }}
      value={current}
    />
  );
}
Switch.displayName = "Switch";

export { Switch };
