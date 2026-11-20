import type { BadgeVariant, NativeTheme } from "@vllnt/ui-core";
import type { ReactNode, Ref } from "react";
import {
  type StyleProp,
  StyleSheet,
  Text as NativeText,
  type TextStyle,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { decorativeProps } from "../../../primitives/accessibility";
import { withAlpha } from "../../../primitives/color-alpha";
import {
  isStatusTone,
  type StatusTone,
  statusToneColor,
} from "../../../primitives/status-tone";
import { useTheme } from "../../../theme/theme-provider";

/** Border weight of a Badge. Leave it out to keep the border the variant draws. */
export type BadgeBorder = "none" | "strong";

/** Chip size of a Badge. */
export type BadgeSize = "default" | "header" | "inline" | "sm";

/** Meaning of a Badge: a status tone, or one of three surfaces that replace the variant. */
export type BadgeTone = "danger-solid" | "danger-tint" | "solid" | StatusTone;

type SurfaceTone = Exclude<BadgeTone, StatusTone>;

/** Props for the React Native Badge renderer. */
export type BadgeProps = ViewProps & {
  /**
   * Border weight. Leave it out to keep the border the `variant` draws.
   * `"none"` removes the border; `"strong"` draws a full-contrast one.
   */
  readonly border?: BadgeBorder;
  readonly children: ReactNode;
  /**
   * Shows a leading status dot. The dot is decorative and hidden from screen
   * readers, so the label has to say the status in words. It takes its colour
   * from `tone`, and follows the label colour without a `tone`.
   */
  readonly dot?: boolean;
  readonly ref?: Ref<View>;
  /**
   * Chip size, defaults to `"default"`. `"header"` uses the body-small type
   * step and roomier padding; `"inline"` and `"sm"` tighten the padding and
   * drop the height floor. The theme has no type step below caption, so
   * every size except `"header"` shares the caption label.
   */
  readonly size?: BadgeSize;
  readonly textStyle?: StyleProp<TextStyle>;
  /**
   * Meaning of the chip. A status tone (`"danger"`, `"info"`, `"neutral"`,
   * `"primary"`, `"success"`, `"warning"`) colours the dot and gives the chip
   * the `"secondary"` surface unless you pass a `variant`. `"solid"`,
   * `"danger-solid"` and `"danger-tint"` set their own surface and replace the
   * `variant`. Leave it out for the plain `variant` look.
   */
  readonly tone?: BadgeTone;
  readonly variant?: BadgeVariant;
};

type BadgeSurface = {
  readonly container: ViewStyle;
  readonly text: { readonly color: string };
};

type BadgeResolved = {
  readonly container: StyleProp<ViewStyle>;
  readonly dotColor: string;
  readonly text: { readonly color: string };
};

type BadgeSizeStyle = {
  readonly container: ViewStyle;
  readonly text: TextStyle;
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: { flexShrink: 0 },
});

function variantSurface(
  theme: NativeTheme,
  variant: BadgeVariant,
): BadgeSurface {
  const { colors } = theme;
  const surfaces: Record<BadgeVariant, BadgeSurface> = {
    default: {
      container: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
      },
      text: { color: colors.primaryForeground },
    },
    destructive: {
      container: {
        backgroundColor: colors.destructive,
        borderColor: colors.destructive,
      },
      text: { color: colors.destructiveForeground },
    },
    outline: {
      container: {
        backgroundColor: "transparent",
        borderColor: colors.border,
      },
      text: { color: colors.foreground },
    },
    secondary: {
      container: {
        backgroundColor: colors.secondary,
        borderColor: colors.secondary,
      },
      text: { color: colors.secondaryForeground },
    },
    soft: {
      container: {
        backgroundColor: colors.muted,
        borderColor: colors.muted,
      },
      text: { color: colors.foreground },
    },
  };
  return surfaces[variant];
}

function toneSurface(
  theme: NativeTheme,
  tone: BadgeTone | undefined,
): BadgeSurface | undefined {
  const { colors } = theme;
  const surfaces: Record<SurfaceTone, BadgeSurface> = {
    "danger-solid": {
      container: {
        backgroundColor: colors.destructive,
        borderColor: "transparent",
      },
      text: { color: colors.destructiveForeground },
    },
    "danger-tint": {
      container: {
        backgroundColor: withAlpha(colors.destructive, 0.1),
        borderColor: withAlpha(colors.destructive, 0.3),
      },
      text: { color: colors.foreground },
    },
    solid: {
      container: {
        backgroundColor: colors.primary,
        borderColor: "transparent",
      },
      text: { color: colors.primaryForeground },
    },
  };
  return tone === undefined || isStatusTone(tone) ? undefined : surfaces[tone];
}

function borderOverride(
  theme: NativeTheme,
  border: BadgeBorder | undefined,
): undefined | ViewStyle {
  if (border === "none") return { borderColor: "transparent" };
  if (border === "strong") return { borderColor: theme.colors.foreground };
  return undefined;
}

function dotTone(tone: BadgeTone | undefined): StatusTone | undefined {
  if (tone === "danger-tint") return "danger";
  return isStatusTone(tone) ? tone : undefined;
}

function resolveBadge(
  theme: NativeTheme,
  {
    border,
    tone,
    variant,
  }: {
    readonly border?: BadgeBorder;
    readonly tone?: BadgeTone;
    readonly variant?: BadgeVariant;
  },
): BadgeResolved {
  const status = dotTone(tone);
  const base = variantSurface(
    theme,
    variant ?? (isStatusTone(tone) ? "secondary" : "default"),
  );
  const surface = toneSurface(theme, tone) ?? base;
  return {
    container: [surface.container, borderOverride(theme, border)],
    dotColor:
      status === undefined
        ? surface.text.color
        : statusToneColor(theme, status),
    text: surface.text,
  };
}

function sizeStyle(theme: NativeTheme, size: BadgeSize): BadgeSizeStyle {
  const { scale } = theme.typography;
  const { spacing } = theme;
  const sizes: Record<BadgeSize, BadgeSizeStyle> = {
    default: {
      container: {
        minHeight: 24,
        paddingHorizontal: spacing[2] + spacing[1] / 2,
        paddingVertical: spacing[1] / 2,
      },
      text: scale.caption,
    },
    header: {
      container: {
        minHeight: 24,
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[1],
      },
      text: scale.bodySmall,
    },
    inline: {
      container: { paddingHorizontal: spacing[1] * 1.5, paddingVertical: 0 },
      text: scale.caption,
    },
    sm: {
      container: { paddingHorizontal: spacing[2], paddingVertical: 0 },
      text: scale.caption,
    },
  };
  return sizes[size];
}

/**
 * Compact status label using shared semantic Badge variants. `size`, `tone`,
 * `border` and `dot` take the web Badge values and defaults.
 */
function Badge({
  border,
  children,
  dot = false,
  ref,
  size = "default",
  style,
  textStyle,
  tone,
  variant,
  ...props
}: BadgeProps) {
  const theme = useTheme();
  const resolved = resolveBadge(theme, { border, tone, variant });
  const sized = sizeStyle(theme, size);
  const dotSize = theme.spacing[1] * 1.5;

  return (
    <View
      {...props}
      ref={ref}
      style={[
        styles.base,
        { borderRadius: theme.radius.full, gap: dot ? dotSize : 0 },
        sized.container,
        resolved.container,
        style,
      ]}
    >
      {dot ? (
        <View
          {...decorativeProps}
          style={[
            styles.dot,
            {
              backgroundColor: resolved.dotColor,
              borderRadius: theme.radius.full,
              height: dotSize,
              width: dotSize,
            },
          ]}
        />
      ) : null}
      <NativeText
        style={[
          sized.text,
          { fontWeight: theme.typography.fontWeight.heading },
          resolved.text,
          textStyle,
        ]}
      >
        {children}
      </NativeText>
    </View>
  );
}
Badge.displayName = "Badge";

export { Badge };
