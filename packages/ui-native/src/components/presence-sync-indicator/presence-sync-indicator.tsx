import type { NativeTheme } from "@vllnt/ui-core";
import type { Ref } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Text } from "../text/text";

/** Connection and synchronization state. */
export type PresenceSyncState =
  | "error"
  | "live"
  | "offline"
  | "reconnecting"
  | "syncing";

/** Optional localized presence synchronization labels. */
export type PresenceSyncIndicatorLabels = {
  readonly error?: string;
  readonly live?: string;
  readonly offline?: string;
  readonly reconnecting?: string;
  readonly region?: string;
  readonly syncing?: string;
};

/** Props for a native presence synchronization indicator. */
export type PresenceSyncIndicatorProps = Omit<ViewProps, "children"> & {
  readonly label?: string;
  readonly labels?: PresenceSyncIndicatorLabels;
  readonly ref?: Ref<View>;
  readonly state: PresenceSyncState;
  readonly status?: string;
};

const styles = StyleSheet.create({
  dot: { height: 7, width: 7 },
  root: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    flexDirection: "row",
  },
});

function getStateLabel(
  state: PresenceSyncState,
  labels?: PresenceSyncIndicatorLabels,
): string {
  const values = {
    error: labels?.error ?? "Sync error",
    live: labels?.live ?? "Live",
    offline: labels?.offline ?? "Offline",
    reconnecting: labels?.reconnecting ?? "Reconnecting",
    syncing: labels?.syncing ?? "Syncing",
  } satisfies Record<PresenceSyncState, string>;
  return values[state];
}

function getStateColor(theme: NativeTheme, state: PresenceSyncState): string {
  const values = {
    error: theme.colors.destructive,
    live: theme.colors.primary,
    offline: theme.colors.mutedForeground,
    reconnecting: theme.colors.accentForeground,
    syncing: theme.colors.secondaryForeground,
  } satisfies Record<PresenceSyncState, string>;
  return values[state];
}

/** Native live-region indicator for collaboration connection health. */
function PresenceSyncIndicator({
  accessibilityLabel,
  label,
  labels,
  ref,
  state,
  status,
  style,
  ...props
}: PresenceSyncIndicatorProps) {
  const theme = useTheme();
  const stateLabel = getStateLabel(state, labels);
  const regionLabel = labels?.region ?? "Presence sync";
  const statusSuffix = status ? `, ${status}` : "";

  return (
    <View
      {...props}
      accessibilityLabel={
        accessibilityLabel ?? `${regionLabel}: ${stateLabel}${statusSuffix}`
      }
      accessibilityLiveRegion="polite"
      accessible
      ref={ref}
      role="status"
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.full,
          gap: theme.spacing[1],
          paddingHorizontal: theme.spacing[2],
          paddingVertical: theme.spacing[1],
        },
        style,
      ]}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.dot,
          {
            backgroundColor: getStateColor(theme, state),
            borderRadius: theme.radius.full,
          },
        ]}
      />
      <Text size="caption" weight="medium">
        {label ?? stateLabel}
      </Text>
      {status ? (
        <Text size="caption" tone="muted">
          {status}
        </Text>
      ) : null}
    </View>
  );
}
PresenceSyncIndicator.displayName = "PresenceSyncIndicator";

export { PresenceSyncIndicator };
