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

/** One answer choice for a native quiz. */
export type QuizOption = {
  readonly correct?: boolean;
  readonly explanation?: string;
  readonly id: string;
  readonly label: string;
};

/** Caller-localized quiz controls and result announcements. */
export type QuizLabels = {
  readonly checkAnswer: string;
  readonly correct: string;
  readonly hint: string;
  readonly incorrect: string;
  readonly option: (option: QuizOption, index: number) => string;
  readonly options: string;
  readonly tryAgain: string;
};

/** Props for a controlled or uncontrolled native quiz. */
export type QuizProps = Omit<ViewProps, "children"> & {
  readonly defaultHintVisible?: boolean;
  readonly defaultSelectedId?: string;
  readonly defaultSubmitted?: boolean;
  readonly explanation?: ReactNode;
  readonly hint?: string;
  readonly hintVisible?: boolean;
  readonly labels: QuizLabels;
  readonly onAnswer?: (correct: boolean, option?: QuizOption) => void;
  readonly onHintVisibleChange?: (visible: boolean) => void;
  readonly onSelectedIdChange?: (id: string) => void;
  readonly onSubmittedChange?: (submitted: boolean) => void;
  readonly options: readonly QuizOption[];
  readonly question: string;
  readonly ref?: Ref<View>;
  readonly selectedId?: string;
  readonly submitted?: boolean;
};

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  option: { borderWidth: 1, justifyContent: "center", minHeight: 44 },
  root: { borderWidth: 1 },
});

/** Accessible native quiz with explicit controlled and uncontrolled state. */
function Quiz({
  defaultHintVisible = false,
  defaultSelectedId = "",
  defaultSubmitted = false,
  explanation,
  hint,
  hintVisible,
  labels,
  onAnswer,
  onHintVisibleChange,
  onSelectedIdChange,
  onSubmittedChange,
  options,
  question,
  ref,
  selectedId,
  style,
  submitted,
  ...props
}: QuizProps) {
  const theme = useTheme();
  const generatedId = useId();
  const [activeId, setActiveId] = useControllableState(
    selectedId === undefined
      ? {
          defaultValue: defaultSelectedId,
          mode: "uncontrolled",
          onChange: onSelectedIdChange,
        }
      : { mode: "controlled", onChange: onSelectedIdChange, value: selectedId },
  );
  const [isSubmitted, setSubmitted] = useControllableState(
    submitted === undefined
      ? {
          defaultValue: defaultSubmitted,
          mode: "uncontrolled",
          onChange: onSubmittedChange,
        }
      : { mode: "controlled", onChange: onSubmittedChange, value: submitted },
  );
  const [isHintVisible, setHintVisible] = useControllableState(
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
  const selectedOption = options.find((option) => option.id === activeId);
  const isCorrect = selectedOption?.correct === true;
  const reset = () => {
    setActiveId("");
    setSubmitted(false);
    setHintVisible(false);
  };

  return (
    <View
      {...props}
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
      <Text
        accessibilityRole="header"
        nativeID={`${generatedId}-question`}
        style={[
          theme.typography.scale.bodyLarge,
          {
            color: theme.colors.foreground,
            fontWeight: theme.typography.fontWeight.heading,
          },
        ]}
      >
        {question}
      </Text>
      <View
        accessibilityLabel={labels.options}
        accessibilityRole="radiogroup"
        aria-labelledby={`${generatedId}-question`}
        style={{ gap: theme.spacing[2] }}
      >
        {options.map((option, index) => {
          const selected = option.id === activeId;
          const correctAnswer = isSubmitted && option.correct === true;
          const incorrectSelection = isSubmitted && selected && !option.correct;
          return (
            <Pressable
              accessibilityLabel={labels.option(option, index)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled: isSubmitted }}
              disabled={isSubmitted}
              key={option.id}
              nativeID={`${generatedId}-option-${option.id}`}
              onPress={() => {
                setActiveId(option.id);
              }}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: selected
                    ? theme.colors.accent
                    : theme.colors.background,
                  borderColor: incorrectSelection
                    ? theme.colors.destructive
                    : correctAnswer || selected
                      ? theme.colors.primary
                      : theme.colors.border,
                  borderRadius: theme.radius.md,
                  opacity: pressed ? 0.8 : 1,
                  padding: theme.spacing[3],
                },
              ]}
            >
              <Text
                style={[
                  theme.typography.scale.bodySmall,
                  {
                    color: incorrectSelection
                      ? theme.colors.destructive
                      : theme.colors.foreground,
                  },
                ]}
              >
                {option.label}
              </Text>
              {isSubmitted && option.explanation ? (
                <Text
                  style={[
                    theme.typography.scale.caption,
                    {
                      color: theme.colors.mutedForeground,
                      marginTop: theme.spacing[2],
                    },
                  ]}
                >
                  {option.explanation}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      {hint && !isSubmitted ? (
        isHintVisible ? (
          <View
            accessibilityLiveRegion="polite"
            style={{
              backgroundColor: theme.colors.muted,
              borderRadius: theme.radius.md,
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
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setHintVisible(true);
            }}
            style={styles.action}
          >
            <Text
              style={[
                theme.typography.scale.bodySmall,
                { color: theme.colors.foreground },
              ]}
            >
              {labels.hint}
            </Text>
          </Pressable>
        )
      ) : null}
      {isSubmitted ? (
        <View
          accessibilityLabel={isCorrect ? labels.correct : labels.incorrect}
          accessibilityLiveRegion="polite"
          accessible
          style={{
            backgroundColor: isCorrect
              ? theme.colors.accent
              : theme.colors.muted,
            borderRadius: theme.radius.md,
            gap: theme.spacing[2],
            padding: theme.spacing[3],
          }}
        >
          <Text
            style={[
              theme.typography.scale.bodySmall,
              {
                color: isCorrect
                  ? theme.colors.foreground
                  : theme.colors.destructive,
                fontWeight: theme.typography.fontWeight.heading,
              },
            ]}
          >
            {isCorrect ? labels.correct : labels.incorrect}
          </Text>
          {typeof explanation === "string" ||
          typeof explanation === "number" ? (
            <Text
              style={[
                theme.typography.scale.bodySmall,
                { color: theme.colors.foreground },
              ]}
            >
              {explanation}
            </Text>
          ) : (
            explanation
          )}
        </View>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !isSubmitted && !selectedOption }}
        disabled={!isSubmitted && !selectedOption}
        onPress={() => {
          if (isSubmitted) reset();
          else {
            setSubmitted(true);
            onAnswer?.(isCorrect, selectedOption);
          }
        }}
        style={({ pressed }) => [
          styles.action,
          {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.md,
            opacity: !isSubmitted && !selectedOption ? 0.5 : pressed ? 0.8 : 1,
            paddingHorizontal: theme.spacing[4],
          },
        ]}
      >
        <Text
          style={[
            theme.typography.scale.bodySmall,
            { color: theme.colors.primaryForeground },
          ]}
        >
          {isSubmitted ? labels.tryAgain : labels.checkAnswer}
        </Text>
      </Pressable>
    </View>
  );
}
Quiz.displayName = "Quiz";

export { Quiz };
