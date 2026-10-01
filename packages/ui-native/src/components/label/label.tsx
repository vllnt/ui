import type { Ref } from "react";
import {
  Text as NativeText,
  type Text as NativeTextInstance,
  type TextProps,
} from "react-native";

import { useGroupDisabled } from "../../primitives/control-group";
import { typeStyle } from "../../primitives/type-style";
import { useTheme } from "../../theme/theme-provider";

/** Props for native form label text. Use `nativeID` with a control's `accessibilityLabelledBy` when supported. */
export type LabelProps = TextProps & {
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  readonly ref?: Ref<NativeTextInstance>;
};

/** Token-driven native label text. */
function Label({
  disabled: ownDisabled = false,
  invalid = false,
  ref,
  style,
  ...props
}: LabelProps) {
  const disabled = useGroupDisabled(ownDisabled);
  const theme = useTheme();
  return (
    <NativeText
      {...props}
      ref={ref}
      style={[
        ...typeStyle(theme, "bodySmall", {
          color: invalid ? "destructive" : "foreground",
          fontWeight: theme.typography.fontWeight.caption,
          opacity: disabled ? 0.7 : 1,
        }),
        style,
      ]}
    />
  );
}
Label.displayName = "Label";

export { Label };
