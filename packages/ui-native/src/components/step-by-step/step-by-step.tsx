"use client";

import { Children, isValidElement, type ReactNode, type Ref } from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";

import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";

/** Props for a stable native instructional step. */
export type StepProps = Omit<ViewProps, "children"> & {
  readonly children: ReactNode;
  readonly id: string;
  readonly number?: number;
  readonly ref?: Ref<View>;
  readonly title: string;
};

/** Caller-localized interactive step labels. */
export type StepByStepLabels = {
  readonly progress: (completed: number, total: number) => string;
  readonly toggleStep: (title: string, completed: boolean) => string;
};

/** Props for a controlled or uncontrolled native step sequence. */
export type StepByStepProps = Omit<ViewProps, "children"> & {
  readonly children: ReactNode;
  readonly completedStepIds?: readonly string[];
  readonly defaultCompletedStepIds?: readonly string[];
  readonly interactive?: boolean;
  readonly labels?: StepByStepLabels;
  readonly onCompletedStepIdsChange?: (ids: readonly string[]) => void;
  readonly ref?: Ref<View>;
  readonly title?: string;
};

const styles = StyleSheet.create({
  marker: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  row: { alignItems: "flex-start", flexDirection: "row" },
  toggle: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
});

/** Presentational native step used by StepByStep. */
function Step({ children, number, ref, style, title, ...props }: StepProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      ref={ref}
      style={[styles.row, { gap: theme.spacing[4] }, style]}
    >
      <View
        style={[
          styles.marker,
          {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.full,
          },
        ]}
      >
        <Text
          style={[
            theme.typography.scale.bodySmall,
            {
              color: theme.colors.primaryForeground,
              fontWeight: theme.typography.fontWeight.heading,
            },
          ]}
        >
          {number}
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          gap: theme.spacing[2],
          paddingBottom: theme.spacing[8],
        }}
      >
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
        {children}
      </View>
    </View>
  );
}
Step.displayName = "Step";

/** Native instructional sequence with optional controlled completion state. */
function StepByStepRoot({
  children,
  completedStepIds,
  defaultCompletedStepIds = [],
  interactive = false,
  labels,
  onCompletedStepIdsChange,
  ref,
  style,
  title,
  ...props
}: StepByStepProps) {
  const theme = useTheme();
  const steps = Children.toArray(children).filter((child) =>
    isValidElement<StepProps>(child),
  );
  const [completedIds, setCompletedIds] = useControllableState(
    completedStepIds === undefined
      ? {
          defaultValue: defaultCompletedStepIds,
          mode: "uncontrolled",
          onChange: onCompletedStepIdsChange,
        }
      : {
          mode: "controlled",
          onChange: onCompletedStepIdsChange,
          value: completedStepIds,
        },
  );
  if (interactive && !labels)
    throw new Error("StepByStep labels are required in interactive mode");

  return (
    <View {...props} ref={ref} style={[{ gap: theme.spacing[3] }, style]}>
      {title ? (
        <View style={[styles.row, { justifyContent: "space-between" }]}>
          <Text
            accessibilityRole="header"
            style={[
              theme.typography.scale.h4,
              {
                color: theme.colors.foreground,
                fontWeight: theme.typography.fontWeight.heading,
              },
            ]}
          >
            {title}
          </Text>
          {interactive && labels ? (
            <Text
              style={[
                theme.typography.scale.caption,
                { color: theme.colors.mutedForeground },
              ]}
            >
              {labels.progress(completedIds.length, steps.length)}
            </Text>
          ) : null}
        </View>
      ) : null}
      {steps.map((step, index) => {
        const completed = completedIds.includes(step.props.id);
        if (!interactive) {
          return (
            <Step
              {...step.props}
              key={step.props.id}
              number={step.props.number ?? index + 1}
            />
          );
        }
        return (
          <View
            key={step.props.id}
            style={[
              styles.row,
              { gap: theme.spacing[4], opacity: completed ? 0.65 : 1 },
            ]}
          >
            <Pressable
              accessibilityLabel={labels?.toggleStep(
                step.props.title,
                completed,
              )}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: completed }}
              nativeID={`step-by-step-${step.props.id}`}
              onPress={() => {
                const next = completed
                  ? completedIds.filter((id) => id !== step.props.id)
                  : [...completedIds, step.props.id];
                setCompletedIds(next);
              }}
              style={styles.toggle}
            >
              <View
                style={[
                  styles.marker,
                  {
                    backgroundColor: theme.colors.primary,
                    borderRadius: theme.radius.full,
                  },
                ]}
              >
                <Text
                  style={[
                    theme.typography.scale.bodySmall,
                    {
                      color: theme.colors.primaryForeground,
                      fontWeight: theme.typography.fontWeight.heading,
                    },
                  ]}
                >
                  {completed ? "✓" : (step.props.number ?? index + 1)}
                </Text>
              </View>
            </Pressable>
            <View
              style={{
                flex: 1,
                gap: theme.spacing[2],
                paddingBottom: theme.spacing[8],
              }}
            >
              <Text
                accessibilityRole="header"
                style={[
                  theme.typography.scale.bodyLarge,
                  {
                    color: theme.colors.foreground,
                    fontWeight: theme.typography.fontWeight.heading,
                    textDecorationLine: completed ? "line-through" : "none",
                  },
                ]}
              >
                {step.props.title}
              </Text>
              {step.props.children}
            </View>
          </View>
        );
      })}
    </View>
  );
}
StepByStepRoot.displayName = "StepByStep";

const StepByStep = Object.assign(StepByStepRoot, { Step });

export { Step, StepByStep };
