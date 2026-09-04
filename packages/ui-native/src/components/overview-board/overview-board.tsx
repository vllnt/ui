import type { ReactNode, Ref } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Button } from "../button/button";
import { Card } from "../card/card";
import { Heading } from "../heading/heading";
import { Text } from "../text/text";

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

/** Props for one native overview card. */
export type OverviewCardProps = Omit<ViewProps, "children"> &
  Omit<OverviewBoardItem, "id"> & {
    readonly ref?: Ref<View>;
  };

/** Props for a native overview board. */
export type OverviewBoardProps = Omit<ViewProps, "children"> & {
  readonly emptyLabel?: string;
  readonly eyebrow?: ReactNode;
  readonly heading: ReactNode;
  readonly items: readonly OverviewBoardItem[];
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

/** Native summary card with an optional explicit action. */
function OverviewCard({
  ctaLabel,
  description,
  heading,
  icon,
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
            accessibilityLiveRegion="polite"
            style={theme.typography.scale.h3}
            weight="semibold"
          >
            {metric}
          </Text>
        </View>
        {icon ? <View>{icon}</View> : null}
      </View>
      <Text size="small" tone="muted">
        {description}
      </Text>
      {ctaLabel ? (
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
  emptyLabel = "No overview data available.",
  eyebrow,
  heading,
  items,
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
            ctaLabel={item.ctaLabel}
            description={item.description}
            heading={item.heading}
            icon={item.icon}
            key={item.id}
            metric={item.metric}
            onCtaPress={() => {
              item.onCtaPress?.();
            }}
            tone={item.tone}
          />
        ))
      )}
    </View>
  );
}
OverviewBoard.displayName = "OverviewBoard";

export { OverviewBoard, OverviewCard };
