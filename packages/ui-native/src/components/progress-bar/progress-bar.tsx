import type { Ref } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Text } from "../text/text";

/** Localized status words; English defaults keep the previous output. */
export type ProgressBarLabels = {
  /** Status when complete. Defaults to "Complete". */
  readonly complete?: string;
  /** Loading text for a status. Defaults to `Loading <status in lower case>`. */
  readonly loading?: (status: string) => string;
  /** Status while in progress. Defaults to "Progress". */
  readonly progress?: string;
};

/** Props for an accessible native progress indicator. */
export type ProgressBarProps = Omit<ViewProps, "children"> & {
  readonly completedLabel?: string;
  readonly currentLabel?: string;
  readonly isComplete?: boolean;
  readonly isLoading?: boolean;
  readonly labels?: ProgressBarLabels;
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
  const normalizedMax = Number.isFinite(max) ? Math.max(0, max) : 0;
  const normalizedValue = Number.isFinite(value)
    ? Math.min(Math.max(0, value), normalizedMax)
    : 0;
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

function resolveStatus({
  complete,
  currentLabel,
  isLoading,
  labels,
}: {
  readonly complete: boolean;
  readonly currentLabel?: string;
  readonly isLoading: boolean;
  readonly labels?: ProgressBarLabels;
}) {
  const statusLabel =
    currentLabel ??
    (complete
      ? (labels?.complete ?? "Complete")
      : (labels?.progress ?? "Progress"));
  if (!isLoading) return { loadingLabel: undefined, statusLabel };
  const loadingLabel = labels?.loading
    ? labels.loading(statusLabel)
    : `Loading ${statusLabel.toLowerCase()}`;
  return { loadingLabel, statusLabel };
}

function spokenProgress(state: ProgressState, loadingLabel?: string) {
  return loadingLabel === undefined
    ? {
        max: state.max,
        min: 0,
        now: state.value,
        text: `${state.percent}%`,
      }
    : { text: loadingLabel };
}

function ProgressLabels({
  completedLabel,
  loadingLabel,
  state,
  statusLabel,
}: {
  readonly completedLabel: string;
  readonly loadingLabel?: string;
  readonly state: ProgressState;
  readonly statusLabel: string;
}) {
  return (
    <View style={styles.labelRow}>
      <Text size="small" weight="medium">
        {loadingLabel ?? statusLabel}
      </Text>
      {loadingLabel === undefined ? (
        <Text size="small" tone="muted">
          {state.value} / {state.max} {completedLabel}
        </Text>
      ) : null}
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
  accessibilityValue,
  completedLabel = "completed",
  currentLabel,
  isComplete,
  isLoading = false,
  labels,
  max,
  ref,
  showLabels = true,
  style,
  value,
  ...props
}: ProgressBarProps) {
  const theme = useTheme();
  const state = getProgressState(max, value, isComplete);
  const { loadingLabel, statusLabel } = resolveStatus({
    complete: state.complete,
    currentLabel,
    isLoading,
    labels,
  });

  return (
    <View
      {...props}
      accessibilityLabel={accessibilityLabel ?? statusLabel}
      accessibilityRole="progressbar"
      accessibilityState={{ busy: isLoading }}
      accessibilityValue={
        accessibilityValue ?? spokenProgress(state, loadingLabel)
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
          loadingLabel={loadingLabel}
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
