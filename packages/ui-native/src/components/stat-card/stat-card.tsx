import type { NativeTheme } from "@vllnt/ui-core";
import type { ReactNode, Ref } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Card, CardContent, CardHeader } from "../card/card";
import { Text } from "../text/text";

/** Visual tone for a native statistic card. */
export type StatCardTone = "danger" | "neutral" | "success" | "warning";
/** Direction communicated by a statistic change. */
export type StatCardTrend = "down" | "neutral" | "up";

/** Props for a native headline statistic card. */
export type StatCardProps = Omit<ViewProps, "children"> & {
  readonly change?: ReactNode;
  readonly description?: ReactNode;
  readonly icon?: ReactNode;
  readonly label: ReactNode;
  readonly meta?: ReactNode;
  readonly ref?: Ref<View>;
  readonly tone?: StatCardTone;
  readonly trend?: StatCardTrend;
  readonly value: ReactNode;
};

const styles = StyleSheet.create({
  accent: { height: 4 },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  value: { fontVariant: ["tabular-nums"] },
});

function getToneColor(theme: NativeTheme, tone: StatCardTone): string {
  const colors = {
    danger: theme.colors.destructive,
    neutral: theme.colors.mutedForeground,
    success: theme.colors.primary,
    warning: theme.colors.secondaryForeground,
  } satisfies Record<StatCardTone, string>;
  return colors[tone];
}

function StatHeader({
  icon,
  label,
  value,
}: Pick<StatCardProps, "icon" | "label" | "value">) {
  const theme = useTheme();
  return (
    <CardHeader style={styles.header}>
      <View style={{ flex: 1, gap: theme.spacing[1] }}>
        <Text size="caption" tone="muted" weight="medium">
          {label}
        </Text>
        <Text
          accessibilityLiveRegion="polite"
          style={[theme.typography.scale.h3, styles.value]}
          weight="semibold"
        >
          {value}
        </Text>
      </View>
      {icon ? (
        <View style={{ marginLeft: theme.spacing[3] }}>{icon}</View>
      ) : null}
    </CardHeader>
  );
}
StatHeader.displayName = "StatHeader";

function StatDetails({
  change,
  description,
  meta,
  trend,
}: Pick<StatCardProps, "change" | "description" | "meta"> & {
  readonly trend: StatCardTrend;
}) {
  const theme = useTheme();
  const trendPrefix = {
    down: "Decrease",
    neutral: "No change",
    up: "Increase",
  } satisfies Record<StatCardTrend, string>;
  if (!description && !change && !meta) return null;
  return (
    <CardContent style={{ gap: theme.spacing[3] }}>
      {description ? (
        <Text size="small" tone="muted">
          {description}
        </Text>
      ) : null}
      {change || meta ? (
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          {change ? (
            <Text size="caption" weight="medium">
              {trendPrefix[trend]} · {change}
            </Text>
          ) : null}
          {meta ? (
            <Text size="caption" tone="muted">
              {meta}
            </Text>
          ) : null}
        </View>
      ) : null}
    </CardContent>
  );
}
StatDetails.displayName = "StatDetails";

/** Native KPI card for a formatted value and supporting trend context. */
function StatCard({
  change,
  description,
  icon,
  label,
  meta,
  ref,
  style,
  tone = "neutral",
  trend = "neutral",
  value,
  ...props
}: StatCardProps) {
  const theme = useTheme();
  return (
    <Card {...props} ref={ref} style={style}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.accent, { backgroundColor: getToneColor(theme, tone) }]}
      />
      <StatHeader icon={icon} label={label} value={value} />
      <StatDetails
        change={change}
        description={description}
        meta={meta}
        trend={trend}
      />
    </Card>
  );
}
StatCard.displayName = "StatCard";

export { StatCard };
