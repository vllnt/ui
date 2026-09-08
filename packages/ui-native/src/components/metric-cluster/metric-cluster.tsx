import type { NativeTheme } from "@vllnt/ui-core";
import type { ReactNode, Ref } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Text } from "../text/text";

/** Semantic tone for a metric cluster entry. */
export type MetricClusterTone = "danger" | "neutral" | "success" | "warn";
/** Native screen edge used to pin a metric cluster. */
export type MetricClusterAnchor =
  | "bottom-left"
  | "bottom-right"
  | "top-left"
  | "top-right";

/** One caller-keyed metric line. */
export type MetricClusterEntry = {
  readonly accessibilityLabel?: string;
  readonly id: string;
  readonly label: ReactNode;
  readonly tone?: MetricClusterTone;
  readonly value: ReactNode;
};

/** Props for a compact native metric cluster overlay. */
export type MetricClusterProps = Omit<ViewProps, "children"> & {
  readonly anchor?: MetricClusterAnchor;
  readonly announceChanges?: boolean;
  readonly metrics: readonly MetricClusterEntry[];
  readonly offsetX?: number;
  readonly offsetY?: number;
  readonly ref?: Ref<View>;
  readonly title?: ReactNode;
};

const styles = StyleSheet.create({
  dot: { height: 6, width: 6 },
  root: { borderWidth: 1, position: "absolute" },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

function getToneColor(theme: NativeTheme, tone: MetricClusterTone): string {
  const colors = {
    danger: theme.colors.destructive,
    neutral: theme.colors.mutedForeground,
    success: theme.colors.primary,
    warn: theme.colors.secondaryForeground,
  } satisfies Record<MetricClusterTone, string>;
  return colors[tone];
}

function MetricRow({ entry }: { readonly entry: MetricClusterEntry }) {
  const theme = useTheme();
  const tone = entry.tone ?? "neutral";
  return (
    <View
      accessibilityLabel={entry.accessibilityLabel}
      accessible={entry.accessibilityLabel !== undefined}
      style={[styles.row, { gap: theme.spacing[2] }]}
    >
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          gap: theme.spacing[1],
        }}
      >
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[
            styles.dot,
            {
              backgroundColor: getToneColor(theme, tone),
              borderRadius: theme.radius.full,
            },
          ]}
        />
        <Text size="caption" tone="muted">
          {entry.label}
        </Text>
      </View>
      <Text size="caption" weight="semibold">
        {entry.value}
      </Text>
    </View>
  );
}
MetricRow.displayName = "MetricRow";

/** Native-adapted metric overlay pinned by edge offsets, not canvas coordinates. */
function MetricCluster({
  accessibilityLabel = "Metric cluster",
  anchor = "top-right",
  announceChanges = false,
  metrics,
  offsetX = 0,
  offsetY = 0,
  ref,
  style,
  title,
  ...props
}: MetricClusterProps) {
  const theme = useTheme();
  const position = {
    bottom: anchor.startsWith("bottom") ? offsetY : undefined,
    left: anchor.endsWith("left") ? offsetX : undefined,
    right: anchor.endsWith("right") ? offsetX : undefined,
    top: anchor.startsWith("top") ? offsetY : undefined,
  };

  return (
    <View
      {...props}
      accessibilityLabel={accessibilityLabel}
      accessibilityLiveRegion={announceChanges ? "polite" : "none"}
      ref={ref}
      style={[
        styles.root,
        position,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          gap: theme.spacing[1],
          padding: theme.spacing[2],
        },
        style,
      ]}
    >
      {title ? (
        <Text size="caption" tone="muted" weight="medium">
          {title}
        </Text>
      ) : null}
      {metrics.map((entry) => (
        <MetricRow entry={entry} key={entry.id} />
      ))}
    </View>
  );
}
MetricCluster.displayName = "MetricCluster";

export { MetricCluster };
