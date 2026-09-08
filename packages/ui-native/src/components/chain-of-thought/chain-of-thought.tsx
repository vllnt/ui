import type { Ref } from "react";
import {
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** State of one ordered reasoning step. */
export type ChainOfThoughtStatus = "active" | "complete" | "error" | "pending";

/** One text step in a native reasoning sequence. */
export type ChainOfThoughtStep = {
  readonly description?: string;
  readonly id: string;
  readonly status?: ChainOfThoughtStatus;
  readonly title: string;
};

/** Caller-localized status names announced and rendered for each step. */
export type ChainOfThoughtStatusLabels = Readonly<
  Record<ChainOfThoughtStatus, string>
>;

/** Props for the native ordered reasoning sequence. */
export type ChainOfThoughtProps = Omit<ViewProps, "children"> & {
  readonly ref?: Ref<View>;
  readonly statusLabels: ChainOfThoughtStatusLabels;
  readonly steps: readonly ChainOfThoughtStep[];
};

const styles = StyleSheet.create({
  content: { flex: 1 },
  item: { alignItems: "flex-start", flexDirection: "row" },
  marker: {
    alignItems: "center",
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 24,
    minWidth: 24,
  },
  rail: { alignSelf: "center", flex: 1, minHeight: 16, width: 1 },
  railColumn: { alignSelf: "stretch" },
});

function getStatusColor(
  status: ChainOfThoughtStatus,
  colors: {
    readonly destructive: string;
    readonly mutedForeground: string;
    readonly primary: string;
  },
): string {
  if (status === "error") return colors.destructive;
  if (status === "active" || status === "complete") return colors.primary;
  return colors.mutedForeground;
}

function StepMarker({
  index,
  isLast,
  statusColor,
}: {
  readonly index: number;
  readonly isLast: boolean;
  readonly statusColor: string;
}) {
  const theme = useTheme();
  return (
    <View style={styles.railColumn}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.marker,
          { borderColor: statusColor, borderRadius: theme.radius.full },
        ]}
      >
        <Text style={[theme.typography.scale.caption, { color: statusColor }]}>
          {index + 1}
        </Text>
      </View>
      {isLast ? null : (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[styles.rail, { backgroundColor: theme.colors.border }]}
        />
      )}
    </View>
  );
}
StepMarker.displayName = "StepMarker";

function StepText({
  isLast,
  status,
  statusColor,
  statusLabels,
  step,
}: {
  readonly isLast: boolean;
  readonly status: ChainOfThoughtStatus;
  readonly statusColor: string;
  readonly statusLabels: ChainOfThoughtStatusLabels;
  readonly step: ChainOfThoughtStep;
}) {
  const theme = useTheme();
  const titleStyle: TextStyle = {
    color:
      status === "pending"
        ? theme.colors.mutedForeground
        : theme.colors.foreground,
    fontWeight: theme.typography.fontWeight.caption,
  };
  return (
    <View
      style={[styles.content, { paddingBottom: isLast ? 0 : theme.spacing[4] }]}
    >
      <Text style={[theme.typography.scale.bodySmall, titleStyle]}>
        {step.title}
      </Text>
      <Text
        style={[
          theme.typography.scale.caption,
          { color: statusColor, marginTop: theme.spacing[1] },
        ]}
      >
        {statusLabels[status]}
      </Text>
      {step.description ? (
        <Text
          style={[
            theme.typography.scale.caption,
            {
              color: theme.colors.mutedForeground,
              marginTop: theme.spacing[1],
            },
          ]}
        >
          {step.description}
        </Text>
      ) : null}
    </View>
  );
}
StepText.displayName = "StepText";

function ChainOfThoughtItem({
  index,
  isLast,
  statusLabels,
  step,
}: {
  readonly index: number;
  readonly isLast: boolean;
  readonly statusLabels: ChainOfThoughtStatusLabels;
  readonly step: ChainOfThoughtStep;
}) {
  const theme = useTheme();
  const status = step.status ?? "pending";
  const statusColor = getStatusColor(status, theme.colors);
  return (
    <View
      accessibilityLabel={`${step.title}, ${statusLabels[status]}`}
      accessibilityState={{ busy: status === "active" }}
      style={[styles.item, { gap: theme.spacing[3] }]}
    >
      <StepMarker index={index} isLast={isLast} statusColor={statusColor} />
      <StepText
        isLast={isLast}
        status={status}
        statusColor={statusColor}
        statusLabels={statusLabels}
        step={step}
      />
    </View>
  );
}
ChainOfThoughtItem.displayName = "ChainOfThoughtItem";

/** Native ordered, status-aware reasoning sequence. */
function ChainOfThought({
  accessibilityLabel,
  ref,
  statusLabels,
  steps,
  style,
  ...props
}: ChainOfThoughtProps) {
  return (
    <View
      {...props}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="list"
      ref={ref}
      style={style}
    >
      {steps.map((step, index) => (
        <ChainOfThoughtItem
          index={index}
          isLast={index === steps.length - 1}
          key={step.id}
          statusLabels={statusLabels}
          step={step}
        />
      ))}
    </View>
  );
}
ChainOfThought.displayName = "ChainOfThought";

export { ChainOfThought };
