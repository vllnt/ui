import type { Ref } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Text } from "../text/text";

/** Props for an accessible native progress indicator. */
export type ProgressBarProps = Omit<ViewProps, "children"> & {
  readonly completedLabel?: string;
  readonly currentLabel?: string;
  readonly isComplete?: boolean;
  readonly isLoading?: boolean;
  readonly max: number;
  readonly ref?: Ref<View>;
  readonly showLabels?: boolean;
  readonly value: number;
};

type ProgressState = {
  readonly complete: boolean;
  readonly max: number;
  readonly percent: number;
  readonly value: number;
};

const styles = StyleSheet.create({
  fill: { height: "100%" },
  labelRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  root: { borderWidth: 1 },
  track: { height: 8, overflow: "hidden", width: "100%" },
});

function getProgressState(
  max: number,
  value: number,
  isComplete?: boolean,
): ProgressState {
  const normalizedMax = Math.max(0, max);
  const normalizedValue = Math.min(Math.max(0, value), normalizedMax);
  const complete =
    isComplete ?? (normalizedMax > 0 && normalizedValue >= normalizedMax);
  const percent =
    normalizedMax > 0 ? Math.round((normalizedValue / normalizedMax) * 100) : 0;
  return {
    complete,
    max: normalizedMax,
    percent,
    value: normalizedValue,
  };
}

function ProgressLabels({
  completedLabel,
  isLoading,
  state,
  statusLabel,
}: {
  readonly completedLabel: string;
  readonly isLoading: boolean;
  readonly state: ProgressState;
  readonly statusLabel: string;
}) {
  return (
    <View style={styles.labelRow}>
      <Text size="small" weight="medium">
        {isLoading ? `Loading ${statusLabel.toLowerCase()}` : statusLabel}
      </Text>
      {isLoading ? null : (
        <Text size="small" tone="muted">
          {state.value} / {state.max} {completedLabel}
        </Text>
      )}
    </View>
  );
}
ProgressLabels.displayName = "ProgressLabels";

function ProgressTrack({
  complete,
  isLoading,
  percent,
}: {
  readonly complete: boolean;
  readonly isLoading: boolean;
  readonly percent: number;
}) {
  const theme = useTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.track,
        {
          backgroundColor: theme.colors.muted,
          borderRadius: theme.radius.full,
        },
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            backgroundColor: complete
              ? theme.colors.primary
              : theme.colors.foreground,
            borderRadius: theme.radius.full,
            width: `${isLoading ? 0 : percent}%`,
          },
        ]}
      />
    </View>
  );
}
ProgressTrack.displayName = "ProgressTrack";

/** Native progress bar with clamped values and React Native accessibility state. */
function ProgressBar({
  accessibilityLabel,
  completedLabel = "completed",
  currentLabel,
  isComplete,
  isLoading = false,
  max,
  ref,
  showLabels = true,
  style,
  value,
  ...props
}: ProgressBarProps) {
  const theme = useTheme();
  const state = getProgressState(max, value, isComplete);
  const statusLabel =
    currentLabel ?? (state.complete ? "Complete" : "Progress");

  return (
    <View
      {...props}
      accessibilityLabel={accessibilityLabel ?? statusLabel}
      accessibilityRole="progressbar"
      accessibilityState={{ busy: isLoading }}
      accessibilityValue={
        isLoading
          ? { text: `Loading ${statusLabel.toLowerCase()}` }
          : {
              max: state.max,
              min: 0,
              now: state.value,
              text: `${state.percent}%`,
            }
      }
      accessible
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.card,
          borderColor: state.complete
            ? theme.colors.primary
            : theme.colors.border,
          borderRadius: theme.radius.md,
          gap: theme.spacing[2],
          padding: theme.spacing[4],
        },
        style,
      ]}
    >
      {showLabels ? (
        <ProgressLabels
          completedLabel={completedLabel}
          isLoading={isLoading}
          state={state}
          statusLabel={statusLabel}
        />
      ) : null}
      <ProgressTrack
        complete={state.complete}
        isLoading={isLoading}
        percent={state.percent}
      />
    </View>
  );
}
ProgressBar.displayName = "ProgressBar";

export { ProgressBar };
