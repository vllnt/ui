import type { NativeTheme } from "@vllnt/ui-core";
import type { ReactNode, Ref } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import {
  decorativeProps,
  joinAccessibilityText,
  plainText,
  useAnnounceOnChange,
} from "../../primitives/accessibility";
import { useTheme } from "../../theme/theme-provider";
import { Card, CardContent, CardHeader } from "../card/card";
import { Text } from "../text/text";

/** Visual tone for a native statistic card. */
export type StatCardTone = "danger" | "neutral" | "success" | "warning";
/** Direction communicated by a statistic change. */
export type StatCardTrend = "down" | "neutral" | "up";

/** Localized tone and trend words; English defaults. */
export type StatCardLabels = {
  /** Tone spoken with the value, beside the accent colour. Defaults: Critical, Good, Warning (none for neutral). */
  readonly tone?: Partial<Record<StatCardTone, string>>;
  /** Visible change prefix. Defaults: Decrease, No change, Increase. */
  readonly trend?: Partial<Record<StatCardTrend, string>>;
};

/** Props for a native headline statistic card. */
export type StatCardProps = Omit<ViewProps, "children"> & {
  /** Announces "label: value" when the value changes. Off by default. */
  readonly announceChanges?: boolean;
  readonly change?: ReactNode;
  readonly description?: ReactNode;
  readonly icon?: ReactNode;
  readonly label: ReactNode;
  readonly labels?: StatCardLabels;
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

const defaultToneLabels: Readonly<Partial<Record<StatCardTone, string>>> = {
  danger: "Critical",
  success: "Good",
  warning: "Warning",
};

function hasContent(node: ReactNode): boolean {
  if (typeof node === "number") return !Number.isNaN(node);
  return node !== undefined && node !== null && node !== false && node !== "";
}

function StatHeader({
  announceChanges,
  icon,
  label,
  toneLabel,
  value,
}: Pick<StatCardProps, "icon" | "label" | "value"> & {
  readonly announceChanges: boolean;
  readonly toneLabel?: string;
}) {
  const theme = useTheme();
  const valueText = plainText(value);
  const labelText = plainText(label);
  useAnnounceOnChange(
    announceChanges
      ? joinAccessibilityText([labelText, valueText], ": ")
      : undefined,
  );
  return (
    <CardHeader style={styles.header}>
      <View style={{ flex: 1, gap: theme.spacing[1] }}>
        <Text size="caption" tone="muted" weight="medium">
          {label}
        </Text>
        <Text
          accessibilityHint={valueText === undefined ? toneLabel : undefined}
          accessibilityLabel={
            valueText === undefined
              ? undefined
              : joinAccessibilityText([valueText, toneLabel], ", ")
          }
          style={[theme.typography.scale.h3, styles.value]}
          weight="semibold"
        >
          {value}
        </Text>
      </View>
      {icon ? (
        <View {...decorativeProps} style={{ marginLeft: theme.spacing[3] }}>
          {icon}
        </View>
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
  trendLabels,
}: Pick<StatCardProps, "change" | "description" | "meta"> & {
  readonly trend: StatCardTrend;
  readonly trendLabels?: StatCardLabels["trend"];
}) {
  const theme = useTheme();
  const trendPrefix = {
    down: trendLabels?.down ?? "Decrease",
    neutral: trendLabels?.neutral ?? "No change",
    up: trendLabels?.up ?? "Increase",
  } satisfies Record<StatCardTrend, string>;
  const showChange = hasContent(change);
  const showDescription = hasContent(description);
  const showMeta = hasContent(meta);
  if (!showDescription && !showChange && !showMeta) return null;
  return (
    <CardContent style={{ gap: theme.spacing[3] }}>
      {showDescription ? (
        <Text size="small" tone="muted">
          {description}
        </Text>
      ) : null}
      {showChange || showMeta ? (
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          {showChange ? (
            <Text size="caption" weight="medium">
              {trendPrefix[trend]} · {change}
            </Text>
          ) : null}
          {showMeta ? (
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

/**
 * Native KPI card for a formatted value and supporting trend context. The
 * value speaks its tone ("1,240, Critical") as well as the accent colour;
 * the icon slot is decorative.
 */
function StatCard({
  announceChanges = false,
  change,
  description,
  icon,
  label,
  labels,
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
      <StatHeader
        announceChanges={announceChanges}
        icon={icon}
        label={label}
        toneLabel={labels?.tone?.[tone] ?? defaultToneLabels[tone]}
        value={value}
      />
      <StatDetails
        change={change}
        description={description}
        meta={meta}
        trend={trend}
        trendLabels={labels?.trend}
      />
    </Card>
  );
}
StatCard.displayName = "StatCard";

export { StatCard };
