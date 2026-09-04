"use client";

import type { Ref } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";

import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";

export type StepperStepState = "complete" | "current" | "upcoming";

/** One stable step in a native stepper. */
export type StepperStep = {
  readonly description?: string;
  readonly disabled?: boolean;
  readonly id: string;
  readonly meta?: string;
  readonly title: string;
};

/** Localized accessibility text for native steps. */
export type StepperLabels = {
  readonly step: (
    step: StepperStep,
    state: StepperStepState,
    index: number,
    total: number,
  ) => string;
  readonly stepper: string;
};

/** Props for a controlled or uncontrolled native stepper. */
export type StepperProps = Omit<ViewProps, "children"> & {
  readonly currentStep?: number;
  readonly defaultCurrentStep?: number;
  readonly labels: StepperLabels;
  readonly onCurrentStepChange?: (step: number, item: StepperStep) => void;
  readonly onStepPress?: (item: StepperStep, index: number) => void;
  readonly orientation?: "horizontal" | "vertical";
  readonly ref?: Ref<View>;
  readonly showNumbers?: boolean;
  readonly steps: readonly StepperStep[];
};

const styles = StyleSheet.create({
  marker: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  step: { alignItems: "flex-start", minHeight: 44 },
  vertical: { flexDirection: "row" },
});

function normalizeStep(step: number, total: number): number {
  return Math.min(Math.max(1, Math.round(step)), Math.max(1, total));
}

function stateFor(index: number, current: number): StepperStepState {
  const step = index + 1;
  if (step < current) return "complete";
  if (step === current) return "current";
  return "upcoming";
}

/** Scroll-safe native stepper with stable ids and explicit current-step state. */
function Stepper({
  currentStep,
  defaultCurrentStep = 1,
  labels,
  onCurrentStepChange,
  onStepPress,
  orientation = "horizontal",
  ref,
  showNumbers = true,
  steps,
  style,
  ...props
}: StepperProps) {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useControllableState(
    currentStep === undefined
      ? {
          defaultValue: normalizeStep(defaultCurrentStep, steps.length),
          mode: "uncontrolled",
          onChange: (next) => {
            const item = steps[next - 1];
            if (item) onCurrentStepChange?.(next, item);
          },
        }
      : {
          mode: "controlled",
          onChange: (next) => {
            const item = steps[next - 1];
            if (item) onCurrentStepChange?.(next, item);
          },
          value: normalizeStep(currentStep, steps.length),
        },
  );
  if (steps.length === 0) return null;
  const horizontal = orientation === "horizontal";
  const content = steps.map((step, index) => {
    const state = stateFor(index, activeStep);
    const disabled = step.disabled === true;
    return (
      <Pressable
        accessibilityLabel={labels.step(step, state, index, steps.length)}
        accessibilityRole="button"
        accessibilityState={{ disabled, selected: state === "current" }}
        disabled={disabled}
        key={step.id}
        nativeID={`stepper-step-${step.id}`}
        onPress={() => {
          setActiveStep(index + 1);
          onStepPress?.(step, index);
        }}
        style={({ pressed }) => [
          styles.step,
          orientation === "vertical" ? styles.vertical : undefined,
          {
            backgroundColor: pressed ? theme.colors.muted : theme.colors.card,
            borderRadius: theme.radius.md,
            flex: horizontal ? 1 : undefined,
            gap: theme.spacing[3],
            minWidth: horizontal ? 144 : undefined,
            opacity: disabled ? 0.5 : 1,
            padding: theme.spacing[2],
          },
        ]}
      >
        <View
          style={[
            styles.marker,
            {
              backgroundColor:
                state === "complete"
                  ? theme.colors.primary
                  : state === "current"
                    ? theme.colors.accent
                    : theme.colors.background,
              borderColor:
                state === "upcoming"
                  ? theme.colors.border
                  : theme.colors.primary,
              borderRadius: theme.radius.full,
              borderWidth: 1,
            },
          ]}
        >
          <Text
            style={[
              theme.typography.scale.caption,
              {
                color:
                  state === "complete"
                    ? theme.colors.primaryForeground
                    : theme.colors.foreground,
                fontWeight: theme.typography.fontWeight.heading,
              },
            ]}
          >
            {state === "complete" ? "✓" : showNumbers ? index + 1 : "•"}
          </Text>
        </View>
        <View style={{ flex: 1, gap: theme.spacing[1] }}>
          <Text
            style={[
              theme.typography.scale.bodySmall,
              {
                color: theme.colors.foreground,
                fontWeight: theme.typography.fontWeight.caption,
              },
            ]}
          >
            {step.title}
          </Text>
          {step.meta ? (
            <Text
              style={[
                theme.typography.scale.caption,
                { color: theme.colors.mutedForeground },
              ]}
            >
              {step.meta}
            </Text>
          ) : null}
          {step.description ? (
            <Text
              style={[
                theme.typography.scale.bodySmall,
                { color: theme.colors.mutedForeground },
              ]}
            >
              {step.description}
            </Text>
          ) : null}
        </View>
      </Pressable>
    );
  });

  return (
    <View
      {...props}
      accessibilityLabel={labels.stepper}
      ref={ref}
      style={[
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          padding: theme.spacing[4],
        },
        style,
      ]}
    >
      {horizontal ? (
        <ScrollView
          contentContainerStyle={{ gap: theme.spacing[3] }}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        <View style={{ gap: theme.spacing[2] }}>{content}</View>
      )}
    </View>
  );
}
Stepper.displayName = "Stepper";

export { Stepper };
