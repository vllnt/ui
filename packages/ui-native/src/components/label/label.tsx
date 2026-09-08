import type { Ref } from "react";
import {
  Text as NativeText,
  type Text as NativeTextInstance,
  type TextProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** Props for native form label text. Use `nativeID` with a control's `accessibilityLabelledBy` when supported. */
export type LabelProps = TextProps & {
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  readonly ref?: Ref<NativeTextInstance>;
};

/** Token-driven native label text. */
function Label({
  disabled = false,
  invalid = false,
  ref,
  style,
  ...props
}: LabelProps) {
  const theme = useTheme();
  return (
    <NativeText
      {...props}
      ref={ref}
      style={[
        theme.typography.scale.bodySmall,
        {
          color: invalid ? theme.colors.destructive : theme.colors.foreground,
          fontWeight: theme.typography.fontWeight.caption,
          opacity: disabled ? 0.7 : 1,
        },
        style,
      ]}
    />
  );
}
Label.displayName = "Label";

export { Label };
