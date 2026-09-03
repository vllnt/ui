import type { HeadingLevel } from "@vllnt/ui-core";
import type { Ref } from "react";
import {
  Text as NativeText,
  type Text as NativeTextInstance,
  type TextProps as NativeTextProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** Props for semantic React Native headings. */
export type HeadingProps = Omit<
  NativeTextProps,
  "accessibilityRole" | "aria-level"
> & {
  readonly level?: HeadingLevel;
  readonly ref?: Ref<NativeTextInstance>;
  readonly size?: HeadingLevel;
};

/** Native heading with semantic level and independently selectable visual size. */
function Heading({ level = 2, ref, size, style, ...props }: HeadingProps) {
  const theme = useTheme();
  const scale = {
    1: theme.typography.scale.h1,
    2: theme.typography.scale.h2,
    3: theme.typography.scale.h3,
    4: theme.typography.scale.h4,
    5: theme.typography.scale.h5,
    6: theme.typography.scale.h6,
  } satisfies Record<HeadingLevel, { fontSize: number; lineHeight: number }>;

  return (
    <NativeText
      {...props}
      accessibilityRole="header"
      aria-level={level}
      ref={ref}
      style={[
        scale[size ?? level],
        {
          color: theme.colors.foreground,
          fontWeight: theme.typography.fontWeight.heading,
        },
        style,
      ]}
    />
  );
}
Heading.displayName = "Heading";

export { Heading };
