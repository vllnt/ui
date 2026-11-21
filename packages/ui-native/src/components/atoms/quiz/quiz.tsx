"use client";

import { type ReactNode, type Ref, useId } from "react";

import { StyleSheet, Text, View, type ViewProps } from "react-native";

import {
  joinAccessibilityText,
  useAnnounceOnChange,
  useRevealFocus,
} from "../../../primitives/accessibility";
import { InteractivePressable } from "../../../primitives/interactive-pressable";
import { typeStyle } from "../../../primitives/type-style";
import {
  controllableOptions,
  useControllableState,
} from "../../../primitives/use-controllable-state";
import { useTheme } from "../../../theme/theme-provider";

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
  },
  option: { borderWidth: 1, justifyContent: "center" },
  root: { borderWidth: 1 },
});

type QuizOptionRowProps = {
  readonly index: number;
  readonly labels: QuizLabels;
  readonly nativeID: string;
  readonly onSelect: (id: string) => void;
  readonly option: QuizOption;
  readonly selected: boolean;
  readonly submitted: boolean;
};

function QuizOptionRow({
  index,
  labels,
  nativeID,
  onSelect,
  option,
  selected,
  submitted,
}: QuizOptionRowProps) {
  const theme = useTheme();
  const correctAnswer = submitted && option.correct === true;
  const incorrectSelection = submitted && selected && !option.correct;
  let borderColor = theme.colors.border;
  if (incorrectSelection) borderColor = theme.colors.destructive;
  else if (correctAnswer || selected) borderColor = theme.colors.primary;
  let outcome: undefined | { readonly text: string };
  if (correctAnswer) outcome = { text: labels.correct };
  else if (incorrectSelection) outcome = { text: labels.incorrect };
  return (
    <InteractivePressable
      accessibilityHint={submitted ? option.explanation : labels.options}
      accessibilityLabel={labels.option(option, index)}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled: submitted }}
      accessibilityValue={outcome}
      nativeID={nativeID}
      onPress={() => {
        if (!submitted) onSelect(option.id);
      }}
      selected={selected}
      style={[
        styles.option,
        {
          backgroundColor: selected
            ? theme.colors.accent
            : theme.colors.background,
          borderColor,
          borderRadius: theme.radius.md,
          padding: theme.spacing[3],
        },
      ]}
    >
      <Text
        style={typeStyle(
          theme,
          "bodySmall",
          incorrectSelection ? "destructive" : "foreground",
        )}
      >
        {option.label}
      </Text>
      {submitted && option.explanation ? (
        <Text
          style={typeStyle(theme, "caption", {
            color: "mutedForeground",
            marginTop: theme.spacing[2],
          })}
        >
          {option.explanation}
        </Text>
      ) : null}
    </InteractivePressable>
  );
}
QuizOptionRow.displayName = "QuizOptionRow";

type QuizHintProps = {
  readonly hint: string | undefined;
  readonly labels: QuizLabels;
  readonly onReveal: () => void;
  readonly submitted: boolean;
  readonly target: Ref<View>;
  readonly visible: boolean;
};

function QuizHint({
  hint,
  labels,
  onReveal,
  submitted,
  target,
  visible,
}: QuizHintProps) {
  const theme = useTheme();
  if (!hint || submitted) return null;
  if (!visible) {
    return (
      <InteractivePressable
        accessibilityRole="button"
        onPress={onReveal}
        style={styles.action}
      >
        <Text style={typeStyle(theme, "bodySmall", "foreground")}>
          {labels.hint}
        </Text>
      </InteractivePressable>
    );
  }
  return (
    <View
      accessibilityLabel={joinAccessibilityText([labels.hint, hint], ": ")}
      accessible
      ref={target}
      style={{
        backgroundColor: theme.colors.muted,
        borderRadius: theme.radius.md,
        padding: theme.spacing[3],
      }}
    >
      <Text style={typeStyle(theme, "caption", "mutedForeground")}>
        {labels.hint}
      </Text>
      <Text style={typeStyle(theme, "bodySmall", "foreground")}>{hint}</Text>
    </View>
  );
}
QuizHint.displayName = "QuizHint";

function QuizResult({
  explanation,
  isCorrect,
  result,
}: {
  readonly explanation: ReactNode;
  readonly isCorrect: boolean;
  readonly result: string;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        backgroundColor: isCorrect ? theme.colors.accent : theme.colors.muted,
        borderRadius: theme.radius.md,
        gap: theme.spacing[2],
        padding: theme.spacing[3],
      }}
    >
      <Text
        accessibilityLiveRegion="polite"
        style={typeStyle(theme, "bodySmall", {
          color: isCorrect ? "foreground" : "destructive",
          fontWeight: theme.typography.fontWeight.heading,
        })}
      >
        {result}
      </Text>
      {typeof explanation === "string" || typeof explanation === "number" ? (
        <Text style={typeStyle(theme, "bodySmall", "foreground")}>
          {explanation}
        </Text>
      ) : (
        explanation
      )}
    </View>
  );
}
QuizResult.displayName = "QuizResult";

/**
 * Accessible native quiz with explicit controlled and uncontrolled state.
 * After submission each option speaks whether it is correct (not only its
 * colour) and its explanation; the result is announced on both platforms;
 * revealing the hint moves screen-reader focus to it.
 */
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
    controllableOptions(selectedId, defaultSelectedId, onSelectedIdChange),
  );
  const [isSubmitted, setSubmitted] = useControllableState(
    controllableOptions(submitted, defaultSubmitted, onSubmittedChange),
  );
  const [isHintVisible, setHintVisible] = useControllableState(
    controllableOptions(hintVisible, defaultHintVisible, onHintVisibleChange),
  );
  const selectedOption = options.find((option) => option.id === activeId);
  const isCorrect = selectedOption?.correct === true;
  const result = isCorrect ? labels.correct : labels.incorrect;
  useAnnounceOnChange(isSubmitted ? result : undefined, { liveRegion: true });
  const hintFocus = useRevealFocus<View>(isHintVisible);
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
        style={typeStyle(theme, "bodyLarge", {
          color: "foreground",
          fontWeight: theme.typography.fontWeight.heading,
        })}
      >
        {question}
      </Text>
      <View accessibilityRole="radiogroup" style={{ gap: theme.spacing[2] }}>
        {options.map((option, index) => (
          <QuizOptionRow
            index={index}
            key={option.id}
            labels={labels}
            nativeID={`${generatedId}-option-${option.id}`}
            onSelect={setActiveId}
            option={option}
            selected={option.id === activeId}
            submitted={isSubmitted}
          />
        ))}
      </View>
      <QuizHint
        hint={hint}
        labels={labels}
        onReveal={() => {
          hintFocus.request();
          setHintVisible(true);
        }}
        submitted={isSubmitted}
        target={hintFocus.target}
        visible={isHintVisible}
      />
      {isSubmitted ? (
        <QuizResult
          explanation={explanation}
          isCorrect={isCorrect}
          result={result}
        />
      ) : null}
      <InteractivePressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !isSubmitted && !selectedOption }}
        disabled={!isSubmitted && !selectedOption}
        filled
        onPress={() => {
          if (isSubmitted) reset();
          else {
            setSubmitted(true);
            onAnswer?.(isCorrect, selectedOption);
          }
        }}
        style={[
          styles.action,
          {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing[4],
          },
        ]}
      >
        <Text style={typeStyle(theme, "bodySmall", "primaryForeground")}>
          {isSubmitted ? labels.tryAgain : labels.checkAnswer}
        </Text>
      </InteractivePressable>
    </View>
  );
}
Quiz.displayName = "Quiz";

export { Quiz };
