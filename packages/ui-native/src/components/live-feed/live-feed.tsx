import { type Ref, useEffect, useMemo, useState } from "react";

import { ScrollView, StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Badge } from "../badge/badge";
import { Card } from "../card/card";
import {
  SeverityBadge,
  type SeverityBadgeLevel,
} from "../severity-badge/severity-badge";
import { Text } from "../text/text";

/** Date-like input accepted by native feed events. */
export type LiveFeedDateValue = Date | number | string;

/** One caller-keyed native feed event. */
export type LiveFeedEvent = {
  readonly id: string;
  readonly message?: string;
  readonly severity: SeverityBadgeLevel;
  readonly source?: string;
  readonly timestamp: LiveFeedDateValue;
  readonly title: string;
};

/** Props for a native rolling event feed. */
export type LiveFeedProps = Omit<ViewProps, "children"> & {
  readonly description?: string;
  readonly emptyLabel?: string;
  readonly events: readonly LiveFeedEvent[];
  readonly liveLabel?: string;
  readonly maxItems?: number;
  readonly now?: LiveFeedDateValue;
  readonly ref?: Ref<View>;
  readonly tickMs?: number;
  readonly title?: string;
};

const styles = StyleSheet.create({
  item: { borderTopWidth: 1 },
  itemTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

function normalizeDate(value: LiveFeedDateValue): Date {
  return value instanceof Date ? new Date(value.getTime()) : new Date(value);
}

function relativeTime(eventDate: Date, now: Date): string {
  const seconds = Math.max(
    0,
    Math.floor((now.getTime() - eventDate.getTime()) / 1000),
  );
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function useCurrentDate(now: LiveFeedDateValue | undefined, tickMs: number) {
  const [timestamp, setTimestamp] = useState(() => Date.now());
  useEffect(() => {
    if (now !== undefined) return;
    const interval = setInterval(
      () => {
        setTimestamp(Date.now());
      },
      Math.max(1000, tickMs),
    );
    return () => {
      clearInterval(interval);
    };
  }, [now, tickMs]);
  return now === undefined ? new Date(timestamp) : normalizeDate(now);
}

function LiveFeedHeader({
  description,
  liveLabel,
  title,
}: {
  readonly description?: string;
  readonly liveLabel: string;
  readonly title: string;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.titleRow, { gap: theme.spacing[3] }]}>
      <View style={{ flex: 1, gap: theme.spacing[1] }}>
        <Text weight="semibold">{title}</Text>
        {description ? (
          <Text size="small" tone="muted">
            {description}
          </Text>
        ) : null}
      </View>
      <Badge variant="outline">{liveLabel}</Badge>
    </View>
  );
}
LiveFeedHeader.displayName = "LiveFeedHeader";

function LiveFeedRow({
  event,
  now,
}: {
  readonly event: LiveFeedEvent;
  readonly now: Date;
}) {
  const theme = useTheme();
  const eventDate = normalizeDate(event.timestamp);
  const relative = relativeTime(eventDate, now);
  return (
    <View
      accessibilityLabel={`${event.severity}: ${event.title}, ${relative}`}
      accessibilityRole="text"
      style={[
        styles.item,
        {
          borderTopColor: theme.colors.border,
          gap: theme.spacing[1],
          paddingVertical: theme.spacing[3],
        },
      ]}
    >
      <View style={[styles.itemTop, { gap: theme.spacing[2] }]}>
        <Text style={{ flex: 1 }} weight="medium">
          {event.title}
        </Text>
        <Text size="caption" tone="muted">
          {relative}
        </Text>
      </View>
      <SeverityBadge level={event.severity} tone="soft" />
      {event.message ? (
        <Text size="small" tone="muted">
          {event.message}
        </Text>
      ) : null}
      {event.source ? (
        <Text size="caption" tone="muted" weight="medium">
          {event.source}
        </Text>
      ) : null}
    </View>
  );
}
LiveFeedRow.displayName = "LiveFeedRow";

/** Native rolling feed sorted from newest to oldest. */
function LiveFeed({
  description,
  emptyLabel = "No events yet",
  events,
  liveLabel = "Live",
  maxItems = 50,
  now,
  ref,
  style,
  tickMs = 30_000,
  title = "Live feed",
  ...props
}: LiveFeedProps) {
  const theme = useTheme();
  const liveNow = useCurrentDate(now, tickMs);
  const visibleEvents = useMemo(
    () =>
      [...events]
        .sort(
          (first, second) =>
            normalizeDate(second.timestamp).getTime() -
            normalizeDate(first.timestamp).getTime(),
        )
        .slice(0, Math.max(0, maxItems)),
    [events, maxItems],
  );

  return (
    <Card
      {...props}
      accessibilityLiveRegion="polite"
      ref={ref}
      style={[{ gap: theme.spacing[3], padding: theme.spacing[4] }, style]}
    >
      <LiveFeedHeader
        description={description}
        liveLabel={liveLabel}
        title={title}
      />
      {visibleEvents.length === 0 ? (
        <Text size="small" tone="muted">
          {emptyLabel}
        </Text>
      ) : (
        <ScrollView accessibilityLabel={title} accessibilityRole="list">
          {visibleEvents.map((event) => (
            <LiveFeedRow event={event} key={event.id} now={liveNow} />
          ))}
        </ScrollView>
      )}
    </Card>
  );
}
LiveFeed.displayName = "LiveFeed";

export { LiveFeed };
