import type { ReactNode, Ref } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import {
  decorativeProps,
  joinAccessibilityText,
  plainText,
  useAnnounceOnChange,
} from "../../../primitives/accessibility";
import { useTheme } from "../../../theme/theme-provider";
import { Button } from "../../atoms/button/button";
import { Card } from "../../atoms/card/card";
import { Heading } from "../../atoms/heading/heading";
import { Text } from "../../atoms/text/text";

/** Visual tone for a native overview card. */
export type OverviewCardTone = "danger" | "default" | "warning";

/** One caller-keyed overview board item. */
export type OverviewBoardItem = {
  readonly ctaLabel?: string;
  readonly description: ReactNode;
  readonly heading: ReactNode;
  readonly icon?: ReactNode;
  readonly id: string;
  readonly metric: ReactNode;
  readonly onCtaPress?: () => void;
  readonly tone?: OverviewCardTone;
};

/** Localized tone words spoken with the metric; English defaults. */
export type OverviewBoardLabels = {
  /** Defaults: Critical, Warning (none for default). */
  readonly tone?: Partial<Record<OverviewCardTone, string>>;
};

/** Props for one native overview card. */
export type OverviewCardProps = Omit<ViewProps, "children"> &
  Omit<OverviewBoardItem, "id"> & {
    /** Announces "heading: metric" when the metric changes. Off by default. */
    readonly announceChanges?: boolean;
    readonly labels?: OverviewBoardLabels;
    readonly ref?: Ref<View>;
  };

/** Props for a native overview board. */
export type OverviewBoardProps = Omit<ViewProps, "children"> & {
  /** Announces each card's metric when it changes. Off by default. */
  readonly announceChanges?: boolean;
  readonly emptyLabel?: string;
  readonly eyebrow?: ReactNode;
  readonly heading: ReactNode;
  readonly items: readonly OverviewBoardItem[];
  readonly labels?: OverviewBoardLabels;
  readonly ref?: Ref<View>;
  readonly subtitle?: ReactNode;
};

const styles = StyleSheet.create({
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

const defaultToneLabels: Readonly<Partial<Record<OverviewCardTone, string>>> = {
  danger: "Critical",
  warning: "Warning",
};

function metricSemantics(metric: ReactNode, toneLabel?: string) {
  const metricText = plainText(metric);
  return metricText === undefined
    ? { accessibilityHint: toneLabel }
    : {
        accessibilityLabel: joinAccessibilityText(
          [metricText, toneLabel],
          ", ",
        ),
      };
}

/**
 * Native summary card with an optional explicit action. The metric speaks the
 * card tone ("2, Critical") as well as the border colour; the icon slot
 * is decorative, and metrics are not live regions by default.
 */
function OverviewCard({
  announceChanges = false,
  ctaLabel,
  description,
  heading,
  icon,
  labels,
  metric,
  onCtaPress,
  ref,
  style,
  tone = "default",
  ...props
}: OverviewCardProps) {
  const theme = useTheme();
  const borderColor =
    tone === "danger"
      ? theme.colors.destructive
      : tone === "warning"
        ? theme.colors.secondaryForeground
        : theme.colors.border;
  useAnnounceOnChange(
    announceChanges
      ? joinAccessibilityText([plainText(heading), plainText(metric)], ": ")
      : undefined,
  );

  return (
    <Card
      {...props}
      ref={ref}
      style={[
        {
          borderColor,
          gap: theme.spacing[4],
          padding: theme.spacing[4],
        },
        style,
      ]}
    >
      <View style={[styles.cardHeader, { gap: theme.spacing[3] }]}>
        <View style={{ flex: 1, gap: theme.spacing[2] }}>
          <Text size="caption" tone="muted" weight="medium">
            {heading}
          </Text>
          <Text
            {...metricSemantics(
              metric,
              labels?.tone?.[tone] ?? defaultToneLabels[tone],
            )}
            style={theme.typography.scale.h3}
            weight="semibold"
          >
            {metric}
          </Text>
        </View>
        {icon ? <View {...decorativeProps}>{icon}</View> : null}
      </View>
      <Text size="small" tone="muted">
        {description}
      </Text>
      {ctaLabel && onCtaPress ? (
        <View style={{ alignItems: "flex-start" }}>
          <Button onPress={onCtaPress} size="sm" variant="ghost">
            {ctaLabel}
          </Button>
        </View>
      ) : null}
    </Card>
  );
}
OverviewCard.displayName = "OverviewCard";

/** Native overview section that stacks caller-keyed metric cards. */
function OverviewBoard({
  announceChanges = false,
  emptyLabel = "No overview data available.",
  eyebrow,
  heading,
  items,
  labels,
  ref,
  style,
  subtitle,
  ...props
}: OverviewBoardProps) {
  const theme = useTheme();

  return (
    <View {...props} ref={ref} style={[{ gap: theme.spacing[4] }, style]}>
      <View style={{ gap: theme.spacing[2] }}>
        {eyebrow ? (
          <Text size="caption" tone="muted" weight="medium">
            {eyebrow}
          </Text>
        ) : null}
        <Heading level={2} size={4}>
          {heading}
        </Heading>
        {subtitle ? (
          <Text size="small" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {items.length === 0 ? (
        <Text size="small" tone="muted">
          {emptyLabel}
        </Text>
      ) : (
        items.map((item) => (
          <OverviewCard
            announceChanges={announceChanges}
            ctaLabel={item.ctaLabel}
            description={item.description}
            heading={item.heading}
            icon={item.icon}
            key={item.id}
            labels={labels}
            metric={item.metric}
            onCtaPress={
              item.onCtaPress
                ? () => {
                    item.onCtaPress?.();
                  }
                : undefined
            }
            tone={item.tone}
          />
        ))
      )}
    </View>
  );
}
OverviewBoard.displayName = "OverviewBoard";

export { OverviewBoard, OverviewCard };
