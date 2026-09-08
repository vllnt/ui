import type { NativeTheme } from "@vllnt/ui-core";
import type { Ref } from "react";
import {
  StyleSheet,
  Text as NativeText,
  type TextStyle,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** Semantic status tone. */
export type StatusIndicatorTone =
  | "danger"
  | "info"
  | "neutral"
  | "success"
  | "warning";
/** Native status indicator size. */
export type StatusIndicatorSize = "lg" | "md" | "sm";
/** Native status indicator surface treatment. */
export type StatusIndicatorVariant = "outline" | "soft" | "solid";

/** Props for a native status label. */
export type StatusIndicatorProps = Omit<ViewProps, "children"> & {
  readonly announceChanges?: boolean;
  readonly label: string;
  readonly ref?: Ref<View>;
  readonly showDot?: boolean;
  readonly size?: StatusIndicatorSize;
  readonly tone?: StatusIndicatorTone;
  readonly variant?: StatusIndicatorVariant;
};

type StatusPresentation = {
  readonly color: string;
  readonly container: ViewStyle;
  readonly dotSize: number;
  readonly minHeight: number;
  readonly paddingHorizontal: number;
  readonly text: TextStyle;
  readonly textColor: string;
};

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    flexDirection: "row",
  },
});

function resolveStatusPresentation(
  theme: NativeTheme,
  options: {
    readonly size: StatusIndicatorSize;
    readonly tone: StatusIndicatorTone;
    readonly variant: StatusIndicatorVariant;
  },
): StatusPresentation {
  const { size, tone, variant } = options;
  const color = {
    danger: theme.colors.destructive,
    info: theme.colors.secondaryForeground,
    neutral: theme.colors.mutedForeground,
    success: theme.colors.primary,
    warning: theme.colors.accentForeground,
  } satisfies Record<StatusIndicatorTone, string>;
  const dimensions = {
    lg: {
      dotSize: 10,
      minHeight: 32,
      paddingHorizontal: theme.spacing[3],
      text: theme.typography.scale.bodySmall,
    },
    md: {
      dotSize: 8,
      minHeight: 28,
      paddingHorizontal: theme.spacing[2],
      text: theme.typography.scale.caption,
    },
    sm: {
      dotSize: 6,
      minHeight: 24,
      paddingHorizontal: theme.spacing[2],
      text: theme.typography.scale.caption,
    },
  } satisfies Record<
    StatusIndicatorSize,
    {
      readonly dotSize: number;
      readonly minHeight: number;
      readonly paddingHorizontal: number;
      readonly text: TextStyle;
    }
  >;
  const currentColor = color[tone];
  const container = {
    backgroundColor:
      variant === "solid"
        ? currentColor
        : variant === "soft"
          ? theme.colors.muted
          : theme.colors.background,
    borderColor: variant === "outline" ? currentColor : theme.colors.border,
  };
  const textColor =
    variant === "solid"
      ? tone === "danger"
        ? theme.colors.destructiveForeground
        : theme.colors.primaryForeground
      : theme.colors.foreground;
  return {
    color: currentColor,
    container,
    textColor,
    ...dimensions[size],
  };
}

/** Token-driven native status label that pairs color with readable text. */
function StatusIndicator({
  accessibilityLabel,
  announceChanges = false,
  label,
  ref,
  showDot = true,
  size = "md",
  style,
  tone = "neutral",
  variant = "soft",
  ...props
}: StatusIndicatorProps) {
  const theme = useTheme();
  const presentation = resolveStatusPresentation(theme, {
    size,
    tone,
    variant,
  });

  return (
    <View
      {...props}
      accessibilityLabel={accessibilityLabel ?? `${label}, ${tone}`}
      accessibilityLiveRegion={announceChanges ? "polite" : "none"}
      accessible
      ref={ref}
      style={[
        styles.root,
        presentation.container,
        {
          borderRadius: theme.radius.full,
          gap: theme.spacing[2],
          minHeight: presentation.minHeight,
          paddingHorizontal: presentation.paddingHorizontal,
        },
        style,
      ]}
    >
      {showDot ? (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            backgroundColor: presentation.color,
            borderRadius: theme.radius.full,
            height: presentation.dotSize,
            width: presentation.dotSize,
          }}
        />
      ) : null}
      <NativeText
        style={[
          presentation.text,
          {
            color: presentation.textColor,
            fontWeight: theme.typography.fontWeight.caption,
          },
        ]}
      >
        {label}
      </NativeText>
    </View>
  );
}
StatusIndicator.displayName = "StatusIndicator";

export { StatusIndicator };
