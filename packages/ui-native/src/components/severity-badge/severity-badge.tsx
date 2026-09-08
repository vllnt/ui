import type { NativeTheme } from "@vllnt/ui-core";
import type { Ref } from "react";
import {
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** Operational severity represented by a native badge. */
export type SeverityBadgeLevel =
  | "critical"
  | "high"
  | "info"
  | "low"
  | "medium";
/** Native severity badge surface treatment. */
export type SeverityBadgeTone = "outline" | "soft" | "solid";

/** Optional localized severity labels. */
export type SeverityBadgeLabels = {
  readonly critical?: string;
  readonly high?: string;
  readonly info?: string;
  readonly low?: string;
  readonly medium?: string;
};

/** Props for a native operational severity badge. */
export type SeverityBadgeProps = Omit<ViewProps, "children"> & {
  readonly label?: string;
  readonly labels?: SeverityBadgeLabels;
  readonly level: SeverityBadgeLevel;
  readonly ref?: Ref<View>;
  readonly showDot?: boolean;
  readonly tone?: SeverityBadgeTone;
};

type SeverityPresentation = {
  readonly color: string;
  readonly container: ViewStyle;
  readonly foreground: string;
};

const styles = StyleSheet.create({
  dot: { height: 8, width: 8 },
  root: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 24,
  },
});

function getDefaultLabel(
  level: SeverityBadgeLevel,
  labels?: SeverityBadgeLabels,
): string {
  const values = {
    critical: labels?.critical ?? "Critical",
    high: labels?.high ?? "High",
    info: labels?.info ?? "Info",
    low: labels?.low ?? "Low",
    medium: labels?.medium ?? "Medium",
  } satisfies Record<SeverityBadgeLevel, string>;
  return values[level];
}

function getPresentation(
  theme: NativeTheme,
  level: SeverityBadgeLevel,
  tone: SeverityBadgeTone,
): SeverityPresentation {
  const colors = {
    critical: theme.colors.destructive,
    high: theme.colors.destructive,
    info: theme.colors.mutedForeground,
    low: theme.colors.secondaryForeground,
    medium: theme.colors.accentForeground,
  } satisfies Record<SeverityBadgeLevel, string>;
  const color = colors[level];
  const container = {
    backgroundColor:
      tone === "solid"
        ? color
        : tone === "soft"
          ? theme.colors.muted
          : theme.colors.background,
    borderColor: tone === "outline" ? color : theme.colors.border,
  };
  const foreground =
    tone === "solid"
      ? level === "critical" || level === "high"
        ? theme.colors.destructiveForeground
        : theme.colors.primaryForeground
      : theme.colors.foreground;
  return { color, container, foreground };
}

/** Native severity label using shared semantic theme colors. */
function SeverityBadge({
  accessibilityLabel,
  label,
  labels,
  level,
  ref,
  showDot = true,
  style,
  tone = "soft",
  ...props
}: SeverityBadgeProps) {
  const theme = useTheme();
  const resolvedLabel = label ?? getDefaultLabel(level, labels);
  const presentation = getPresentation(theme, level, tone);

  return (
    <View
      {...props}
      accessibilityLabel={accessibilityLabel ?? `${resolvedLabel} severity`}
      accessible
      ref={ref}
      style={[
        styles.root,
        presentation.container,
        {
          borderRadius: theme.radius.full,
          gap: theme.spacing[1],
          paddingHorizontal: theme.spacing[2],
        },
        style,
      ]}
    >
      {showDot ? (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[
            styles.dot,
            {
              backgroundColor: presentation.color,
              borderRadius: theme.radius.full,
            },
          ]}
        />
      ) : null}
      <NativeText
        style={[
          theme.typography.scale.caption,
          {
            color: presentation.foreground,
            fontWeight: theme.typography.fontWeight.heading,
          },
        ]}
      >
        {resolvedLabel}
      </NativeText>
    </View>
  );
}
SeverityBadge.displayName = "SeverityBadge";

export { SeverityBadge };
