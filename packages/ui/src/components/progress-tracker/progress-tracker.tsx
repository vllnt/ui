"use client";

import * as React from "react";

import type { ReactNode } from "react";

import { cn } from "../../lib/utils";
import { Badge } from "../badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card";
import { CHECKLIST_PROGRESS_EVENT, type ChecklistItem } from "../checklist";
import { ProgressBar } from "../progress-bar";

export type ProgressTrackerModuleStatus =
  | "available"
  | "completed"
  | "in-progress"
  | "locked";

export type ProgressTrackerModuleItem = {
  badge?: string;
  checklistItems?: ChecklistItem[];
  completedExercises?: number;
  completedLessons?: number;
  currentLesson?: string;
  description?: string;
  exercises?: number;
  href?: string;
  id?: string;
  lessons: number;
  persistKey?: string;
  progress: number;
  skills?: string[];
  status: ProgressTrackerModuleStatus;
  timeSpent?: string;
  title: string;
};

export type ProgressTrackerProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  modules?: ProgressTrackerModuleItem[];
  overallProgress: number;
  streak?: number;
  title?: string;
};

type ProgressTrackerContextValue = {
  modules: ProgressTrackerModuleItem[];
  overallProgress: number;
  streak: number;
  title?: string;
};

const ProgressTrackerContext =
  React.createContext<null | ProgressTrackerContextValue>(null);

function clampPercentage(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value <= 1) return Math.round(Math.max(0, value) * 100);
  return Math.round(Math.min(Math.max(0, value), 100));
}

const STATUS_LABELS: Record<ProgressTrackerModuleStatus, string> = {
  available: "Available",
  completed: "Completed",
  "in-progress": "In progress",
  locked: "Locked",
};

const STATUS_CLASSES: Record<ProgressTrackerModuleStatus, string> = {
  available: "border-secondary bg-secondary text-secondary-foreground",
  completed: "border-primary/20 bg-primary text-primary-foreground",
  "in-progress": "border-primary/20 bg-primary/10 text-primary",
  locked: "border-border bg-muted text-muted-foreground",
};

function getStatusLabel(status: ProgressTrackerModuleStatus): string {
  return STATUS_LABELS[status];
}

function getStatusClasses(status: ProgressTrackerModuleStatus): string {
  return STATUS_CLASSES[status];
}

function readPersistedChecklistItems(persistKey?: string): string[] {
  if (!persistKey || typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem(`checklist:${persistKey}`);
    if (!saved) return [];
    const parsed = JSON.parse(saved) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function areStringArraysEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;

  return left.every((value, index) => value === right[index]);
}

function getChecklistPersistKey(event?: Event): null | string {
  if (!(event instanceof CustomEvent)) return null;

  const detail: unknown = event.detail;
  if (typeof detail !== "object" || detail === null) return null;
  if (!("persistKey" in detail)) return null;

  const { persistKey } = detail;
  return typeof persistKey === "string" ? persistKey : null;
}

function getResolvedLessonProgress(module: ProgressTrackerModuleItem): {
  completedLessons: number;
  totalLessons: number;
} {
  if (!module.persistKey || !module.checklistItems?.length) {
    return {
      completedLessons: module.completedLessons ?? 0,
      totalLessons: module.lessons,
    };
  }

  const validIds = new Set(module.checklistItems.map((item) => item.id));
  const persistedIds = readPersistedChecklistItems(module.persistKey);
  const completedLessons = persistedIds.filter((id) => validIds.has(id)).length;

  return {
    completedLessons,
    totalLessons: module.checklistItems.length,
  };
}

function useChecklistProgress(
  checklistItems: ChecklistItem[] = [],
  persistKey?: string,
): null | { completedCount: number; progress: number; total: number } {
  const total = checklistItems.length;
  const [persistedIds, setPersistedIds] = React.useState<string[]>(() =>
    readPersistedChecklistItems(persistKey),
  );
  const setPersistedIdsIfChanged = React.useCallback((nextIds: string[]) => {
    setPersistedIds((currentIds) =>
      areStringArraysEqual(currentIds, nextIds) ? currentIds : nextIds,
    );
  }, []);

  React.useEffect(() => {
    setPersistedIdsIfChanged(readPersistedChecklistItems(persistKey));
  }, [persistKey, setPersistedIdsIfChanged]);

  React.useEffect(() => {
    if (!persistKey || typeof window === "undefined") return;

    const sync = (event?: Event): void => {
      const eventPersistKey = getChecklistPersistKey(event);
      if (eventPersistKey && eventPersistKey !== persistKey) return;

      setPersistedIdsIfChanged(readPersistedChecklistItems(persistKey));
    };
    const syncEventListener: EventListener = (event) => {
      sync(event);
    };

    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    window.addEventListener(CHECKLIST_PROGRESS_EVENT, syncEventListener);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
      window.removeEventListener(CHECKLIST_PROGRESS_EVENT, syncEventListener);
    };
  }, [persistKey, setPersistedIdsIfChanged]);

  if (!persistKey || total === 0) return null;

  const validIds = new Set(checklistItems.map((item) => item.id));
  const completedCount = persistedIds.filter((id) => validIds.has(id)).length;

  return {
    completedCount,
    progress: total > 0 ? Math.round((completedCount / total) * 100) : 0,
    total,
  };
}

function useProgressTrackerContext(): ProgressTrackerContextValue {
  const context = React.useContext(ProgressTrackerContext);

  if (!context) {
    throw new Error(
      "ProgressTracker compound components must be used within <ProgressTracker />.",
    );
  }

  return context;
}

function ProgressTrackerRoot({
  children,
  className,
  modules = [],
  overallProgress,
  streak = 0,
  title = "Learning progress",
  ...props
}: ProgressTrackerProps): React.ReactNode {
  const contextValue = React.useMemo(
    () => ({
      modules,
      overallProgress: clampPercentage(overallProgress),
      streak,
      title,
    }),
    [modules, overallProgress, streak, title],
  );

  return (
    <ProgressTrackerContext.Provider value={contextValue}>
      <section
        aria-label={title}
        className={cn("grid gap-6", className)}
        {...props}
      >
        {children}
      </section>
    </ProgressTrackerContext.Provider>
  );
}

export type ProgressTrackerOverviewProps =
  React.HTMLAttributes<HTMLDivElement> & {
    description?: string;
    label?: string;
  };

// eslint-disable-next-line max-lines-per-function
function ProgressTrackerOverview({
  className,
  description = "Track completion across modules, lessons, and exercises.",
  label = "Overall progress",
  ...props
}: ProgressTrackerOverviewProps): React.ReactNode {
  const { modules, overallProgress, streak, title } =
    useProgressTrackerContext();
  const trackedPersistKeys = React.useMemo(
    () => modules.map((module) => module.persistKey).filter(Boolean),
    [modules],
  );
  const [, forceChecklistRefresh] = React.useState(0);

  React.useEffect(() => {
    if (trackedPersistKeys.length === 0 || typeof window === "undefined") {
      return;
    }

    const trackedKeys = new Set(trackedPersistKeys);
    const sync = (event?: Event): void => {
      const eventPersistKey = getChecklistPersistKey(event);
      if (eventPersistKey && !trackedKeys.has(eventPersistKey)) return;

      forceChecklistRefresh((version) => version + 1);
    };
    const syncEventListener: EventListener = (event) => {
      sync(event);
    };

    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    window.addEventListener(CHECKLIST_PROGRESS_EVENT, syncEventListener);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
      window.removeEventListener(CHECKLIST_PROGRESS_EVENT, syncEventListener);
    };
  }, [trackedPersistKeys]);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (overallProgress / 100) * circumference;
  const completedModules = modules.filter(
    (module) => module.status === "completed",
  ).length;
  const lessonTotals = modules.reduce(
    (totals, module) => {
      const resolvedProgress = getResolvedLessonProgress(module);

      return {
        completedLessons:
          totals.completedLessons + resolvedProgress.completedLessons,
        totalLessons: totals.totalLessons + resolvedProgress.totalLessons,
      };
    },
    { completedLessons: 0, totalLessons: 0 },
  );
  const totalLessons = lessonTotals.totalLessons;
  const completedLessons = lessonTotals.completedLessons;
  const totalExercises = modules.reduce(
    (sum, module) => sum + (module.exercises ?? 0),
    0,
  );
  const completedExercises = modules.reduce(
    (sum, module) => sum + (module.completedExercises ?? 0),
    0,
  );

  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Badge className="w-fit" variant="secondary">
            {label}
          </Badge>
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm text-muted-foreground whitespace-nowrap">
          <span
            aria-hidden="true"
            className="inline-flex h-2.5 w-2.5 rounded-full bg-primary"
          />
          <span>
            <span className="font-semibold text-foreground">{streak}</span> day
            {streak === 1 ? "" : "s"} streak
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[auto,1fr] lg:items-center">
        <div className="mx-auto flex flex-col items-center gap-3 text-center">
          <div className="relative flex h-36 w-36 items-center justify-center">
            <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
              <circle
                className="stroke-muted"
                cx="60"
                cy="60"
                fill="none"
                r={radius}
                strokeWidth="10"
              />
              <circle
                aria-label={label}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={overallProgress}
                className="stroke-primary transition-all duration-500"
                cx="60"
                cy="60"
                fill="none"
                r={radius}
                role="progressbar"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                strokeWidth="10"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-semibold text-foreground">
                {overallProgress}%
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Complete
              </span>
            </div>
          </div>
          <p className="max-w-52 text-sm text-muted-foreground">
            {completedModules} of {modules.length} modules completed.
          </p>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border bg-muted/30 p-4">
            <dt className="text-sm text-muted-foreground">Modules</dt>
            <dd className="mt-2 text-2xl font-semibold text-foreground">
              {completedModules}/{modules.length}
            </dd>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4">
            <dt className="text-sm text-muted-foreground">Lessons</dt>
            <dd className="mt-2 text-2xl font-semibold text-foreground">
              {completedLessons}/{totalLessons}
            </dd>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4">
            <dt className="text-sm text-muted-foreground">Exercises</dt>
            <dd className="mt-2 text-2xl font-semibold text-foreground">
              {completedExercises}/{totalExercises}
            </dd>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4">
            <dt className="text-sm text-muted-foreground">Momentum</dt>
            <dd className="mt-2 text-2xl font-semibold text-foreground">
              {streak} day{streak === 1 ? "" : "s"}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

export type ProgressTrackerModulesProps = React.HTMLAttributes<HTMLDivElement>;

function ProgressTrackerModules({
  children,
  className,
  ...props
}: ProgressTrackerModulesProps): React.ReactNode {
  return (
    <div
      className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export type ProgressTrackerModuleProps = React.HTMLAttributes<HTMLDivElement> &
  ProgressTrackerModuleItem;

// eslint-disable-next-line max-lines-per-function
function ProgressTrackerModule({
  badge,
  checklistItems,
  className,
  completedExercises,
  completedLessons = 0,
  currentLesson,
  description,
  exercises,
  href,
  id,
  lessons,
  persistKey,
  progress,
  skills = [],
  status,
  timeSpent,
  title,
  ...props
}: ProgressTrackerModuleProps): React.ReactNode {
  const checklistProgress = useChecklistProgress(checklistItems, persistKey);
  const resolvedLessons = checklistProgress?.completedCount ?? completedLessons;
  const resolvedLessonTotal = checklistProgress?.total || lessons;
  const progressPercent =
    checklistProgress?.progress ?? clampPercentage(progress);
  const progressValue = Math.min(resolvedLessons, resolvedLessonTotal);
  const safeExerciseTotal = exercises ?? 0;
  const safeExerciseComplete = Math.min(
    completedExercises ?? 0,
    safeExerciseTotal,
  );
  const card = (
    <Card
      aria-disabled={status === "locked"}
      className={cn(
        "h-full",
        status === "locked" && "opacity-80",
        href && "transition-shadow hover:shadow-md focus-within:shadow-md",
        className,
      )}
      id={id}
      {...props}
    >
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-xl">{title}</CardTitle>
            {description ? (
              <CardDescription>{description}</CardDescription>
            ) : null}
          </div>
          <Badge
            className={cn("whitespace-nowrap", getStatusClasses(status))}
            variant="outline"
          >
            {getStatusLabel(status)}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {badge ? <Badge variant="secondary">{badge}</Badge> : null}
          {currentLesson ? (
            <Badge variant="outline">Current: {currentLesson}</Badge>
          ) : null}
          {timeSpent ? <Badge variant="outline">{timeSpent}</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div
            aria-label={`${title} progress`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={progressPercent}
            role="progressbar"
          >
            <ProgressBar
              completedLabel="lessons"
              currentLabel={`${progressPercent}% complete`}
              isComplete={status === "completed"}
              max={resolvedLessonTotal}
              showLabels
              value={progressValue}
            />
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <span>
              Lessons:{" "}
              <span className="font-medium text-foreground">
                {resolvedLessons}/{resolvedLessonTotal}
              </span>
            </span>
            <span>
              Exercises:{" "}
              <span className="font-medium text-foreground">
                {safeExerciseComplete}/{safeExerciseTotal}
              </span>
            </span>
          </div>
        </div>
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <ProgressTrackerBadge key={skill}>{skill}</ProgressTrackerBadge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );

  if (!href || status === "locked") return card;

  return (
    <a
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      href={href}
    >
      {card}
    </a>
  );
}

export type ProgressTrackerStatsProps = React.HTMLAttributes<HTMLDivElement>;

function ProgressTrackerStats({
  children,
  className,
  ...props
}: ProgressTrackerStatsProps): React.ReactNode {
  return (
    <div
      className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export type ProgressTrackerStatProps = React.HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: ReactNode;
};

function ProgressTrackerStat({
  className,
  label,
  value,
  ...props
}: ProgressTrackerStatProps): React.ReactNode {
  return (
    <Card className={cn("h-full", className)} {...props}>
      <CardContent className="flex h-full flex-col justify-center gap-2 p-6">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-2xl font-semibold text-foreground">{value}</span>
      </CardContent>
    </Card>
  );
}

export type ProgressTrackerBadgeProps = React.HTMLAttributes<HTMLSpanElement>;

function ProgressTrackerBadge({
  children,
  className,
  ...props
}: ProgressTrackerBadgeProps): React.ReactNode {
  return (
    <Badge
      className={cn(
        "px-3 py-1 text-[11px] uppercase tracking-wide whitespace-nowrap",
        className,
      )}
      variant="secondary"
      {...props}
    >
      {children}
    </Badge>
  );
}

const ProgressTracker = Object.assign(ProgressTrackerRoot, {
  Badge: ProgressTrackerBadge,
  Module: ProgressTrackerModule,
  Modules: ProgressTrackerModules,
  Overview: ProgressTrackerOverview,
  Stat: ProgressTrackerStat,
  Stats: ProgressTrackerStats,
});

export {
  ProgressTracker,
  ProgressTrackerBadge,
  ProgressTrackerModule,
  ProgressTrackerModules,
  ProgressTrackerOverview,
  ProgressTrackerStat,
  ProgressTrackerStats,
  useProgressTrackerContext,
};
