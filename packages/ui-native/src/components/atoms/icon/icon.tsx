import { type ComponentType, type Ref, use } from "react";

import type { TextTone } from "@vllnt/ui-core";
import { View, type ViewProps } from "react-native";

import type { SpacingToken } from "../../../primitives/spacing-token";
import {
  resolveTextColor,
  TextColorContext,
} from "../../../primitives/text-color";
import { useTheme } from "../../../theme/theme-provider";

/** Props Icon passes to the glyph component; lucide-compatible icons accept them. */
export type IconGlyphProps = {
  readonly color: string;
  readonly size: number;
};

/** Any component that draws a glyph from `size` and `color`, such as a lucide icon. */
export type IconGlyph = ComponentType<IconGlyphProps>;

/** Named icon sizes; each reads a theme spacing token (16, 20 and 24 points by default). */
export type IconSize = "lg" | "md" | "sm";

/** Props for a native icon. Accessibility props follow from `label`. */
export type IconProps = Omit<
  ViewProps,
  | "accessibilityElementsHidden"
  | "accessibilityLabel"
  | "accessibilityRole"
  | "accessible"
  | "children"
  | "importantForAccessibility"
> & {
  /** The glyph to draw. ui-native bundles no icons, so the caller supplies it. */
  readonly icon: IconGlyph;
  /** Accessible name. Without it the icon is decorative and hidden from screen readers. */
  readonly label?: string;
  readonly ref?: Ref<View>;
  /** A named size, or a size in points. */
  readonly size?: IconSize | number;
  readonly tone?: TextTone;
};

const SIZE_TOKENS = {
  lg: 6,
  md: 5,
  sm: 4,
} as const satisfies Record<IconSize, SpacingToken>;

const HIDDEN_FROM_SCREEN_READERS = {
  accessibilityElementsHidden: true,
  importantForAccessibility: "no-hide-descendants",
} as const;

/**
 * Draws a caller-supplied glyph at a token size in a text tone. A static image:
 * decorative, so screen readers skip it, unless `label` names it.
 */
function Icon({
  icon: Glyph,
  label,
  ref,
  size = "md",
  style,
  tone = "default",
  ...props
}: IconProps) {
  const theme = useTheme();
  const surfaceColor = use(TextColorContext);
  const points =
    typeof size === "number" ? size : theme.spacing[SIZE_TOKENS[size]];
  const accessibility: ViewProps =
    label === undefined
      ? HIDDEN_FROM_SCREEN_READERS
      : {
          accessibilityLabel: label,
          accessibilityRole: "image",
          accessible: true,
        };

  return (
    <View
      {...props}
      {...accessibility}
      ref={ref}
      style={[
        {
          alignItems: "center",
          flexShrink: 0,
          height: points,
          justifyContent: "center",
          width: points,
        },
        style,
      ]}
    >
      <Glyph
        color={resolveTextColor(theme, tone, surfaceColor)}
        size={points}
      />
    </View>
  );
}
Icon.displayName = "Icon";

export { Icon };
