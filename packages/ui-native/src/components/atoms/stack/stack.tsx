import type { Ref } from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";

import type { SpacingToken } from "../../../primitives/spacing-token";
import { useTheme } from "../../../theme/theme-provider";

/** Props for the native flex layout primitive. */
export type StackProps = ViewProps & {
  /** Cross-axis alignment, passed to `alignItems`. */
  readonly align?: ViewStyle["alignItems"];
  /** Main axis of the stack. Defaults to `"column"`. */
  readonly direction?: "column" | "row";
  /** Space between children, as a theme spacing token key. */
  readonly gap?: SpacingToken;
  /** Main-axis distribution, passed to `justifyContent`. */
  readonly justify?: ViewStyle["justifyContent"];
  readonly ref?: Ref<View>;
  /** Lets children wrap onto further lines. */
  readonly wrap?: boolean;
};

/**
 * Lays children out in a row or column with token spacing. It renders a plain
 * `View` with no accessibility role, so it never changes what screen readers
 * announce.
 */
function Stack({
  align,
  direction = "column",
  gap,
  justify,
  ref,
  style,
  wrap = false,
  ...props
}: StackProps) {
  const theme = useTheme();

  return (
    <View
      {...props}
      ref={ref}
      style={[
        {
          alignItems: align,
          flexDirection: direction,
          flexWrap: wrap ? "wrap" : "nowrap",
          gap: gap === undefined ? undefined : theme.spacing[gap],
          justifyContent: justify,
        },
        style,
      ]}
    />
  );
}
Stack.displayName = "Stack";

export { Stack };
