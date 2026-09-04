import { type Ref, useEffect, useMemo, useState } from "react";

import { ScrollView, StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Badge } from "../badge/badge";
import { Heading } from "../heading/heading";
import { Text } from "../text/text";

/** Date-like input accepted by the native world clock. */
export type WorldClockDateValue = Date | number | string;

/** One caller-keyed IANA time zone. */
export type WorldClockBarZone = {
  readonly city: string;
  readonly id: string;
  readonly locale?: string;
  readonly timeZone: string;
};

/** Props for a native horizontally scrollable world clock. */
export type WorldClockBarProps = Omit<ViewProps, "children"> & {
  readonly description?: string;
  readonly emptyLabel?: string;
  readonly now?: WorldClockDateValue;
  readonly ref?: Ref<View>;
  readonly showDate?: boolean;
  readonly title?: string;
  readonly updateIntervalMs?: number;
  readonly zones: readonly WorldClockBarZone[];
};

type FormattedZone = {
  readonly date?: string;
  readonly time: string;
  readonly zone: WorldClockBarZone;
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, minWidth: 190 },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  time: { fontVariant: ["tabular-nums"] },
});

function normalizeDate(value: WorldClockDateValue): Date {
  return value instanceof Date ? new Date(value.getTime()) : new Date(value);
}

function useCurrentDate(now: undefined | WorldClockDateValue, tickMs: number) {
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

function formatZone(
  zone: WorldClockBarZone,
  date: Date,
  showDate: boolean,
): FormattedZone {
  const locale = zone.locale ?? "en-US";
  const formattedDate = showDate
    ? new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        timeZone: zone.timeZone,
        weekday: "short",
      }).format(date)
    : undefined;
  const time = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: zone.timeZone,
    timeZoneName: "short",
  }).format(date);
  return { date: formattedDate, time, zone };
}

function WorldClockHeader({
  description,
  title,
  zoneCount,
}: {
  readonly description: string;
  readonly title: string;
  readonly zoneCount: number;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.header, { gap: theme.spacing[3] }]}>
      <View style={{ flex: 1, gap: theme.spacing[1] }}>
        <Heading level={2} size={5}>
          {title}
        </Heading>
        <Text size="small" tone="muted">
          {description}
        </Text>
      </View>
      <Badge variant="outline">
        {zoneCount} {zoneCount === 1 ? "zone" : "zones"}
      </Badge>
    </View>
  );
}
WorldClockHeader.displayName = "WorldClockHeader";

function WorldClockCard({ item }: { readonly item: FormattedZone }) {
  const theme = useTheme();
  return (
    <View
      accessibilityLabel={`${item.zone.city}, ${item.time}${item.date ? `, ${item.date}` : ""}, ${item.zone.timeZone}`}
      accessibilityRole="timer"
      accessible
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          gap: theme.spacing[1],
          padding: theme.spacing[4],
        },
      ]}
    >
      <Text size="small" weight="medium">
        {item.zone.city}
      </Text>
      <Text style={[theme.typography.scale.h5, styles.time]} weight="semibold">
        {item.time}
      </Text>
      {item.date ? (
        <Text size="caption" tone="muted">
          {item.date}
        </Text>
      ) : null}
      <Text size="caption" tone="muted" weight="medium">
        {item.zone.timeZone}
      </Text>
    </View>
  );
}
WorldClockCard.displayName = "WorldClockCard";

function WorldClockList({
  emptyLabel,
  items,
  title,
}: {
  readonly emptyLabel: string;
  readonly items: readonly FormattedZone[];
  readonly title: string;
}) {
  const theme = useTheme();
  if (items.length === 0) {
    return (
      <Text size="small" tone="muted">
        {emptyLabel}
      </Text>
    );
  }
  return (
    <ScrollView
      accessibilityLabel={title}
      accessibilityRole="list"
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      <View style={{ flexDirection: "row", gap: theme.spacing[3] }}>
        {items.map((item) => (
          <WorldClockCard item={item} key={item.zone.id} />
        ))}
      </View>
    </ScrollView>
  );
}
WorldClockList.displayName = "WorldClockList";

/** Native multi-timezone display using caller-stable zone ids. */
function WorldClockBar({
  description = "Synchronized time across distributed teams and regions.",
  emptyLabel = "No time zones configured.",
  now,
  ref,
  showDate = true,
  style,
  title = "World clock",
  updateIntervalMs = 60_000,
  zones,
  ...props
}: WorldClockBarProps) {
  const theme = useTheme();
  const liveNow = useCurrentDate(now, updateIntervalMs);
  const formattedZones = useMemo(
    () => zones.map((zone) => formatZone(zone, liveNow, showDate)),
    [liveNow, showDate, zones],
  );

  return (
    <View {...props} ref={ref} style={[{ gap: theme.spacing[3] }, style]}>
      <WorldClockHeader
        description={description}
        title={title}
        zoneCount={zones.length}
      />
      <WorldClockList
        emptyLabel={emptyLabel}
        items={formattedZones}
        title={title}
      />
    </View>
  );
}
WorldClockBar.displayName = "WorldClockBar";

export { WorldClockBar };
