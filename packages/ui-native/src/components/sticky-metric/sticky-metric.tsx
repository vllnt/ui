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
import { Text } from "../text/text";

/** Semantic tone for a sticky metric. */
export type StickyMetricTone = "danger" | "neutral" | "success" | "warn";
/** Native screen edge used to pin a sticky metric. */
export type StickyMetricAnchor =
  | "bottom-left"
  | "bottom-right"
  | "top-left"
  | "top-right";

/** Localized tone words spoken with the value; English defaults. */
export type StickyMetricLabels = {
  /** Defaults: Critical, Good, Warning (none for neutral). */
  readonly tone?: Partial<Record<StickyMetricTone, string>>;
};

/** Props for a native pinned metric pill. */
export type StickyMetricProps = Omit<ViewProps, "children"> & {
  readonly anchor?: StickyMetricAnchor;
  /** Announces "label, value" when the value changes. */
  readonly announceChanges?: boolean;
  readonly detail?: ReactNode;
  readonly label: ReactNode;
  readonly labels?: StickyMetricLabels;
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

const defaultToneLabels: Readonly<Partial<Record<StickyMetricTone, string>>> = {
  danger: "Critical",
  success: "Good",
  warn: "Warning",
};

function anchorPosition(
  anchor: StickyMetricAnchor,
  offsetX: number,
  offsetY: number,
) {
  return {
    bottom: anchor.startsWith("bottom") ? offsetY : undefined,
    left: anchor.endsWith("left") ? offsetX : undefined,
    right: anchor.endsWith("right") ? offsetX : undefined,
    top: anchor.startsWith("top") ? offsetY : undefined,
  };
}

function toneColorOf(theme: NativeTheme, tone: StickyMetricTone): string {
  const colors = {
    danger: theme.colors.destructive,
    neutral: theme.colors.mutedForeground,
    success: theme.colors.primary,
    warn: theme.colors.secondaryForeground,
  } satisfies Record<StickyMetricTone, string>;
  return colors[tone];
}

/** One screen-reader stop with name and value when the content is plain text. */
function useMetricSemantics({
  accessibilityLabel,
  announceChanges,
  detail,
  label,
  labels,
  tone,
  value,
}: Pick<
  StickyMetricProps,
  "accessibilityLabel" | "detail" | "label" | "labels" | "value"
> & {
  readonly announceChanges: boolean;
  readonly tone: StickyMetricTone;
}) {
  const name = accessibilityLabel ?? plainText(label);
  const valueText = plainText(value);
  useAnnounceOnChange(
    announceChanges
      ? joinAccessibilityText([name, valueText], ", ")
      : undefined,
  );
  if (name === undefined || valueText === undefined) return;
  return {
    accessibilityLabel: name,
    accessibilityValue: {
      text: joinAccessibilityText(
        [
          valueText,
          plainText(detail),
          labels?.tone?.[tone] ?? defaultToneLabels[tone],
        ],
        ", ",
      ),
    },
    accessible: true,
  };
}

/**
 * Native-adapted metric pill pinned by screen-edge offsets. With plain-text
 * content the pill is one screen-reader stop: its label (or
 * `accessibilityLabel`) as the name and "value, detail, tone" as the value.
 */
function StickyMetric({
  accessibilityLabel,
  anchor = "top-right",
  announceChanges = false,
  detail,
  label,
  labels,
  offsetX = 0,
  offsetY = 0,
  ref,
  style,
  tone = "neutral",
  value,
  ...props
}: StickyMetricProps) {
  const theme = useTheme();
  const semantics = useMetricSemantics({
    accessibilityLabel,
    announceChanges,
    detail,
    label,
    labels,
    tone,
    value,
  });

  return (
    <View
      {...props}
      {...semantics}
      ref={ref}
      style={[
        styles.root,
        anchorPosition(anchor, offsetX, offsetY),
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
        {...decorativeProps}
        style={[
          styles.dot,
          {
            backgroundColor: toneColorOf(theme, tone),
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
