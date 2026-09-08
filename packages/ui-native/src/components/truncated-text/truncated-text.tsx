import type { Ref } from "react";
import {
  Text as NativeText,
  type Text as NativeTextInstance,
  type TextProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** Props for native text truncated with a platform ellipsis. */
export type TruncatedTextProps = Omit<TextProps, "children"> & {
  readonly children: string;
  readonly maxWidth?: number;
  readonly ref?: Ref<NativeTextInstance>;
};

/** Native single-line text with an accessible full-value label. */
function TruncatedText({
  accessibilityLabel,
  children,
  ellipsizeMode = "tail",
  maxWidth,
  numberOfLines = 1,
  ref,
  style,
  ...props
}: TruncatedTextProps) {
  const theme = useTheme();

  return (
    <NativeText
      {...props}
      accessibilityLabel={accessibilityLabel ?? children}
      ellipsizeMode={ellipsizeMode}
      numberOfLines={numberOfLines}
      ref={ref}
      style={[
        theme.typography.scale.body,
        { color: theme.colors.foreground, maxWidth },
        style,
      ]}
    >
      {children}
    </NativeText>
  );
}
TruncatedText.displayName = "TruncatedText";

export { TruncatedText };
