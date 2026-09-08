"use client";

import { type Ref, useEffect, useMemo, useState } from "react";

import { StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Badge, type BadgeProps } from "../badge/badge";
import { Card } from "../card/card";
import { ProgressBar } from "../progress-bar/progress-bar";
import { Text } from "../text/text";

/** Date-like input accepted by native time components. */
export type CountdownTimerDateValue = Date | number | string;

/** Optional localized countdown timer text. */
export type CountdownTimerLabels = {
  readonly atRisk?: string;
  readonly breached?: string;
  readonly days?: string;
  readonly deadline?: string;
  readonly hours?: string;
  readonly invalidDate?: string;
  readonly minutes?: string;
  readonly onTrack?: string;
  readonly seconds?: string;
  readonly timeRemaining?: string;
};

/** Props for a deterministic or live native countdown timer. */
export type CountdownTimerProps = Omit<ViewProps, "children"> & {
  readonly deadline: CountdownTimerDateValue;
  readonly description?: string;
  readonly labels?: CountdownTimerLabels;
  readonly now?: CountdownTimerDateValue;
  readonly ref?: Ref<View>;
  readonly startedAt?: CountdownTimerDateValue;
  readonly tickMs?: number;
  readonly title?: string;
  readonly warningThresholdMs?: number;
};

type TimerSegment = {
  readonly id: "days" | "hours" | "minutes" | "seconds";
  readonly label: string;
  readonly value: string;
};

type TimerStatus = {
  readonly label: string;
  readonly variant: NonNullable<BadgeProps["variant"]>;
};

const styles = StyleSheet.create({
  segment: { alignItems: "center", borderWidth: 1, flexGrow: 1 },
  segments: { flexDirection: "row", flexWrap: "wrap" },
  top: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  value: { fontVariant: ["tabular-nums"] },
});

function normalizeDate(value: CountdownTimerDateValue): Date {
  return value instanceof Date ? new Date(value.getTime()) : new Date(value);
}

function isValidDate(date: Date): boolean {
  return Number.isFinite(date.getTime());
}

function useCurrentDate(
  now: CountdownTimerDateValue | undefined,
  tickMs: number,
  ticking: boolean,
): Date {
  const [timestamp, setTimestamp] = useState(() => Date.now());
  useEffect(() => {
    if (now !== undefined || !ticking) return;
    const safeTickMs =
      Number.isFinite(tickMs) && tickMs >= 100
        ? Math.min(2_147_483_647, tickMs)
        : 1000;
    const interval = setInterval(() => {
      setTimestamp(Date.now());
    }, safeTickMs);
    return () => {
      clearInterval(interval);
    };
  }, [now, tickMs, ticking]);
  return now === undefined ? new Date(timestamp) : normalizeDate(now);
}

function getTimerStatus(
  remainingMs: number,
  warningThresholdMs: number,
  labels?: CountdownTimerLabels,
): TimerStatus {
  if (remainingMs <= 0) {
    return { label: labels?.breached ?? "Breached", variant: "destructive" };
  }
  if (remainingMs <= warningThresholdMs) {
    return { label: labels?.atRisk ?? "At risk", variant: "secondary" };
  }
  return { label: labels?.onTrack ?? "On track", variant: "default" };
}

function getSegments(
  remainingMs: number,
  labels?: CountdownTimerLabels,
): readonly TimerSegment[] {
  const totalSeconds = Math.floor(Math.max(0, remainingMs) / 1000);
  return [
    {
      id: "days",
      label: labels?.days ?? "Days",
      value: String(Math.floor(totalSeconds / 86_400)).padStart(2, "0"),
    },
    {
      id: "hours",
      label: labels?.hours ?? "Hours",
      value: String(Math.floor((totalSeconds % 86_400) / 3600)).padStart(
        2,
        "0",
      ),
    },
    {
      id: "minutes",
      label: labels?.minutes ?? "Minutes",
      value: String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0"),
    },
    {
      id: "seconds",
      label: labels?.seconds ?? "Seconds",
      value: String(totalSeconds % 60).padStart(2, "0"),
    },
  ];
}

function TimerHeader({
  accessibilityLabel,
  accessibilityRole,
  description,
  status,
  title,
}: {
  readonly accessibilityLabel: string;
  readonly accessibilityRole: "alert" | "timer";
  readonly description: string;
  readonly status: TimerStatus;
  readonly title: string;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.top, { gap: theme.spacing[3] }]}>
      <View style={{ flex: 1, gap: theme.spacing[1] }}>
        <Text
          accessibilityLabel={accessibilityLabel}
          accessibilityLiveRegion="polite"
          accessibilityRole={accessibilityRole}
          weight="semibold"
        >
          {title}
        </Text>
        <Text size="small" tone="muted">
          {description}
        </Text>
      </View>
      <Badge variant={status.variant}>{status.label}</Badge>
    </View>
  );
}
TimerHeader.displayName = "TimerHeader";

function TimerSegments({
  segments,
}: {
  readonly segments: readonly TimerSegment[];
}) {
  const theme = useTheme();
  return (
    <View style={[styles.segments, { gap: theme.spacing[2] }]}>
      {segments.map((segment) => (
        <View
          key={segment.id}
          style={[
            styles.segment,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              minWidth: 72,
              padding: theme.spacing[3],
            },
          ]}
        >
          <Text
            style={[theme.typography.scale.h5, styles.value]}
            weight="semibold"
          >
            {segment.value}
          </Text>
          <Text size="caption" tone="muted">
            {segment.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
TimerSegments.displayName = "TimerSegments";

function getProgress({
  deadline,
  now,
  remainingMs,
  startedAt,
}: {
  readonly deadline: Date;
  readonly now: Date;
  readonly remainingMs: number;
  readonly startedAt?: Date;
}): { readonly max: number; readonly value: number } {
  if (!startedAt) return { max: 1, value: remainingMs <= 0 ? 1 : 0 };
  const max = Math.max(0, deadline.getTime() - startedAt.getTime());
  const value = Math.min(max, Math.max(0, now.getTime() - startedAt.getTime()));
  return { max, value };
}

function getTimerPresentation({
  deadline,
  description,
  labels,
  now,
  startedAt,
  warningThresholdMs,
}: {
  readonly deadline: Date;
  readonly description?: string;
  readonly labels?: CountdownTimerLabels;
  readonly now: Date;
  readonly startedAt?: Date;
  readonly warningThresholdMs: number;
}) {
  const validDeadline = isValidDate(deadline) && isValidDate(now);
  const remainingMs = validDeadline ? deadline.getTime() - now.getTime() : 0;
  const safeWarningThreshold =
    Number.isFinite(warningThresholdMs) && warningThresholdMs >= 0
      ? warningThresholdMs
      : 15 * 60 * 1000;
  const status = validDeadline
    ? getTimerStatus(remainingMs, safeWarningThreshold, labels)
    : {
        label: labels?.invalidDate ?? "Invalid date",
        variant: "destructive" as const,
      };
  const validStart =
    validDeadline && startedAt && isValidDate(startedAt)
      ? startedAt
      : undefined;
  const segments = getSegments(remainingMs, labels);
  return {
    description:
      description ??
      (validDeadline
        ? `${labels?.deadline ?? "Deadline"} ${deadline.toLocaleString()}`
        : (labels?.invalidDate ?? "Invalid date")),
    durationLabel: segments
      .map((segment) => `${segment.value} ${segment.label}`)
      .join(", "),
    progress: getProgress({
      deadline,
      now,
      remainingMs,
      startedAt: validStart,
    }),
    remainingMs,
    segments,
    showProgressLabels: validStart !== undefined,
    status,
    validDeadline,
  };
}

/** Native countdown card with fixed-time injection for deterministic rendering. */
function CountdownTimer({
  deadline,
  description,
  labels,
  now,
  ref,
  startedAt,
  style,
  tickMs = 1000,
  title = "Countdown timer",
  warningThresholdMs = 15 * 60 * 1000,
  ...props
}: CountdownTimerProps) {
  const theme = useTheme();
  const deadlineDate = useMemo(() => normalizeDate(deadline), [deadline]);
  const startedAtDate = useMemo(
    () => (startedAt === undefined ? undefined : normalizeDate(startedAt)),
    [startedAt],
  );
  const liveNow = useCurrentDate(now, tickMs, isValidDate(deadlineDate));
  const timer = getTimerPresentation({
    deadline: deadlineDate,
    description,
    labels,
    now: liveNow,
    startedAt: startedAtDate,
    warningThresholdMs,
  });

  return (
    <Card
      {...props}
      ref={ref}
      style={[{ gap: theme.spacing[4], padding: theme.spacing[4] }, style]}
    >
      <TimerHeader
        accessibilityLabel={`${title}: ${timer.status.label}, ${timer.durationLabel}`}
        accessibilityRole={timer.validDeadline ? "timer" : "alert"}
        description={timer.description}
        status={timer.status}
        title={title}
      />
      <TimerSegments segments={timer.segments} />
      <ProgressBar
        completedLabel=""
        currentLabel={labels?.timeRemaining ?? "Time remaining"}
        isComplete={timer.remainingMs <= 0}
        max={timer.progress.max}
        showLabels={timer.showProgressLabels}
        value={timer.progress.value}
      />
    </Card>
  );
}
CountdownTimer.displayName = "CountdownTimer";

export { CountdownTimer };
