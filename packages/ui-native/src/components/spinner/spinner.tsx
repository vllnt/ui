import type { ComponentRef, Ref } from "react";
import { ActivityIndicator, type ActivityIndicatorProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** Supported semantic sizes for Spinner. */
export type SpinnerSize = "lg" | "md" | "sm";

/** Props for the native loading spinner. */
export type SpinnerProps = Omit<
  ActivityIndicatorProps,
  "accessibilityRole" | "size"
> & {
  readonly ref?: Ref<ComponentRef<typeof ActivityIndicator>>;
  readonly size?: SpinnerSize;
};

/** Accessible native loading indicator using the platform spinner. */
function Spinner({
  accessibilityLabel = "Loading content",
  accessibilityState,
  color,
  ref,
  size = "md",
  ...props
}: SpinnerProps) {
  const theme = useTheme();
  const resolvedSize = {
    lg: theme.spacing[8],
    md: theme.spacing[6],
    sm: theme.spacing[4],
  }[size];

  return (
    <ActivityIndicator
      {...props}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityState={{ ...accessibilityState, busy: true }}
      accessible
      color={color ?? theme.colors.foreground}
      ref={ref}
      size={resolvedSize}
    />
  );
}
Spinner.displayName = "Spinner";

export { Spinner };
