import type { Ref } from "react";
import { View, type ViewProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** Props for a static native loading placeholder. */
export type SkeletonProps = ViewProps & {
  readonly ref?: Ref<View>;
};

/** Static token-driven placeholder that stays hidden from accessibility by default. */
function Skeleton({
  accessibilityLabel,
  accessible,
  ref,
  style,
  ...props
}: SkeletonProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      accessibilityLabel={accessibilityLabel}
      accessible={accessible ?? accessibilityLabel !== undefined}
      ref={ref}
      style={[
        {
          backgroundColor: theme.colors.muted,
          borderRadius: theme.radius.md,
        },
        style,
      ]}
    />
  );
}
Skeleton.displayName = "Skeleton";

export { Skeleton };
