"use client";

import { type ReactNode, type Ref, useId } from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";

import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";

/** One stable, caller-authored native tour step. */
export type TourStep = {
  readonly badge?: string;
  readonly description: ReactNode;
  readonly hint?: ReactNode;
  readonly id: string;
  readonly media?: ReactNode;
  readonly title: string;
};

/** Localized labels and announcements for a native tour. */
export type TourLabels = {
  readonly finish: string;
  readonly goToStep: (step: TourStep, index: number) => string;
  readonly hint: string;
  readonly next: string;
  readonly previous: string;
  readonly stepProgress: (current: number, total: number) => string;
  readonly tour: string;
};

/** Props for the controlled or uncontrolled native tour. */
export type TourProps = Omit<ViewProps, "children"> & {
  readonly currentStep?: number;
  readonly defaultCurrentStep?: number;
  readonly labels: TourLabels;
  readonly onComplete?: () => void;
  readonly onCurrentStepChange?: (index: number, step: TourStep) => void;
  readonly ref?: Ref<View>;
  readonly steps: readonly TourStep[];
};

const styles = StyleSheet.create({
  actions: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  badgeRow: { flexDirection: "row", flexWrap: "wrap" },
  button: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  content: { minHeight: 120 },
  dots: { flexDirection: "row" },
  progressFill: { height: "100%" },
  progressTrack: { height: 8, overflow: "hidden" },
  root: { borderWidth: 1 },
});

function clampStep(index: number, total: number): number {
  return Math.min(Math.max(0, Math.round(index)), Math.max(0, total - 1));
}

function TourAction({
  disabled = false,
  label,
  onPress,
}: {
  readonly disabled?: boolean;
  readonly label: string;
  readonly onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme.colors.secondary,
          borderRadius: theme.radius.md,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
          paddingHorizontal: theme.spacing[4],
        },
      ]}
    >
      <Text
        style={[
          theme.typography.scale.bodySmall,
          { color: theme.colors.secondaryForeground },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
TourAction.displayName = "TourAction";

/** Native, touch-first tour with stable step identifiers and 44-point actions. */
function Tour({
  currentStep,
  defaultCurrentStep = 0,
  labels,
  onComplete,
  onCurrentStepChange,
  ref,
  steps,
  style,
  ...props
}: TourProps) {
  const theme = useTheme();
  const generatedId = useId();
  const initialStep = clampStep(defaultCurrentStep, steps.length);
  const [activeIndex, setActiveIndex] = useControllableState(
    currentStep === undefined
      ? {
          defaultValue: initialStep,
          mode: "uncontrolled",
          onChange: (index) => {
            const step = steps[index];
            if (step) onCurrentStepChange?.(index, step);
          },
        }
      : {
          mode: "controlled",
          onChange: (index) => {
            const step = steps[index];
            if (step) onCurrentStepChange?.(index, step);
          },
          value: clampStep(currentStep, steps.length),
        },
  );
  const step = steps[activeIndex];
  if (!step) return null;

  const progressText = labels.stepProgress(activeIndex + 1, steps.length);
  const goTo = (index: number) => {
    setActiveIndex(clampStep(index, steps.length));
  };

  return (
    <View
      {...props}
      accessibilityLabel={`${labels.tour}: ${step.title}`}
      accessible={false}
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          gap: theme.spacing[4],
          padding: theme.spacing[6],
        },
        style,
      ]}
    >
      <View style={[styles.badgeRow, { gap: theme.spacing[2] }]}>
        <Text
          style={[
            theme.typography.scale.caption,
            { color: theme.colors.mutedForeground },
          ]}
        >
          {labels.tour}
        </Text>
        {step.badge ? (
          <Text
            style={[
              theme.typography.scale.caption,
              { color: theme.colors.foreground },
            ]}
          >
            {step.badge}
          </Text>
        ) : null}
      </View>
      <Text
        accessibilityRole="header"
        style={[
          theme.typography.scale.h4,
          {
            color: theme.colors.cardForeground,
            fontWeight: theme.typography.fontWeight.heading,
          },
        ]}
      >
        {step.title}
      </Text>
      <View
        accessibilityLabel={progressText}
        accessibilityRole="progressbar"
        accessibilityValue={{
          max: steps.length,
          min: 1,
          now: activeIndex + 1,
          text: progressText,
        }}
        nativeID={`${generatedId}-progress`}
        style={[
          styles.progressTrack,
          {
            backgroundColor: theme.colors.muted,
            borderRadius: theme.radius.full,
          },
        ]}
      >
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: theme.colors.primary,
              borderRadius: theme.radius.full,
              width: `${((activeIndex + 1) / steps.length) * 100}%`,
            },
          ]}
        />
      </View>
      {step.media ? (
        <View style={{ paddingVertical: theme.spacing[2] }}>{step.media}</View>
      ) : null}
      <View style={[styles.content, { gap: theme.spacing[3] }]}>
        {step.description}
      </View>
      {step.hint ? (
        <View
          accessibilityLabel={labels.hint}
          style={{
            backgroundColor: theme.colors.muted,
            borderRadius: theme.radius.md,
            gap: theme.spacing[2],
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
          {step.hint}
        </View>
      ) : null}
      <View style={[styles.actions, { gap: theme.spacing[2] }]}>
        <TourAction
          disabled={activeIndex === 0}
          label={labels.previous}
          onPress={() => {
            goTo(activeIndex - 1);
          }}
        />
        <View style={[styles.dots, { gap: theme.spacing[1] }]}>
          {steps.map((item, index) => (
            <Pressable
              accessibilityLabel={labels.goToStep(item, index)}
              accessibilityRole="button"
              accessibilityState={{ selected: index === activeIndex }}
              key={item.id}
              nativeID={`${generatedId}-step-${item.id}`}
              onPress={() => {
                goTo(index);
              }}
              style={styles.button}
            >
              <View
                style={{
                  backgroundColor:
                    index === activeIndex
                      ? theme.colors.primary
                      : theme.colors.mutedForeground,
                  borderRadius: theme.radius.full,
                  height: 8,
                  width: 8,
                }}
              />
            </Pressable>
          ))}
        </View>
        <TourAction
          label={activeIndex === steps.length - 1 ? labels.finish : labels.next}
          onPress={() => {
            if (activeIndex === steps.length - 1) onComplete?.();
            else goTo(activeIndex + 1);
          }}
        />
      </View>
    </View>
  );
}
Tour.displayName = "Tour";

export { Tour };
