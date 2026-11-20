import { type Ref, use } from "react";

import type { TextSize, TextTone, TextWeight } from "@vllnt/ui-core";
import {
  Text as NativeText,
  type Text as NativeTextInstance,
  type TextProps as NativeTextProps,
  type TextStyle,
} from "react-native";

import {
  fontFamilyStyle,
  type TextFamily,
} from "../../../primitives/font-family";
import {
  resolveTextColor,
  TextColorContext,
} from "../../../primitives/text-color";
import { useTheme } from "../../../theme/theme-provider";

/** Props for token-driven React Native body text. */
export type TextProps = NativeTextProps & {
  /**
   * `mono` sets the platform monospace face on the same type scale, like web
   * `family="mono"`. Defaults to `sans`, the platform system face.
   */
  readonly family?: TextFamily;
  readonly ref?: Ref<NativeTextInstance>;
  readonly size?: TextSize;
  readonly tone?: TextTone;
  readonly weight?: TextWeight;
};

/** React Native body text backed by the shared typography contract. */
function Text({
  family = "sans",
  ref,
  size = "base",
  style,
  tone = "default",
  weight = "normal",
  ...props
}: TextProps) {
  const theme = useTheme();
  const surfaceColor = use(TextColorContext);
  const scale = {
    base: theme.typography.scale.body,
    caption: theme.typography.scale.caption,
    lead: theme.typography.scale.bodyLarge,
    small: theme.typography.scale.bodySmall,
  } satisfies Record<TextSize, { fontSize: number; lineHeight: number }>;
  const fontWeight = {
    medium: theme.typography.fontWeight.caption,
    normal: theme.typography.fontWeight.body,
    semibold: theme.typography.fontWeight.heading,
  } satisfies Record<TextWeight, TextStyle["fontWeight"]>;

  return (
    <NativeText
      {...props}
      ref={ref}
      style={[
        scale[size],
        fontFamilyStyle(family),
        {
          color: resolveTextColor(theme, tone, surfaceColor),
          fontWeight: fontWeight[weight],
        },
        style,
      ]}
    />
  );
}
Text.displayName = "Text";

export { Text };
export type { TextFamily } from "../../../primitives/font-family";
