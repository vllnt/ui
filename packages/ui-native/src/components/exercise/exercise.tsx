"use client";

import type { ReactNode, Ref } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";

import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";

export type ExerciseDifficulty = "easy" | "hard" | "medium";

/** Caller-localized native exercise labels. */
export type ExerciseLabels = {
  readonly difficulty: Readonly<Record<ExerciseDifficulty, string>>;
  readonly hideSolution: string;
  readonly hint: string;
  readonly markComplete: string;
  readonly markIncomplete: string;
  readonly showHint: string;
  readonly showSolution: string;
  readonly solution: string;
};

/** Props for a controlled or uncontrolled native exercise. */
export type ExerciseProps = Omit<ViewProps, "children"> & {
  readonly children: ReactNode;
  readonly completed?: boolean;
  readonly defaultCompleted?: boolean;
  readonly defaultHintVisible?: boolean;
  readonly defaultSolutionVisible?: boolean;
  readonly difficulty?: ExerciseDifficulty;
  readonly hint?: string;
  readonly hintVisible?: boolean;
  readonly labels: ExerciseLabels;
  readonly onCompletedChange?: (completed: boolean) => void;
  readonly onHintVisibleChange?: (visible: boolean) => void;
  readonly onSolutionVisibleChange?: (visible: boolean) => void;
  readonly ref?: Ref<View>;
  readonly solution?: ReactNode;
  readonly solutionVisible?: boolean;
  readonly title: string;
};

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  root: { borderStyle: "dashed", borderWidth: 2 },
});

function ExerciseAction({
  label,
  onPress,
  selected = false,
}: {
  readonly label: string;
  readonly onPress: () => void;
  readonly selected?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: selected
            ? theme.colors.primary
            : theme.colors.secondary,
          borderRadius: theme.radius.md,
          opacity: pressed ? 0.8 : 1,
          paddingHorizontal: theme.spacing[3],
        },
      ]}
    >
      <Text
        style={[
          theme.typography.scale.bodySmall,
          {
            color: selected
              ? theme.colors.primaryForeground
              : theme.colors.secondaryForeground,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
ExerciseAction.displayName = "ExerciseAction";

/** Native exercise surface with independently controllable completion and reveals. */
function Exercise({
  children,
  completed,
  defaultCompleted = false,
  defaultHintVisible = false,
  defaultSolutionVisible = false,
  difficulty = "medium",
  hint,
  hintVisible,
  labels,
  onCompletedChange,
  onHintVisibleChange,
  onSolutionVisibleChange,
  ref,
  solution,
  solutionVisible,
  style,
  title,
  ...props
}: ExerciseProps) {
  const theme = useTheme();
  const [isCompleted, setCompleted] = useControllableState(
    completed === undefined
      ? {
          defaultValue: defaultCompleted,
          mode: "uncontrolled",
          onChange: onCompletedChange,
        }
      : { mode: "controlled", onChange: onCompletedChange, value: completed },
  );
  const [showHint, setHintVisible] = useControllableState(
    hintVisible === undefined
      ? {
          defaultValue: defaultHintVisible,
          mode: "uncontrolled",
          onChange: onHintVisibleChange,
        }
      : {
          mode: "controlled",
          onChange: onHintVisibleChange,
          value: hintVisible,
        },
  );
  const [showSolution, setSolutionVisible] = useControllableState(
    solutionVisible === undefined
      ? {
          defaultValue: defaultSolutionVisible,
          mode: "uncontrolled",
          onChange: onSolutionVisibleChange,
        }
      : {
          mode: "controlled",
          onChange: onSolutionVisibleChange,
          value: solutionVisible,
        },
  );

  return (
    <View
      {...props}
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          gap: theme.spacing[4],
          padding: theme.spacing[6],
        },
        style,
      ]}
    >
      <View style={[styles.header, { gap: theme.spacing[3] }]}>
        <View style={{ flex: 1, gap: theme.spacing[1] }}>
          <Text
            accessibilityRole="header"
            style={[
              theme.typography.scale.bodyLarge,
              {
                color: theme.colors.foreground,
                fontWeight: theme.typography.fontWeight.heading,
              },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              theme.typography.scale.caption,
              { color: theme.colors.mutedForeground },
            ]}
          >
            {labels.difficulty[difficulty]}
          </Text>
        </View>
        <ExerciseAction
          label={isCompleted ? labels.markIncomplete : labels.markComplete}
          onPress={() => {
            setCompleted(!isCompleted);
          }}
          selected={isCompleted}
        />
      </View>
      <View style={{ gap: theme.spacing[2] }}>{children}</View>
      {hint ? (
        showHint ? (
          <View
            accessibilityLiveRegion="polite"
            style={{
              backgroundColor: theme.colors.muted,
              borderRadius: theme.radius.md,
              gap: theme.spacing[1],
              padding: theme.spacing[3],
            }}
          >
            <Text
              style={[
                theme.typography.scale.caption,
                { color: theme.colors.mutedForeground },
              ]}
            >
              {labels.hint}
            </Text>
            <Text
              style={[
                theme.typography.scale.bodySmall,
                { color: theme.colors.foreground },
              ]}
            >
              {hint}
            </Text>
          </View>
        ) : (
          <ExerciseAction
            label={labels.showHint}
            onPress={() => {
              setHintVisible(true);
            }}
          />
        )
      ) : null}
      {solution ? (
        <View style={{ gap: theme.spacing[2] }}>
          <ExerciseAction
            label={showSolution ? labels.hideSolution : labels.showSolution}
            onPress={() => {
              setSolutionVisible(!showSolution);
            }}
            selected={showSolution}
          />
          {showSolution ? (
            <View
              accessibilityLiveRegion="polite"
              style={{
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
                borderWidth: 1,
                gap: theme.spacing[2],
                padding: theme.spacing[4],
              }}
            >
              <Text
                style={[
                  theme.typography.scale.caption,
                  { color: theme.colors.mutedForeground },
                ]}
              >
                {labels.solution}
              </Text>
              {solution}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
Exercise.displayName = "Exercise";

export { Exercise };
