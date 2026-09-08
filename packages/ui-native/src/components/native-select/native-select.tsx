import type { Ref } from "react";
import type { View } from "react-native";

import { Select, type SelectProps } from "../select/select";

/** Props for the native-platform select facade. */
export type NativeSelectProps = Omit<SelectProps, "ref"> & {
  readonly ref?: Ref<View>;
};

/**
 * Native select facade. React Native has no cross-platform select element, so
 * this intentionally uses the same accessible modal-list model as Select.
 */
function NativeSelect({ ref, ...props }: NativeSelectProps) {
  return <Select {...props} ref={ref} />;
}
NativeSelect.displayName = "NativeSelect";

export { NativeSelect };

export {
  type SelectLabels as NativeSelectLabels,
  type SelectOption as NativeSelectOption,
} from "../select/select";
