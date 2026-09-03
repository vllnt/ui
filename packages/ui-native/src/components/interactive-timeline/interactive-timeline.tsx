"use client";

import { useCallback, useState } from "react";

import type { Ref } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";

import {
  isSingleSelected,
  toggleMultipleSelected,
} from "../../primitives/selection";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";

/** Caller-identified timeline lane. */
export type InteractiveTimelineTrack = {
  readonly id: string;
  readonly label: string;
};

/** Caller-identified filter category. */
export type InteractiveTimelineCategory = {
  readonly id: string;
  readonly label: string;
};

/** Point or duration rendered in a native timeline lane. */
export type InteractiveTimelineEvent = {
  readonly categoryId?: string;
  readonly description?: string;
  readonly endDate?: Date;
  readonly id: string;
  readonly startDate: Date;
  readonly title: string;
  readonly trackId: string;
};

/** Localized labels for native timeline controls. */
export type InteractiveTimelineLabels = {
  readonly region: string;
  readonly zoomIn: string;
  readonly zoomOut: string;
};

/** Props for the scrollable native interactive timeline. */
export type InteractiveTimelineProps = Omit<ViewProps, "children" | "ref"> & {
  readonly categories?: readonly InteractiveTimelineCategory[];
  readonly defaultSelectedId?: string;
  readonly defaultVisibleCategoryIds?: readonly string[];
  readonly defaultZoom?: number;
  readonly endDate: Date;
  readonly events: readonly InteractiveTimelineEvent[];
  readonly formatDate: (date: Date) => string;
  readonly labels: InteractiveTimelineLabels;
  readonly onEventPress?: (event: InteractiveTimelineEvent) => void;
  readonly onSelectedIdChange?: (id: string) => void;
  readonly onVisibleCategoryIdsChange?: (ids: readonly string[]) => void;
  readonly onZoomChange?: (zoom: number) => void;
  readonly ref?: Ref<View>;
  readonly selectedId?: string;
  readonly startDate: Date;
  readonly tracks: readonly InteractiveTimelineTrack[];
  readonly visibleCategoryIds?: readonly string[];
  readonly zoom?: number;
};

type TimelineLaneProps = {
  readonly end: number;
  readonly events: readonly InteractiveTimelineEvent[];
  readonly formatDate: (date: Date) => string;
  readonly onSelect: (event: InteractiveTimelineEvent) => void;
  readonly selectedId?: string;
  readonly start: number;
  readonly track: InteractiveTimelineTrack;
  readonly width: number;
};

const styles = StyleSheet.create({
  category: { alignItems: "center", justifyContent: "center", minHeight: 44 },
  categoryRow: { flexDirection: "row" },
  event: {
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
    position: "absolute",
  },
  lane: { borderTopWidth: 1, height: 64, position: "relative" },
  laneLabel: { left: 0, position: "absolute", top: 0, zIndex: 1 },
  root: { borderWidth: 1, overflow: "hidden" },
  toolbar: { alignItems: "center", flexDirection: "row" },
  zoom: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
});

function clampedZoom(value: number): number {
  return Math.min(8, Math.max(1, value));
}

function eventGeometry(
  event: InteractiveTimelineEvent,
  start: number,
  end: number,
) {
  const span = Math.max(1, end - start);
  const eventStart = Math.min(
    1,
    Math.max(0, (event.startDate.getTime() - start) / span),
  );
  const eventEnd = event.endDate
    ? Math.min(
        1,
        Math.max(eventStart, (event.endDate.getTime() - start) / span),
      )
    : eventStart;
  return {
    left: eventStart,
    width: event.endDate ? Math.max(0.02, eventEnd - eventStart) : 0,
  };
}

function TimelineLane({
  end,
  events,
  formatDate,
  onSelect,
  selectedId,
  start,
  track,
  width,
}: TimelineLaneProps) {
  const theme = useTheme();
  return (
    <View
      accessibilityLabel={track.label}
      style={[styles.lane, { borderTopColor: theme.colors.border, width }]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.laneLabel,
          theme.typography.scale.caption,
          {
            backgroundColor: theme.colors.background,
            color: theme.colors.mutedForeground,
            padding: theme.spacing[2],
          },
        ]}
      >
        {track.label}
      </Text>
      {events.map((event) => {
        const geometry = eventGeometry(event, start, end);
        const selected = isSingleSelected(
          selectedId,
          event,
          (candidate) => candidate.id,
        );
        return (
          <Pressable
            accessibilityLabel={`${event.title}, ${formatDate(event.startDate)}`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={event.id}
            onPress={() => {
              onSelect(event);
            }}
            style={({ pressed }) => [
              styles.event,
              {
                backgroundColor: selected
                  ? theme.colors.primary
                  : theme.colors.accent,
                borderColor: selected ? theme.colors.ring : theme.colors.border,
                borderRadius: theme.radius.sm,
                borderWidth: 1,
                left: geometry.left * width,
                opacity: pressed ? 0.8 : 1,
                paddingHorizontal: theme.spacing[2],
                top: theme.spacing[4],
                width:
                  geometry.width > 0
                    ? Math.max(44, geometry.width * width)
                    : 44,
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                theme.typography.scale.caption,
                {
                  color: selected
                    ? theme.colors.primaryForeground
                    : theme.colors.accentForeground,
                },
              ]}
            >
              {event.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
TimelineLane.displayName = "TimelineLane";

/**
 * Horizontally scrollable native timeline with filter, selection, and zoom
 * state. Pinch and browser-style pointer panning are intentionally not claimed.
 */
function InteractiveTimeline({
  categories = [],
  defaultSelectedId,
  defaultVisibleCategoryIds,
  defaultZoom = 1,
  endDate,
  events,
  formatDate,
  labels,
  onEventPress,
  onSelectedIdChange,
  onVisibleCategoryIdsChange,
  onZoomChange,
  ref,
  selectedId,
  startDate,
  style,
  tracks,
  visibleCategoryIds,
  zoom,
  ...props
}: InteractiveTimelineProps) {
  const theme = useTheme();
  const [layoutWidth, setLayoutWidth] = useState(1);
  const [selection, setSelection] = useControllableState(
    selectedId === undefined
      ? {
          defaultValue: defaultSelectedId ?? "",
          mode: "uncontrolled",
          onChange: onSelectedIdChange,
        }
      : { mode: "controlled", onChange: onSelectedIdChange, value: selectedId },
  );
  const defaultCategories =
    defaultVisibleCategoryIds ?? categories.map((category) => category.id);
  const [visible, setVisible] = useControllableState(
    visibleCategoryIds === undefined
      ? {
          defaultValue: defaultCategories,
          mode: "uncontrolled",
          onChange: onVisibleCategoryIdsChange,
        }
      : {
          mode: "controlled",
          onChange: onVisibleCategoryIdsChange,
          value: visibleCategoryIds,
        },
  );
  const [scale, setScale] = useControllableState(
    zoom === undefined
      ? {
          defaultValue: clampedZoom(defaultZoom),
          mode: "uncontrolled",
          onChange: onZoomChange,
        }
      : {
          mode: "controlled",
          onChange: onZoomChange,
          value: clampedZoom(zoom),
        },
  );
  const selectEvent = useCallback(
    (event: InteractiveTimelineEvent) => {
      setSelection(event.id);
      onEventPress?.(event);
    },
    [onEventPress, setSelection],
  );
  const contentWidth = layoutWidth * clampedZoom(scale);
  const visibleEvents = events.filter(
    (event) =>
      event.categoryId === undefined || visible.includes(event.categoryId),
  );

  return (
    <View
      {...props}
      accessibilityLabel={labels.region}
      onLayout={(event) => {
        setLayoutWidth(Math.max(1, event.nativeEvent.layout.width));
      }}
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.toolbar,
          { gap: theme.spacing[1], padding: theme.spacing[2] },
        ]}
      >
        <Pressable
          accessibilityLabel={labels.zoomOut}
          accessibilityRole="button"
          accessibilityState={{ disabled: scale <= 1 }}
          disabled={scale <= 1}
          onPress={() => {
            setScale(clampedZoom(scale / 2));
          }}
          style={styles.zoom}
        >
          <Text style={{ color: theme.colors.foreground }}>−</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={labels.zoomIn}
          accessibilityRole="button"
          accessibilityState={{ disabled: scale >= 8 }}
          disabled={scale >= 8}
          onPress={() => {
            setScale(clampedZoom(scale * 2));
          }}
          style={styles.zoom}
        >
          <Text style={{ color: theme.colors.foreground }}>+</Text>
        </Pressable>
        <ScrollView
          contentContainerStyle={[
            styles.categoryRow,
            { gap: theme.spacing[1] },
          ]}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {categories.map((category) => {
            const checked = visible.includes(category.id);
            return (
              <Pressable
                accessibilityLabel={category.label}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
                key={category.id}
                onPress={() => {
                  const next = toggleMultipleSelected(
                    new Set(visible),
                    category,
                    (candidate) => candidate.id,
                  );
                  setVisible([...next]);
                }}
                style={[
                  styles.category,
                  {
                    backgroundColor: checked
                      ? theme.colors.secondary
                      : theme.colors.background,
                    borderColor: theme.colors.border,
                    borderRadius: theme.radius.full,
                    borderWidth: 1,
                    paddingHorizontal: theme.spacing[3],
                  },
                ]}
              >
                <Text
                  style={[
                    theme.typography.scale.caption,
                    { color: theme.colors.foreground },
                  ]}
                >
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={{ width: contentWidth }}>
          {tracks.map((track) => (
            <TimelineLane
              end={endDate.getTime()}
              events={visibleEvents.filter(
                (event) => event.trackId === track.id,
              )}
              formatDate={formatDate}
              key={track.id}
              onSelect={selectEvent}
              selectedId={selection}
              start={startDate.getTime()}
              track={track}
              width={contentWidth}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
InteractiveTimeline.displayName = "InteractiveTimeline";

export { InteractiveTimeline };
