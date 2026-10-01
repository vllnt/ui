"use client";

import { type Ref, useEffect, useMemo, useRef, useState } from "react";

import { ScrollView, StyleSheet, View, type ViewProps } from "react-native";

import {
  announce,
  decorativeProps,
  joinAccessibilityText,
} from "../../../primitives/accessibility";
import { useTheme } from "../../../theme/theme-provider";
import { Badge } from "../../atoms/badge/badge";
import { Card } from "../../atoms/card/card";
import {
  SeverityBadge,
  type SeverityBadgeLevel,
} from "../../atoms/severity-badge/severity-badge";
import { Text } from "../../atoms/text/text";

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

function sortableTime(value: LiveFeedDateValue): number {
  const time = normalizeDate(value).getTime();
  return Number.isFinite(time) ? time : -8_640_000_000_000_001;
}

function relativeTime(eventDate: Date, now: Date): string {
  if (!Number.isFinite(eventDate.getTime()) || !Number.isFinite(now.getTime()))
    return "";
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
      Number.isFinite(tickMs)
        ? Math.min(2_147_483_647, Math.max(1000, tickMs))
        : 30_000,
    );
    return () => {
      clearInterval(interval);
    };
  }, [now, tickMs]);
  return now === undefined ? new Date(timestamp) : normalizeDate(now);
}

function eventSummary(event: LiveFeedEvent) {
  return `${event.severity}: ${event.title}`;
}

/**
 * Announces the newest event once when it changes, at most once per
 * `intervalMs`; a burst of events collapses into one trailing announcement of
 * the newest. Clock ticks never re-announce.
 */
function useNewestEventAnnouncement(newest?: LiveFeedEvent, intervalMs = 2000) {
  const announcedId = useRef(newest?.id);
  const lastAnnouncedAt = useRef(0);
  const id = newest?.id;
  const message = newest ? eventSummary(newest) : undefined;
  useEffect(() => {
    if (message === undefined || id === announcedId.current) return;
    const delay = Math.max(
      0,
      lastAnnouncedAt.current + intervalMs - Date.now(),
    );
    const timer = setTimeout(() => {
      announcedId.current = id;
      lastAnnouncedAt.current = Date.now();
      announce(message);
    }, delay);
    return () => {
      clearTimeout(timer);
    };
  }, [id, intervalMs, message]);
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
        <Text accessibilityRole="header" weight="semibold">
          {title}
        </Text>
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
      accessibilityHint={joinAccessibilityText([event.message, event.source])}
      accessibilityLabel={joinAccessibilityText(
        [eventSummary(event), relative],
        ", ",
      )}
      accessible
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
        {relative ? (
          <Text size="caption" tone="muted">
            {relative}
          </Text>
        ) : null}
      </View>
      <SeverityBadge {...decorativeProps} level={event.severity} tone="soft" />
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

/**
 * Native rolling feed sorted from newest to oldest. Each row is one
 * screen-reader stop; the feed announces a newly arrived newest event once on
 * both platforms (bursts collapse to the newest) and clock ticks stay silent.
 */
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
            sortableTime(second.timestamp) - sortableTime(first.timestamp),
        )
        .slice(0, Math.max(0, maxItems)),
    [events, maxItems],
  );
  useNewestEventAnnouncement(visibleEvents[0]);

  return (
    <Card
      {...props}
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
        <ScrollView accessibilityRole="list">
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
