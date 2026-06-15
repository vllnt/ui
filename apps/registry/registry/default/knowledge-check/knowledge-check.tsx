"use client";

import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";

import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";

import { cn } from "@vllnt/ui";
import { Button } from "@vllnt/ui";
import { Input } from "@vllnt/ui";

/**
 * Question kind for {@link KnowledgeCheckQuestion}.
 *
 * @public
 */
export type KnowledgeCheckQuestionType =
  | "fill-blank"
  | "multiple-choice"
  | "true-false";

/**
 * Localizable strings.
 *
 * @public
 */
export type KnowledgeCheckLabels = {
  /** Caption for the previous-question button. Defaults to `"Back"`. */
  back?: string;
  /** Caption for the check-answer button. Defaults to `"Check"`. */
  check?: string;
  /** Caption for the correct-answer feedback. Defaults to `"Correct"`. */
  correct?: string;
  /** Caption for the false option. Defaults to `"False"`. */
  falseOption?: string;
  /** Caption for the incorrect-answer feedback. Defaults to `"Try again"`. */
  incorrect?: string;
  /** Caption for the next-question button. Defaults to `"Next"`. */
  next?: string;
  /** Caption for the summary "out of" connector. Defaults to `"of"`. */
  outOf?: string;
  /** Caption for the retry button. Defaults to `"Retry"`. */
  retry?: string;
  /** Heading above the score summary. Defaults to `"You scored"`. */
  scored?: string;
  /** Caption for the true option. Defaults to `"True"`. */
  trueOption?: string;
};

const DEFAULT_LABELS = {
  back: "Back",
  check: "Check",
  correct: "Correct",
  falseOption: "False",
  incorrect: "Try again",
  next: "Next",
  outOf: "of",
  retry: "Retry",
  scored: "You scored",
  trueOption: "True",
} as const satisfies Required<KnowledgeCheckLabels>;

/**
 * Choice option entry passed to a choice question.
 *
 * @public
 */
export type KnowledgeCheckOption = {
  /** When true, this option is the correct answer. */
  correct?: boolean;
  /** Display label. */
  label: ReactNode;
  /** Stable identifier within the question. */
  value: string;
};

type FillBlankQuestion = {
  /** Expected answer string. */
  answer: string;
  /** When true, comparison is case-sensitive. Defaults to `false`. */
  caseSensitive?: boolean;
  /** Optional explanation shown after the user submits. */
  explanation?: ReactNode;
  /** Stable identifier. */
  id: string;
  /** Question prompt. */
  question: ReactNode;
  type: "fill-blank";
};

type MultipleChoiceQuestion = {
  /** Optional explanation shown after the user submits. */
  explanation?: ReactNode;
  /** Stable identifier. */
  id: string;
  /** Option list. Mark the correct option(s) with `correct: true`. */
  options: KnowledgeCheckOption[];
  /** Question prompt. */
  question: ReactNode;
  type: "multiple-choice";
};

type TrueFalseQuestion = {
  /** Expected boolean answer. */
  answer: boolean;
  /** Optional explanation shown after the user submits. */
  explanation?: ReactNode;
  /** Stable identifier. */
  id: string;
  /** Question prompt. */
  question: ReactNode;
  type: "true-false";
};

/**
 * Question entry passed to {@link KnowledgeCheckProps.questions}.
 *
 * @public
 */
export type KnowledgeCheckQuestion =
  | FillBlankQuestion
  | MultipleChoiceQuestion
  | TrueFalseQuestion;

/**
 * Per-question result reported to the consumer.
 *
 * @public
 */
export type KnowledgeCheckAnswer = {
  /** True when the user's response matched the expected answer. */
  correct: boolean;
  /** Question id. */
  questionId: string;
  /** The user's raw response (string for `fill-blank`, option value for choice, boolean for `true-false`). */
  response: boolean | string;
};

/**
 * Score payload reported on completion.
 *
 * @public
 */
export type KnowledgeCheckScore = {
  /** Map of question id → answer. */
  answers: Record<string, KnowledgeCheckAnswer>;
  /** Right-answer count. */
  correct: number;
  /** Total number of questions. */
  total: number;
};

function compareFillBlank(
  question: FillBlankQuestion,
  response: string,
): boolean {
  const normalize = (value: string): string =>
    question.caseSensitive ? value.trim() : value.trim().toLowerCase();
  return normalize(response) === normalize(question.answer);
}

function isMultipleChoiceCorrect(
  question: MultipleChoiceQuestion,
  value: string,
): boolean {
  return question.options.some(
    (option) => option.value === value && option.correct === true,
  );
}

function evaluateAnswer(
  question: KnowledgeCheckQuestion,
  response: boolean | string,
): boolean {
  switch (question.type) {
    case "fill-blank":
      return (
        typeof response === "string" && compareFillBlank(question, response)
      );
    case "multiple-choice":
      return (
        typeof response === "string" &&
        isMultipleChoiceCorrect(question, response)
      );
    case "true-false":
      return typeof response === "boolean" && response === question.answer;
  }
}

type ResponseMap = Record<string, boolean | string>;
type AnswerMap = Record<string, KnowledgeCheckAnswer>;

type ControllerState = {
  answers: AnswerMap;
  current: KnowledgeCheckQuestion;
  handleNext: () => void;
  handlePrevious: () => void;
  handleReset: () => void;
  handleSubmit: () => void;
  index: number;
  isComplete: boolean;
  isFirst: boolean;
  isLast: boolean;
  responses: ResponseMap;
  score?: KnowledgeCheckScore;
  setResponse: (questionId: string, value: boolean | string) => void;
};

type ControllerOptions = {
  onAnswer?: (answer: KnowledgeCheckAnswer) => void;
  onComplete?: (score: KnowledgeCheckScore) => void;
  questions: KnowledgeCheckQuestion[];
};

function useKnowledgeCheckController(
  options: ControllerOptions,
): ControllerState {
  const { onAnswer, onComplete, questions } = options;
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<ResponseMap>({});
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [completed, setCompleted] = useState(false);

  const setResponse = useCallback(
    (questionId: string, value: boolean | string) => {
      setResponses((current) => ({ ...current, [questionId]: value }));
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    const question = questions[index];
    if (!question) return;
    const response = responses[question.id];
    if (response === undefined) return;
    const answer: KnowledgeCheckAnswer = {
      correct: evaluateAnswer(question, response),
      questionId: question.id,
      response,
    };
    setAnswers((current) => ({ ...current, [question.id]: answer }));
    onAnswer?.(answer);
  }, [index, onAnswer, questions, responses]);

  const handleNext = useCallback(() => {
    if (index >= questions.length - 1) {
      const finalScore = computeScore(questions, answers);
      setCompleted(true);
      onComplete?.(finalScore);
      return;
    }
    setIndex((value) => value + 1);
  }, [answers, index, onComplete, questions]);

  const handlePrevious = useCallback(() => {
    setIndex((value) => Math.max(0, value - 1));
  }, []);

  const handleReset = useCallback(() => {
    setIndex(0);
    setResponses({});
    setAnswers({});
    setCompleted(false);
  }, []);

  const score: KnowledgeCheckScore | undefined = useMemo(
    () => (completed ? computeScore(questions, answers) : undefined),
    [answers, completed, questions],
  );

  const current = questions[index] ?? questions[0];
  if (!current) {
    throw new Error("KnowledgeCheck requires at least one question");
  }
  return {
    answers,
    current,
    handleNext,
    handlePrevious,
    handleReset,
    handleSubmit,
    index,
    isComplete: completed,
    isFirst: index === 0,
    isLast: index === questions.length - 1,
    responses,
    score,
    setResponse,
  };
}

function computeScore(
  questions: KnowledgeCheckQuestion[],
  answers: AnswerMap,
): KnowledgeCheckScore {
  const correct = Object.values(answers).filter(
    (entry) => entry.correct,
  ).length;
  return { answers, correct, total: questions.length };
}

/**
 * Props for {@link KnowledgeCheck}.
 *
 * @public
 */
export type KnowledgeCheckProps = {
  /** Localizable strings. */
  labels?: KnowledgeCheckLabels;
  /** Fires after the user submits an answer. */
  onAnswer?: (answer: KnowledgeCheckAnswer) => void;
  /** Fires when the user finishes the last question. */
  onComplete?: (score: KnowledgeCheckScore) => void;
  /** Question list. Must contain at least one entry. */
  questions: KnowledgeCheckQuestion[];
  /** Optional title shown above the questions. */
  title?: ReactNode;
} & ComponentPropsWithoutRef<"section">;

type FeedbackProps = {
  answer?: KnowledgeCheckAnswer;
  correctLabel: string;
  explanation?: ReactNode;
  incorrectLabel: string;
};

function Feedback({
  answer,
  correctLabel,
  explanation,
  incorrectLabel,
}: FeedbackProps): ReactNode {
  if (!answer) return null;
  return (
    <div
      aria-live="polite"
      className={cn(
        "flex items-start gap-2 rounded-md border p-3 text-sm",
        answer.correct
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
          : "border-destructive/40 bg-destructive/10 text-destructive",
      )}
      role="status"
    >
      {answer.correct ? (
        <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      ) : (
        <XCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      )}
      <div className="flex flex-col gap-1">
        <span className="font-medium">
          {answer.correct ? correctLabel : incorrectLabel}
        </span>
        {explanation ? (
          <span className="text-xs opacity-80">{explanation}</span>
        ) : null}
      </div>
    </div>
  );
}

type MultipleChoiceFieldProps = {
  groupName: string;
  labelId: string;
  onChange: (value: string) => void;
  options: KnowledgeCheckOption[];
  value?: string;
};

type MultipleChoiceOptionProps = {
  groupName: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  option: KnowledgeCheckOption;
  value?: string;
};

function MultipleChoiceOption({
  groupName,
  onChange,
  option,
  value,
}: MultipleChoiceOptionProps): ReactNode {
  const id = `${groupName}-${option.value}`;
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-accent">
      <input
        checked={value === option.value}
        className="size-4"
        id={id}
        name={groupName}
        onChange={onChange}
        type="radio"
        value={option.value}
      />
      <label className="flex-1 cursor-pointer" htmlFor={id}>
        {option.label}
      </label>
    </div>
  );
}

function MultipleChoiceField({
  groupName,
  labelId,
  onChange,
  options,
  value,
}: MultipleChoiceFieldProps): ReactNode {
  const handleSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange],
  );
  return (
    <div
      aria-labelledby={labelId}
      className="flex flex-col gap-1.5"
      role="radiogroup"
    >
      {options.map((option) => (
        <MultipleChoiceOption
          groupName={groupName}
          key={option.value}
          onChange={handleSelect}
          option={option}
          value={value}
        />
      ))}
    </div>
  );
}

type TrueFalseFieldProps = {
  falseLabel: string;
  labelId: string;
  onChange: (value: boolean) => void;
  trueLabel: string;
  value?: boolean;
};

function TrueFalseField({
  falseLabel,
  labelId,
  onChange,
  trueLabel,
  value,
}: TrueFalseFieldProps): ReactNode {
  const handleSelectTrue = useCallback(() => {
    onChange(true);
  }, [onChange]);
  const handleSelectFalse = useCallback(() => {
    onChange(false);
  }, [onChange]);
  return (
    <div
      aria-labelledby={labelId}
      className="flex flex-wrap gap-2"
      role="group"
    >
      <Button
        aria-pressed={value === true}
        onClick={handleSelectTrue}
        size="sm"
        type="button"
        variant={value === true ? "default" : "outline"}
      >
        {trueLabel}
      </Button>
      <Button
        aria-pressed={value === false}
        onClick={handleSelectFalse}
        size="sm"
        type="button"
        variant={value === false ? "default" : "outline"}
      >
        {falseLabel}
      </Button>
    </div>
  );
}

type FillBlankFieldProps = {
  inputId: string;
  labelId: string;
  onChange: (value: string) => void;
  value: string;
};

function FillBlankField({
  inputId,
  labelId,
  onChange,
  value,
}: FillBlankFieldProps): ReactNode {
  const handleBlankValueChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange],
  );
  return (
    <Input
      aria-labelledby={labelId}
      id={inputId}
      onChange={handleBlankValueChange}
      value={value}
    />
  );
}

type QuestionFieldProps = {
  groupName: string;
  inputId: string;
  labels: Required<KnowledgeCheckLabels>;
  onResponse: (value: boolean | string) => void;
  question: KnowledgeCheckQuestion;
  questionTextId: string;
  response?: boolean | string;
};

function QuestionField({
  groupName,
  inputId,
  labels,
  onResponse,
  question,
  questionTextId,
  response,
}: QuestionFieldProps): ReactNode {
  switch (question.type) {
    case "fill-blank":
      return (
        <FillBlankField
          inputId={inputId}
          labelId={questionTextId}
          onChange={onResponse}
          value={typeof response === "string" ? response : ""}
        />
      );
    case "multiple-choice":
      return (
        <MultipleChoiceField
          groupName={groupName}
          labelId={questionTextId}
          onChange={onResponse}
          options={question.options}
          value={typeof response === "string" ? response : undefined}
        />
      );
    case "true-false":
      return (
        <TrueFalseField
          falseLabel={labels.falseOption}
          labelId={questionTextId}
          onChange={onResponse}
          trueLabel={labels.trueOption}
          value={typeof response === "boolean" ? response : undefined}
        />
      );
  }
}

type ScoreSummaryProps = {
  labels: Required<KnowledgeCheckLabels>;
  onRetry: () => void;
  score: KnowledgeCheckScore;
};

function ScoreSummary({
  labels,
  onRetry,
  score,
}: ScoreSummaryProps): ReactNode {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-muted/20 p-6 text-center">
      <p className="text-sm text-muted-foreground">{labels.scored}</p>
      <p className="text-3xl font-bold tracking-tight text-foreground">
        {score.correct} {labels.outOf} {score.total}
      </p>
      <Button onClick={onRetry} size="sm" type="button" variant="outline">
        <RotateCcw aria-hidden="true" className="mr-2 size-4" />
        {labels.retry}
      </Button>
    </div>
  );
}

type QuestionPaneProps = {
  controller: ControllerState;
  groupName: string;
  inputId: string;
  labels: Required<KnowledgeCheckLabels>;
  questions: KnowledgeCheckQuestion[];
  questionTextId: string;
};

function QuestionPane({
  controller,
  groupName,
  inputId,
  labels,
  questions,
  questionTextId,
}: QuestionPaneProps): ReactNode {
  const question = controller.current;
  const response = controller.responses[question.id];
  const answer = controller.answers[question.id];
  const handleResponse = useCallback(
    (value: boolean | string) => {
      controller.setResponse(question.id, value);
    },
    [controller, question.id],
  );
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {`${(controller.index + 1).toString()} ${labels.outOf} ${questions.length.toString()}`}
      </p>
      <p className="text-sm font-medium text-foreground" id={questionTextId}>
        {question.question}
      </p>
      <QuestionField
        groupName={groupName}
        inputId={inputId}
        labels={labels}
        onResponse={handleResponse}
        question={question}
        questionTextId={questionTextId}
        response={response}
      />
      <Feedback
        answer={answer}
        correctLabel={labels.correct}
        explanation={question.explanation}
        incorrectLabel={labels.incorrect}
      />
      <PaneActions
        answered={answer !== undefined}
        controller={controller}
        labels={labels}
        responseSet={response !== undefined}
      />
    </div>
  );
}

type PaneActionsProps = {
  answered: boolean;
  controller: ControllerState;
  labels: Required<KnowledgeCheckLabels>;
  responseSet: boolean;
};

function PaneActions({
  answered,
  controller,
  labels,
  responseSet,
}: PaneActionsProps): ReactNode {
  return (
    <div className="flex items-center justify-between gap-2 pt-1">
      <Button
        disabled={controller.isFirst}
        onClick={controller.handlePrevious}
        size="sm"
        type="button"
        variant="ghost"
      >
        {labels.back}
      </Button>
      <div className="flex items-center gap-2">
        {answered ? (
          <Button onClick={controller.handleNext} size="sm" type="button">
            {controller.isLast ? labels.scored : labels.next}
          </Button>
        ) : (
          <Button
            disabled={!responseSet}
            onClick={controller.handleSubmit}
            size="sm"
            type="button"
          >
            {labels.check}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Inline knowledge check for embedding within content. Supports three
 * question types (choice, true-false, fill-blank) with per-question
 * feedback (correct / incorrect + optional `explanation`) and a final
 * score summary with retry. Composes {@link Input} and {@link Button}.
 *
 * Question state lives inside the component. Drive analytics or
 * persistence from the `onAnswer` and `onComplete` callbacks.
 *
 * @example
 * ```tsx
 * <KnowledgeCheck
 *   title="Check your understanding"
 *   questions={[
 *     {
 *       id: "react-framework",
 *       type: "true-false",
 *       question: "React is a framework.",
 *       answer: false,
 *     },
 *     {
 *       id: "state-hook",
 *       type: "fill-blank",
 *       question: "The hook for state is ___",
 *       answer: "useState",
 *     },
 *   ]}
 *   onComplete={(score) => track("kc:complete", score)}
 * />
 * ```
 *
 * @public
 */
export const KnowledgeCheck = forwardRef<HTMLElement, KnowledgeCheckProps>(
  (props, ref) => {
    const {
      className,
      labels,
      onAnswer,
      onComplete,
      questions,
      title,
      ...rest
    } = props;
    const resolvedLabels = useMemo(
      () => ({ ...DEFAULT_LABELS, ...labels }),
      [labels],
    );
    const groupName = useId();
    const inputId = useId();
    const questionTextId = useId();
    const controller = useKnowledgeCheckController({
      onAnswer,
      onComplete,
      questions,
    });

    return (
      <section
        className={cn(
          "flex flex-col gap-4 rounded-2xl border bg-background p-4",
          className,
        )}
        ref={ref}
        {...rest}
      >
        {title ? (
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {title}
          </h3>
        ) : null}
        {controller.isComplete && controller.score ? (
          <ScoreSummary
            labels={resolvedLabels}
            onRetry={controller.handleReset}
            score={controller.score}
          />
        ) : (
          <QuestionPane
            controller={controller}
            groupName={groupName}
            inputId={inputId}
            labels={resolvedLabels}
            questions={questions}
            questionTextId={questionTextId}
          />
        )}
      </section>
    );
  },
);
KnowledgeCheck.displayName = "KnowledgeCheck";
