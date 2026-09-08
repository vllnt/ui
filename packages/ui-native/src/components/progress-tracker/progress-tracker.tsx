"use client";

import { createContext, type ReactNode, type Ref, use, useMemo } from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Badge } from "../badge/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card/card";
import { ProgressBar } from "../progress-bar/progress-bar";

export type ProgressTrackerModuleStatus =
  | "available"
  | "completed"
  | "in-progress"
  | "locked";

/** One module represented in native learning progress. */
export type ProgressTrackerModuleItem = {
  readonly badge?: string;
  readonly completedExercises?: number;
  readonly completedLessons?: number;
  readonly currentLesson?: string;
  readonly description?: string;
  readonly exercises?: number;
  readonly id: string;
  readonly lessons: number;
  readonly progress: number;
  readonly skills?: readonly string[];
  readonly status: ProgressTrackerModuleStatus;
  readonly timeSpent?: string;
  readonly title: string;
};

/** Caller-localized labels and formatters for progress data. */
export type ProgressTrackerLabels = {
  readonly completedModules: (completed: number, total: number) => string;
  readonly currentLesson: (lesson: string) => string;
  readonly exercises: string;
  readonly lessons: string;
  readonly modules: string;
  readonly momentum: string;
  readonly overallProgress: string;
  readonly progressPercent: (percent: number) => string;
  readonly status: Readonly<Record<ProgressTrackerModuleStatus, string>>;
  readonly streak: (days: number) => string;
};

/** Props for the native progress tracker state boundary. */
export type ProgressTrackerProps = Omit<ViewProps, "children"> & {
  readonly children?: ReactNode;
  readonly labels: ProgressTrackerLabels;
  readonly modules?: readonly ProgressTrackerModuleItem[];
  readonly overallProgress: number;
  readonly ref?: Ref<View>;
  readonly streak?: number;
  readonly title: string;
};

type ProgressTrackerContextValue = {
  readonly labels: ProgressTrackerLabels;
  readonly modules: readonly ProgressTrackerModuleItem[];
  readonly overallProgress: number;
  readonly streak: number;
  readonly title: string;
};

const ProgressTrackerContext = createContext<
  ProgressTrackerContextValue | undefined
>(undefined);
const styles = StyleSheet.create({
  modulePressable: { minHeight: 44 },
  row: { alignItems: "center", flexDirection: "row", flexWrap: "wrap" },
  stats: { flexDirection: "row", flexWrap: "wrap" },
});

function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(
    100,
    Math.max(0, Math.round(value <= 1 ? value * 100 : value)),
  );
}

function useProgressTrackerContext(): ProgressTrackerContextValue {
  const context = use(ProgressTrackerContext);
  if (!context)
    throw new Error(
      "ProgressTracker parts must be used within ProgressTracker",
    );
  return context;
}

/** Native progress tracker context and layout root. */
function ProgressTrackerRoot({
  children,
  labels,
  modules = [],
  overallProgress,
  ref,
  streak = 0,
  style,
  title,
  ...props
}: ProgressTrackerProps) {
  const theme = useTheme();
  const value = useMemo(
    () => ({
      labels,
      modules,
      overallProgress: clampPercent(overallProgress),
      streak,
      title,
    }),
    [labels, modules, overallProgress, streak, title],
  );
  return (
    <ProgressTrackerContext value={value}>
      <View
        {...props}
        accessibilityLabel={title}
        ref={ref}
        style={[{ gap: theme.spacing[6] }, style]}
      >
        {children}
      </View>
    </ProgressTrackerContext>
  );
}
ProgressTrackerRoot.displayName = "ProgressTracker";

/** Props for the native progress summary card. */
export type ProgressTrackerOverviewProps = Omit<ViewProps, "children"> & {
  readonly description?: string;
  readonly ref?: Ref<View>;
};

/** Native progress summary using caller-localized labels. */
function ProgressTrackerOverview({
  description,
  ref,
  style,
  ...props
}: ProgressTrackerOverviewProps) {
  const theme = useTheme();
  const { labels, modules, overallProgress, streak, title } =
    useProgressTrackerContext();
  const completedModules = modules.filter(
    (module) => module.status === "completed",
  ).length;
  const completedLessons = modules.reduce(
    (sum, module) =>
      sum + Math.min(module.completedLessons ?? 0, module.lessons),
    0,
  );
  const lessons = modules.reduce((sum, module) => sum + module.lessons, 0);
  const completedExercises = modules.reduce(
    (sum, module) =>
      sum + Math.min(module.completedExercises ?? 0, module.exercises ?? 0),
    0,
  );
  const exercises = modules.reduce(
    (sum, module) => sum + (module.exercises ?? 0),
    0,
  );
  const stats = [
    { label: labels.modules, value: `${completedModules}/${modules.length}` },
    { label: labels.lessons, value: `${completedLessons}/${lessons}` },
    { label: labels.exercises, value: `${completedExercises}/${exercises}` },
    { label: labels.momentum, value: labels.streak(streak) },
  ];
  return (
    <Card {...props} ref={ref} style={style}>
      <CardHeader>
        <Badge variant="secondary">{labels.overallProgress}</Badge>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent style={{ gap: theme.spacing[4] }}>
        <ProgressBar
          accessibilityLabel={labels.overallProgress}
          completedLabel={labels.modules}
          currentLabel={labels.progressPercent(overallProgress)}
          max={100}
          value={overallProgress}
        />
        <Text
          style={[
            theme.typography.scale.bodySmall,
            { color: theme.colors.mutedForeground },
          ]}
        >
          {labels.completedModules(completedModules, modules.length)}
        </Text>
        <View style={[styles.stats, { gap: theme.spacing[3] }]}>
          {stats.map((stat) => (
            <View
              key={stat.label}
              style={{
                backgroundColor: theme.colors.muted,
                borderRadius: theme.radius.md,
                minWidth: 120,
                padding: theme.spacing[3],
              }}
            >
              <Text
                style={[
                  theme.typography.scale.caption,
                  { color: theme.colors.mutedForeground },
                ]}
              >
                {stat.label}
              </Text>
              <Text
                style={[
                  theme.typography.scale.bodyLarge,
                  {
                    color: theme.colors.foreground,
                    fontWeight: theme.typography.fontWeight.heading,
                  },
                ]}
              >
                {stat.value}
              </Text>
            </View>
          ))}
        </View>
      </CardContent>
    </Card>
  );
}
ProgressTrackerOverview.displayName = "ProgressTrackerOverview";

export type ProgressTrackerModulesProps = ViewProps & {
  readonly ref?: Ref<View>;
};

function ProgressTrackerModules({
  ref,
  style,
  ...props
}: ProgressTrackerModulesProps) {
  const theme = useTheme();
  return (
    <View {...props} ref={ref} style={[{ gap: theme.spacing[4] }, style]} />
  );
}
ProgressTrackerModules.displayName = "ProgressTrackerModules";

export type ProgressTrackerModuleProps = Omit<ViewProps, "children" | "id"> &
  ProgressTrackerModuleItem & {
    readonly onPress?: (module: ProgressTrackerModuleItem) => void;
    readonly ref?: Ref<View>;
  };

/** Native module card that delegates navigation to the host without web hrefs. */
function ProgressTrackerModule({
  badge,
  completedExercises = 0,
  completedLessons = 0,
  currentLesson,
  description,
  exercises = 0,
  id,
  lessons,
  onPress,
  progress,
  ref,
  skills = [],
  status,
  style,
  timeSpent,
  title,
  ...props
}: ProgressTrackerModuleProps) {
  const theme = useTheme();
  const { labels } = useProgressTrackerContext();
  const module: ProgressTrackerModuleItem = {
    badge,
    completedExercises,
    completedLessons,
    currentLesson,
    description,
    exercises,
    id,
    lessons,
    progress,
    skills,
    status,
    timeSpent,
    title,
  };
  const locked = status === "locked";
  const content = (
    <Card
      {...props}
      accessibilityState={{ disabled: locked }}
      nativeID={`progress-module-${id}`}
      ref={ref}
      style={style}
    >
      <CardHeader>
        <View
          style={[
            styles.row,
            { gap: theme.spacing[2], justifyContent: "space-between" },
          ]}
        >
          <CardTitle style={{ flex: 1 }}>{title}</CardTitle>
          <Badge variant={status === "completed" ? "default" : "secondary"}>
            {labels.status[status]}
          </Badge>
        </View>
        {description ? <CardDescription>{description}</CardDescription> : null}
        <View style={[styles.row, { gap: theme.spacing[2] }]}>
          {badge ? <Badge variant="secondary">{badge}</Badge> : null}
          {currentLesson ? (
            <Badge variant="outline">
              {labels.currentLesson(currentLesson)}
            </Badge>
          ) : null}
          {timeSpent ? <Badge variant="outline">{timeSpent}</Badge> : null}
        </View>
      </CardHeader>
      <CardContent style={{ gap: theme.spacing[3] }}>
        <ProgressBar
          accessibilityLabel={labels.progressPercent(clampPercent(progress))}
          completedLabel={labels.lessons}
          currentLabel={labels.progressPercent(clampPercent(progress))}
          isComplete={status === "completed"}
          max={lessons}
          value={Math.min(completedLessons, lessons)}
        />
        <View style={[styles.row, { gap: theme.spacing[4] }]}>
          <Text
            style={[
              theme.typography.scale.bodySmall,
              { color: theme.colors.mutedForeground },
            ]}
          >
            {labels.lessons}: {completedLessons}/{lessons}
          </Text>
          <Text
            style={[
              theme.typography.scale.bodySmall,
              { color: theme.colors.mutedForeground },
            ]}
          >
            {labels.exercises}: {completedExercises}/{exercises}
          </Text>
        </View>
        <View style={[styles.row, { gap: theme.spacing[2] }]}>
          {skills.map((skill) => (
            <ProgressTrackerBadge key={skill}>{skill}</ProgressTrackerBadge>
          ))}
        </View>
      </CardContent>
    </Card>
  );
  if (!onPress || locked) return content;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        onPress(module);
      }}
      style={({ pressed }) => [
        styles.modulePressable,
        { opacity: pressed ? 0.8 : 1 },
      ]}
    >
      {content}
    </Pressable>
  );
}
ProgressTrackerModule.displayName = "ProgressTrackerModule";

export type ProgressTrackerStatsProps = ViewProps & {
  readonly ref?: Ref<View>;
};
function ProgressTrackerStats({
  ref,
  style,
  ...props
}: ProgressTrackerStatsProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      ref={ref}
      style={[styles.stats, { gap: theme.spacing[4] }, style]}
    />
  );
}
ProgressTrackerStats.displayName = "ProgressTrackerStats";

export type ProgressTrackerStatProps = Omit<ViewProps, "children"> & {
  readonly label: string;
  readonly ref?: Ref<View>;
  readonly value: ReactNode;
};
function ProgressTrackerStat({
  label,
  ref,
  style,
  value,
  ...props
}: ProgressTrackerStatProps) {
  const theme = useTheme();
  return (
    <Card {...props} ref={ref} style={[{ minWidth: 140 }, style]}>
      <CardContent
        style={{ gap: theme.spacing[2], paddingTop: theme.spacing[6] }}
      >
        <Text
          style={[
            theme.typography.scale.bodySmall,
            { color: theme.colors.mutedForeground },
          ]}
        >
          {label}
        </Text>
        <Text
          style={[
            theme.typography.scale.bodyLarge,
            {
              color: theme.colors.foreground,
              fontWeight: theme.typography.fontWeight.heading,
            },
          ]}
        >
          {value}
        </Text>
      </CardContent>
    </Card>
  );
}
ProgressTrackerStat.displayName = "ProgressTrackerStat";

export type ProgressTrackerBadgeProps = ViewProps & {
  readonly children: ReactNode;
  readonly ref?: Ref<View>;
};
function ProgressTrackerBadge({
  children,
  ref,
  ...props
}: ProgressTrackerBadgeProps) {
  return (
    <Badge {...props} ref={ref} variant="secondary">
      {children}
    </Badge>
  );
}
ProgressTrackerBadge.displayName = "ProgressTrackerBadge";

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
