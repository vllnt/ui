import type { Ref } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { useAnnounceOnChange } from "../../primitives/accessibility";
import { useTheme } from "../../theme/theme-provider";
import { Badge, type BadgeProps } from "../badge/badge";
import { Card } from "../card/card";
import { Heading } from "../heading/heading";
import { Text } from "../text/text";

/** Canonical service states supported by the native status board. */
export type StatusBoardStatus =
  | "critical"
  | "healthy"
  | "maintenance"
  | "offline"
  | "warning";

/** One caller-keyed service status. */
export type StatusBoardItem = {
  readonly description?: string;
  readonly id: string;
  readonly label: string;
  readonly meta?: string;
  readonly status: StatusBoardStatus;
  readonly value?: string;
};

/** Optional localized status-board text. */
export type StatusBoardLabels = {
  readonly critical?: string;
  readonly healthy?: string;
  readonly maintenance?: string;
  readonly noMetric?: string;
  readonly offline?: string;
  readonly warning?: string;
};

/** Props for a native service status board. */
export type StatusBoardProps = Omit<ViewProps, "children"> & {
  /** Announces a service's name and new status when its status changes. */
  readonly announceChanges?: boolean;
  readonly description?: string;
  readonly emptyLabel?: string;
  readonly items: readonly StatusBoardItem[];
  readonly labels?: StatusBoardLabels;
  readonly ref?: Ref<View>;
  readonly title?: string;
};

type StatusPresentation = {
  readonly label: string;
  readonly variant: NonNullable<BadgeProps["variant"]>;
};

const STATUS_ORDER: readonly StatusBoardStatus[] = [
  "healthy",
  "warning",
  "critical",
  "maintenance",
  "offline",
];

const styles = StyleSheet.create({
  cardTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dot: { height: 10, width: 10 },
  row: { alignItems: "center", flexDirection: "row" },
});

function getPresentation(
  labels?: StatusBoardLabels,
): Record<StatusBoardStatus, StatusPresentation> {
  return {
    critical: {
      label: labels?.critical ?? "Critical",
      variant: "destructive",
    },
    healthy: { label: labels?.healthy ?? "Healthy", variant: "default" },
    maintenance: {
      label: labels?.maintenance ?? "Maintenance",
      variant: "secondary",
    },
    offline: { label: labels?.offline ?? "Offline", variant: "outline" },
    warning: { label: labels?.warning ?? "Warning", variant: "secondary" },
  };
}

function StatusSummary({
  items,
  presentation,
}: {
  readonly items: readonly StatusBoardItem[];
  readonly presentation: Record<StatusBoardStatus, StatusPresentation>;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.row, { flexWrap: "wrap", gap: theme.spacing[2] }]}>
      {STATUS_ORDER.map((status) => {
        const count = items.filter((item) => item.status === status).length;
        return count > 0 ? (
          <Badge key={status} variant={presentation[status].variant}>
            {count} {presentation[status].label}
          </Badge>
        ) : null;
      })}
    </View>
  );
}
StatusSummary.displayName = "StatusSummary";

function statusColorOf(
  colors: {
    readonly accentForeground: string;
    readonly destructive: string;
    readonly mutedForeground: string;
    readonly primary: string;
    readonly secondaryForeground: string;
  },
  status: StatusBoardStatus,
): string {
  const values = {
    critical: colors.destructive,
    healthy: colors.primary,
    maintenance: colors.secondaryForeground,
    offline: colors.mutedForeground,
    warning: colors.accentForeground,
  } satisfies Record<StatusBoardStatus, string>;
  return values[status];
}

function StatusCard({
  announceChanges,
  item,
  noMetricLabel,
  presentation,
}: {
  readonly announceChanges: boolean;
  readonly item: StatusBoardItem;
  readonly noMetricLabel: string;
  readonly presentation: Record<StatusBoardStatus, StatusPresentation>;
}) {
  const theme = useTheme();
  const current = presentation[item.status];
  useAnnounceOnChange(
    announceChanges ? `${item.label}, ${current.label}` : undefined,
  );

  return (
    <Card
      accessibilityLabel={[
        item.label,
        current.label,
        item.description,
        item.value ?? noMetricLabel,
        item.meta,
      ]
        .filter((value) => value !== undefined && value.length > 0)
        .join(", ")}
      accessible
      style={{ gap: theme.spacing[3], padding: theme.spacing[4] }}
    >
      <View style={[styles.cardTop, { gap: theme.spacing[3] }]}>
        <View style={{ flex: 1, gap: theme.spacing[1] }}>
          <View style={[styles.row, { gap: theme.spacing[2] }]}>
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[
                styles.dot,
                {
                  backgroundColor: statusColorOf(theme.colors, item.status),
                  borderRadius: theme.radius.full,
                },
              ]}
            />
            <Text weight="semibold">{item.label}</Text>
          </View>
          {item.description ? (
            <Text size="small" tone="muted">
              {item.description}
            </Text>
          ) : null}
        </View>
        <Badge variant={current.variant}>{current.label}</Badge>
      </View>
      <View style={[styles.row, { justifyContent: "space-between" }]}>
        <Text weight="semibold">{item.value ?? noMetricLabel}</Text>
        {item.meta ? (
          <Text size="caption" tone="muted">
            {item.meta}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}
StatusCard.displayName = "StatusCard";

/**
 * Native service-health board with textual summaries and caller-stable keys.
 * The visible heading names the board; with `announceChanges`, it announces
 * each service whose status changed (both platforms) instead of re-reading the
 * whole board.
 */
function StatusBoard({
  accessibilityLabel,
  announceChanges = false,
  description,
  emptyLabel = "No services to report.",
  items,
  labels,
  ref,
  style,
  title = "Status board",
  ...props
}: StatusBoardProps) {
  const theme = useTheme();
  const presentation = getPresentation(labels);
  const noMetricLabel = labels?.noMetric ?? "No metric reported";

  return (
    <View
      {...props}
      accessibilityLabel={accessibilityLabel}
      ref={ref}
      style={[{ gap: theme.spacing[4] }, style]}
    >
      <View style={{ gap: theme.spacing[1] }}>
        <Heading level={2} size={5}>
          {title}
        </Heading>
        {description ? (
          <Text size="small" tone="muted">
            {description}
          </Text>
        ) : null}
      </View>
      <StatusSummary items={items} presentation={presentation} />
      {items.length === 0 ? (
        <Text size="small" tone="muted">
          {emptyLabel}
        </Text>
      ) : (
        items.map((item) => (
          <StatusCard
            announceChanges={announceChanges}
            item={item}
            key={item.id}
            noMetricLabel={noMetricLabel}
            presentation={presentation}
          />
        ))
      )}
    </View>
  );
}
StatusBoard.displayName = "StatusBoard";

export { StatusBoard };
