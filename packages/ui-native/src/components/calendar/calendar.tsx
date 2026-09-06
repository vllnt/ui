"use client";

import { type Ref, useMemo, useState } from "react";

import {
  Pressable,
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import type { ControllableStateOptions } from "../../primitives/use-controllable-state";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";

/** Localized display and accessibility labels for Calendar. */
export type CalendarLabels = {
  readonly formatDayAccessibilityLabel: (date: Date) => string;
  readonly formatMonth: (date: Date) => string;
  readonly formatWeekday: (weekday: number) => string;
  readonly nextMonth: string;
  readonly previousMonth: string;
};

/** Props for a one-month native Gregorian calendar. */
export type CalendarProps = Omit<ViewProps, "children"> & {
  readonly disabled?: boolean;
  readonly isDateDisabled?: (date: Date) => boolean;
  readonly isDateSelected?: (date: Date) => boolean;
  readonly labels: CalendarLabels;
  readonly month?: Date;
  readonly onMonthChange?: (month: Date) => void;
  readonly ref?: Ref<View>;
  readonly selection: ControllableStateOptions<Date | undefined>;
};

const styles = StyleSheet.create({
  day: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    width: "14.2857%",
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  monthAction: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  weekday: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    width: "14.2857%",
  },
});

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function sameDay(left?: Date, right?: Date): boolean {
  return (
    left !== undefined &&
    left.getFullYear() === right?.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}
function buildMonthDays(month: Date): readonly (Date | undefined)[] {
  const first = startOfMonth(month);
  const prefix = Array.from<undefined>({ length: first.getDay() });
  const dayCount = new Date(
    first.getFullYear(),
    first.getMonth() + 1,
    0,
  ).getDate();
  return [
    ...prefix,
    ...Array.from(
      { length: dayCount },
      (_unused, index) =>
        new Date(first.getFullYear(), first.getMonth(), index + 1),
    ),
  ];
}

/** Token-driven native calendar with caller-localized labels and Date values. */
function Calendar({
  disabled = false,
  isDateDisabled,
  isDateSelected,
  labels,
  month,
  onMonthChange,
  ref,
  selection,
  style,
  ...props
}: CalendarProps) {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useControllableState(selection);
  const [internalMonth, setInternalMonth] = useState(() =>
    startOfMonth(month ?? selectedDate ?? new Date()),
  );
  const visibleMonth = startOfMonth(month ?? internalMonth);
  const visibleYear = visibleMonth.getFullYear();
  const visibleMonthIndex = visibleMonth.getMonth();
  const days = useMemo(
    () => buildMonthDays(new Date(visibleYear, visibleMonthIndex, 1)),
    [visibleMonthIndex, visibleYear],
  );
  const changeMonth = (offset: number) => {
    const next = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + offset,
      1,
    );
    if (month === undefined) setInternalMonth(next);
    onMonthChange?.(next);
  };
  return (
    <View
      accessibilityLabel={labels.formatMonth(visibleMonth)}
      ref={ref}
      style={[
        { backgroundColor: theme.colors.background, gap: theme.spacing[1] },
        style,
      ]}
      {...props}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityLabel={labels.previousMonth}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={() => {
            changeMonth(-1);
          }}
          style={styles.monthAction}
        >
          <NativeText style={{ color: theme.colors.foreground }}>‹</NativeText>
        </Pressable>
        <NativeText
          accessibilityRole="header"
          style={[
            theme.typography.scale.bodySmall,
            {
              color: theme.colors.foreground,
              fontWeight: theme.typography.fontWeight.heading,
            },
          ]}
        >
          {labels.formatMonth(visibleMonth)}
        </NativeText>
        <Pressable
          accessibilityLabel={labels.nextMonth}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={() => {
            changeMonth(1);
          }}
          style={styles.monthAction}
        >
          <NativeText style={{ color: theme.colors.foreground }}>›</NativeText>
        </Pressable>
      </View>
      <View style={styles.grid}>
        {Array.from({ length: 7 }, (_unused, weekday) => (
          <View key={weekday} style={styles.weekday}>
            <NativeText
              style={[
                theme.typography.scale.caption,
                { color: theme.colors.mutedForeground },
              ]}
            >
              {labels.formatWeekday(weekday)}
            </NativeText>
          </View>
        ))}
        {days.map((date, index) => {
          if (!date) return <View key={`empty-${index}`} style={styles.day} />;
          const dateDisabled = disabled || isDateDisabled?.(date) === true;
          const dateSelected =
            isDateSelected?.(date) ?? sameDay(date, selectedDate);
          return (
            <Pressable
              accessibilityLabel={labels.formatDayAccessibilityLabel(date)}
              accessibilityRole="button"
              accessibilityState={{
                disabled: dateDisabled,
                selected: dateSelected,
              }}
              disabled={dateDisabled}
              key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
              onPress={() => {
                setSelectedDate(date);
              }}
              style={[
                styles.day,
                {
                  backgroundColor: dateSelected
                    ? theme.colors.primary
                    : theme.colors.background,
                  borderRadius: theme.radius.full,
                  opacity: dateDisabled ? 0.5 : 1,
                },
              ]}
            >
              <NativeText
                style={[
                  theme.typography.scale.bodySmall,
                  {
                    color: dateSelected
                      ? theme.colors.primaryForeground
                      : theme.colors.foreground,
                  },
                ]}
              >
                {date.getDate()}
              </NativeText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
