"use client";

import { type ReactNode, useState } from "react";

import { cn } from "../../lib/utils";

export type QuizOption = {
  correct?: boolean;
  explanation?: string;
  label: string;
};

type QuizOptionButtonProps = {
  index: number;
  onSelect: (index: number) => void;
  option: QuizOption;
  selectedIndex: null | number;
  submitted: boolean;
};

// eslint-disable-next-line max-lines-per-function -- Option button showing selected, correct, incorrect states
function QuizOptionButton({
  index,
  onSelect,
  option,
  selectedIndex,
  submitted,
}: QuizOptionButtonProps): React.ReactNode {
  const isSelected = selectedIndex === index;
  const showResult = submitted && isSelected;
  return (
    <button
      className={cn(
        "w-full text-left p-3 rounded-md border transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary",
        isSelected && !submitted && "border-primary bg-primary/10",
        showResult && option.correct && "border-green-500 bg-green-500/10",
        showResult && !option.correct && "border-red-500 bg-red-500/10",
        submitted &&
          !isSelected &&
          option.correct &&
          "border-green-500/50 bg-green-500/5",
      )}
      disabled={submitted}
      onClick={() => {
        onSelect(index);
      }}
      type="button"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm">{option.label}</span>
        {showResult ? (
          option.correct ? (
            <svg
              className="h-4 w-4 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          )
        ) : null}
        {submitted && !isSelected && option.correct ? (
          <svg
            className="h-4 w-4 text-green-500/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M5 13l4 4L19 7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        ) : null}
      </div>
      {submitted && option.explanation ? (
        <p className="text-xs text-muted-foreground mt-2">
          {option.explanation}
        </p>
      ) : null}
    </button>
  );
}

type QuizHintProps = {
  hint: string;
  onShow: () => void;
  showHint: boolean;
};

function QuizHint({ hint, onShow, showHint }: QuizHintProps): React.ReactNode {
  return (
    <div className="mb-4">
      {showHint ? (
        <p className="text-sm text-muted-foreground italic bg-muted/50 p-2 rounded">
          {hint}
        </p>
      ) : (
        <button
          className="text-sm text-primary hover:underline"
          onClick={onShow}
          type="button"
        >
          Show hint
        </button>
      )}
    </div>
  );
}

type QuizResultProps = {
  explanation: ReactNode;
  isCorrect: boolean;
};

function QuizResult({
  explanation,
  isCorrect,
}: QuizResultProps): React.ReactNode {
  return (
    <div
      className={cn(
        "p-3 rounded-md text-sm mb-4",
        isCorrect
          ? "bg-green-500/10 text-green-700 dark:text-green-300"
          : "bg-muted",
      )}
    >
      <p className="font-medium mb-1">
        {isCorrect ? "Correct!" : "Not quite right."}
      </p>
      <div className="[&>p]:mb-0">{explanation}</div>
    </div>
  );
}

export type QuizProps = {
  className?: string;
  explanation?: ReactNode;
  hint?: string;
  onAnswer?: (correct: boolean) => void;
  options: QuizOption[];
  question: string;
};

// eslint-disable-next-line max-lines-per-function -- Interactive quiz with state management
export function Quiz({
  className,
  explanation,
  hint,
  onAnswer,
  options,
  question,
}: QuizProps): React.ReactNode {
  const [selectedIndex, setSelectedIndex] = useState<null | number>(null);
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleReset = (): void => {
    setSelectedIndex(null);
    setSubmitted(false);
    setShowHint(false);
  };

  const handleSubmit = (): void => {
    setSubmitted(true);
    const isCorrect = selectedIndex !== null && options[selectedIndex]?.correct;
    onAnswer?.(Boolean(isCorrect));
  };

  const isCorrect = selectedIndex !== null && options[selectedIndex]?.correct;

  return (
    <div className={cn("my-6 rounded-lg border bg-card p-6", className)}>
      <div className="flex items-start gap-3 mb-4">
        <svg
          className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
        <h4 className="font-semibold text-foreground">{question}</h4>
      </div>
      <div className="space-y-2 mb-4">
        {options.map((opt, index) => (
          <QuizOptionButton
            index={index}
            key={index}
            onSelect={(index_) => {
              if (!submitted) setSelectedIndex(index_);
            }}
            option={opt}
            selectedIndex={selectedIndex}
            submitted={submitted}
          />
        ))}
      </div>
      {hint && !submitted ? (
        <QuizHint
          hint={hint}
          onShow={() => {
            setShowHint(true);
          }}
          showHint={showHint}
        />
      ) : null}
      {submitted && explanation ? (
        <QuizResult explanation={explanation} isCorrect={Boolean(isCorrect)} />
      ) : null}
      <div className="flex gap-2">
        {submitted ? (
          <button
            className="px-3 py-1.5 text-sm rounded-md border border-border hover:bg-muted transition-colors"
            onClick={handleReset}
            type="button"
          >
            Try Again
          </button>
        ) : (
          <button
            className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            disabled={selectedIndex === null}
            onClick={handleSubmit}
            type="button"
          >
            Check Answer
          </button>
        )}
      </div>
    </div>
  );
}
