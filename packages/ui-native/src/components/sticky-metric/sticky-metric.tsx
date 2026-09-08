import type { ReactNode, Ref } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Text } from "../text/text";

/** Semantic tone for a sticky metric. */
export type StickyMetricTone = "danger" | "neutral" | "success" | "warn";
/** Native screen edge used to pin a sticky metric. */
export type StickyMetricAnchor =
  | "bottom-left"
  | "bottom-right"
  | "top-left"
  | "top-right";

/** Props for a native pinned metric pill. */
export type StickyMetricProps = Omit<ViewProps, "children"> & {
  readonly anchor?: StickyMetricAnchor;
  readonly announceChanges?: boolean;
  readonly detail?: ReactNode;
  readonly label: ReactNode;
  readonly offsetX?: number;
  readonly offsetY?: number;
  readonly ref?: Ref<View>;
  readonly tone?: StickyMetricTone;
  readonly value: ReactNode;
};

const styles = StyleSheet.create({
  dot: { height: 6, width: 6 },
  root: {
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
    position: "absolute",
  },
});

/** Native-adapted metric pill pinned by screen-edge offsets. */
function StickyMetric({
  accessibilityLabel = "Sticky metric",
  anchor = "top-right",
  announceChanges = false,
  detail,
  label,
  offsetX = 0,
  offsetY = 0,
  ref,
  style,
  tone = "neutral",
  value,
  ...props
}: StickyMetricProps) {
  const theme = useTheme();
  const toneColor = {
    danger: theme.colors.destructive,
    neutral: theme.colors.mutedForeground,
    success: theme.colors.primary,
    warn: theme.colors.secondaryForeground,
  } satisfies Record<StickyMetricTone, string>;

  return (
    <View
      {...props}
      accessibilityLabel={accessibilityLabel}
      accessibilityLiveRegion={announceChanges ? "polite" : "none"}
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.full,
          bottom: anchor.startsWith("bottom") ? offsetY : undefined,
          gap: theme.spacing[1],
          left: anchor.endsWith("left") ? offsetX : undefined,
          paddingHorizontal: theme.spacing[2],
          paddingVertical: theme.spacing[1],
          right: anchor.endsWith("right") ? offsetX : undefined,
          top: anchor.startsWith("top") ? offsetY : undefined,
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
            backgroundColor: toneColor[tone],
            borderRadius: theme.radius.full,
          },
        ]}
      />
      <Text size="caption" tone="muted" weight="medium">
        {label}
      </Text>
      <Text size="caption" weight="semibold">
        {value}
      </Text>
      {detail ? (
        <Text size="caption" tone="muted">
          {detail}
        </Text>
      ) : null}
    </View>
  );
}
StickyMetric.displayName = "StickyMetric";

export { StickyMetric };
