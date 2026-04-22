"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { Badge } from "../badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card";

export type CountdownTimerProps = React.ComponentPropsWithoutRef<"div"> & {
  deadline: Date | number | string;
  description?: string;
  now?: Date | number | string;
  startedAt?: Date | number | string;
  tickMs?: number;
  title?: string;
  warningThresholdMs?: number;
};

type TimerSegment = {
  label: string;
  value: string;
};

function normalizeDate(input: Date | number | string): Date {
  if (input instanceof Date) {
    return new Date(input.getTime());
  }

  return new Date(input);
}

function useLiveDate(now: CountdownTimerProps["now"], tickMs: number) {
  const fixedNow = React.useMemo(
    () => (now ? normalizeDate(now) : undefined),
    [now],
  );
  const [liveNow, setLiveNow] = React.useState<Date>(fixedNow ?? new Date());

  React.useEffect(() => {
    if (fixedNow) {
      setLiveNow(fixedNow);
      return;
    }

    const interval = window.setInterval(() => {
      setLiveNow(new Date());
    }, tickMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [fixedNow, tickMs]);

  return liveNow;
}

function getRemainingMs(deadline: Date, now: Date): number {
  return deadline.getTime() - now.getTime();
}

function getStatus(
  remainingMs: number,
  warningThresholdMs: number,
): {
  badgeVariant: "default" | "destructive" | "secondary";
  label: string;
  toneClassName: string;
} {
  if (remainingMs <= 0) {
    return {
      badgeVariant: "destructive",
      label: "Breached",
      toneClassName: "bg-destructive",
    };
  }

  if (remainingMs <= warningThresholdMs) {
    return {
      badgeVariant: "secondary",
      label: "At risk",
      toneClassName: "bg-amber-500",
    };
  }

  return {
    badgeVariant: "default",
    label: "On track",
    toneClassName: "bg-emerald-500",
  };
}

function formatSegments(milliseconds: number): TimerSegment[] {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    { label: "Days", value: String(days).padStart(2, "0") },
    { label: "Hours", value: String(hours).padStart(2, "0") },
    { label: "Minutes", value: String(minutes).padStart(2, "0") },
    { label: "Seconds", value: String(seconds).padStart(2, "0") },
  ];
}

function formatDeadline(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    timeZoneName: "short",
  }).format(date);
}

function getProgress(deadline: Date, now: Date, startedAt?: Date): number {
  if (!startedAt) {
    return 0;
  }

  const total = deadline.getTime() - startedAt.getTime();

  if (total <= 0) {
    return 100;
  }

  const elapsed = now.getTime() - startedAt.getTime();

  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

function TimerSegments({ segments }: { segments: TimerSegment[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {segments.map((segment) => (
        <div
          className="rounded-lg border bg-background/80 px-3 py-4 text-center"
          key={segment.label}
        >
          <div className="text-2xl font-semibold tracking-tight">
            {segment.value}
          </div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {segment.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function TimerProgress({
  progress,
  remainingMs,
  segments,
  startedAt,
  toneClassName,
}: {
  progress: number;
  remainingMs: number;
  segments: TimerSegment[];
  startedAt?: Date;
  toneClassName: string;
}) {
  const progressWidth = startedAt ? progress : remainingMs <= 0 ? 100 : 0;
  const statusText = startedAt
    ? `${Math.round(progress)}% used`
    : segments.map((segment) => segment.value).join(":");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{startedAt ? "SLA elapsed" : "Time remaining"}</span>
        <span>{statusText}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full transition-all", toneClassName)}
          style={{ width: `${progressWidth}%` }}
        />
      </div>
    </div>
  );
}

export const CountdownTimer = React.forwardRef<
  HTMLDivElement,
  CountdownTimerProps
>(
  (
    {
      className,
      deadline,
      description,
      now,
      startedAt,
      tickMs = 1000,
      title = "Countdown timer",
      warningThresholdMs = 15 * 60 * 1000,
      ...props
    },
    ref,
  ) => {
    const deadlineDate = React.useMemo(
      () => normalizeDate(deadline),
      [deadline],
    );
    const startedAtDate = React.useMemo(
      () => (startedAt ? normalizeDate(startedAt) : undefined),
      [startedAt],
    );
    const liveNow = useLiveDate(now, tickMs);
    const remainingMs = getRemainingMs(deadlineDate, liveNow);
    const status = getStatus(remainingMs, warningThresholdMs);
    const segments = formatSegments(Math.abs(remainingMs));
    const progress = getProgress(deadlineDate, liveNow, startedAtDate);

    return (
      <Card className={cn("shadow-sm", className)} ref={ref} {...props}>
        <CardHeader className="space-y-2 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>
                {description ?? `Deadline ${formatDeadline(deadlineDate)}`}
              </CardDescription>
            </div>
            <Badge variant={status.badgeVariant}>{status.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <TimerSegments segments={segments} />
          <TimerProgress
            progress={progress}
            remainingMs={remainingMs}
            segments={segments}
            startedAt={startedAtDate}
            toneClassName={status.toneClassName}
          />
        </CardContent>
      </Card>
    );
  },
);

CountdownTimer.displayName = "CountdownTimer";
