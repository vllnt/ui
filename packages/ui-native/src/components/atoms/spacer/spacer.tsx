import type { Ref } from "react";
import { View, type ViewProps } from "react-native";

import type { SpacingToken } from "../../../primitives/spacing-token";
import { useTheme } from "../../../theme/theme-provider";

/** Props for the native spacer, which has no children and no accessibility surface. */
export type SpacerProps = Omit<
  ViewProps,
  | "accessibilityElementsHidden"
  | "children"
  | "importantForAccessibility"
  | "pointerEvents"
> & {
  /**
   * Absorbs the free space in the parent stack. With `size`, `size` is the
   * smallest the gap gets.
   */
  readonly flex?: boolean;
  readonly ref?: Ref<View>;
  /** Gap along the parent's main axis, as a theme spacing token key. */
  readonly size?: SpacingToken;
};

/**
 * An empty gap between siblings. `size` fixes the gap along the parent's main
 * axis, so one spacer serves rows and columns; `flex` makes it absorb the free
 * space instead. Screen readers skip it and touches pass through it.
 */
function Spacer({ flex = false, ref, size, style, ...props }: SpacerProps) {
  const theme = useTheme();

  return (
    <View
      {...props}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      ref={ref}
      style={[
        {
          flexBasis: size === undefined ? 0 : theme.spacing[size],
          flexGrow: flex ? 1 : 0,
          flexShrink: 0,
        },
        style,
      ]}
    />
  );
}
Spacer.displayName = "Spacer";

export { Spacer };
