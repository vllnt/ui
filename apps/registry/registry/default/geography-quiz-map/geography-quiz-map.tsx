"use client";

import {
  type ComponentPropsWithoutRef,
  createContext,
  type ReactNode,
  use,
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";

import { cn } from "@vllnt/ui";

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 500;
const FEEDBACK_DURATION_MS = 800;

/**
 * Geographic coordinate `[longitude, latitude]`.
 *
 * @public
 */
export type GeoPosition = [number, number];

/**
 * A region polygon — outer ring of `[lng, lat]` positions; close the
 * ring by repeating the first point.
 *
 * @public
 */
export type QuizRegion = {
  /** Outer ring positions. */
  coordinates: GeoPosition[];
  /** Stable identifier — referenced by `QuizQuestion.answerRegionId`. */
  id: string;
  /** Human-readable name (used in the prompt and results panel). */
  name: string;
};

/**
 * Identify-mode question. The user clicks the region matching `answerRegionId`.
 *
 * @public
 */
export type QuizQuestion = {
  /** Region id of the correct answer. */
  answerRegionId: string;
  /** Stable identifier. */
  id: string;
  /** Human-readable prompt rendered above the map. */
  prompt: ReactNode;
};

/**
 * Outcome for a single answered question.
 *
 * @public
 */
export type QuizAnswer = {
  /** `true` when the selected region matches the answer. */
  correct: boolean;
  /** The original question. */
  question: QuizQuestion;
  /** Region id the user clicked. */
  selectedRegionId: string;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type GeographyQuizMapLabels = {
  /** Aria-label for the quiz region. Defaults to `"Geography quiz map"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Geography quiz map",
} as const satisfies Required<GeographyQuizMapLabels>;

type Phase = "complete" | "playing";
type Feedback = "correct" | "incorrect";

type QuizCtx = {
  answers: QuizAnswer[];
  current?: QuizQuestion;
  feedback?: Feedback;
  phase: Phase;
  questionIndex: number;
  totalQuestions: number;
};

const QuizContext = createContext<null | QuizCtx>(null);

function useQuizContext(): QuizCtx {
  const ctx = use(QuizContext);
  if (!ctx) {
    throw new Error("GeographyQuizMap subcomponent used outside its root.");
  }
  return ctx;
}

function projectEquirectangular(position: GeoPosition): {
  x: number;
  y: number;
} {
  const [lng, lat] = position;
  const x = ((lng + 180) / 360) * VIEWBOX_WIDTH;
  const y = ((90 - lat) / 180) * VIEWBOX_HEIGHT;
  return { x, y };
}

function regionPath(region: QuizRegion): string {
  const points = region.coordinates
    .map((coord, index) => {
      const projected = projectEquirectangular(coord);
      return `${index === 0 ? "M" : "L"}${projected.x.toString()},${projected.y.toString()}`;
    })
    .join(" ");
  return `${points} Z`;
}

/**
 * Props for {@link GeographyQuizMap}.
 *
 * @public
 */
export type GeographyQuizMapProps = {
  /** Optional backdrop image URL. */
  backdrop?: string;
  /** Aria-label for the backdrop image. */
  backdropAlt?: string;
  /** Localizable strings. */
  labels?: GeographyQuizMapLabels;
  /** Fires once the user finishes every question. */
  onComplete?: (answers: QuizAnswer[]) => void;
  /** Quiz questions in order. */
  questions: QuizQuestion[];
  /** Region polygons. */
  regions: QuizRegion[];
} & ComponentPropsWithoutRef<"section">;

type RegionPathProps = {
  disabled: boolean;
  feedback?: Feedback;
  isAnswerForCurrent: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  region: QuizRegion;
  showAnswerFlash: boolean;
};

function RegionShape({
  disabled,
  feedback,
  isAnswerForCurrent,
  isSelected,
  onSelect,
  region,
  showAnswerFlash,
}: RegionPathProps): ReactNode {
  let fill = "rgb(226, 232, 240)";
  if (isSelected && feedback === "correct") fill = "rgb(34, 197, 94)";
  else if (isSelected && feedback === "incorrect") fill = "rgb(239, 68, 68)";
  else if (showAnswerFlash && isAnswerForCurrent && !isSelected)
    fill = "rgba(34, 197, 94, 0.4)";
  return (
    <path
      aria-label={region.name}
      className={cn(
        "stroke-background outline-none transition-colors",
        disabled
          ? "cursor-not-allowed"
          : "cursor-pointer hover:opacity-90 focus-visible:opacity-90",
      )}
      d={regionPath(region)}
      data-region-id={region.id}
      data-state={
        isSelected
          ? feedback === "correct"
            ? "correct"
            : "incorrect"
          : showAnswerFlash && isAnswerForCurrent
            ? "answer"
            : undefined
      }
      fill={fill}
      onClick={() => {
        if (!disabled) onSelect(region.id);
      }}
      onKeyDown={(event) => {
        if (disabled) return;
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onSelect(region.id);
      }}
      role="button"
      strokeWidth={1}
      tabIndex={disabled ? -1 : 0}
    />
  );
}

type StageProps = {
  backdrop?: string;
  backdropAlt?: string;
  current?: QuizQuestion;
  disabled: boolean;
  feedback?: Feedback;
  onSelect: (id: string) => void;
  regions: QuizRegion[];
  selectedRegionId?: string;
};

function Stage({
  backdrop,
  backdropAlt,
  current,
  disabled,
  feedback,
  onSelect,
  regions,
  selectedRegionId,
}: StageProps): ReactNode {
  return (
    <svg
      className="block h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      viewBox={`0 0 ${VIEWBOX_WIDTH.toString()} ${VIEWBOX_HEIGHT.toString()}`}
    >
      <rect
        className="fill-muted"
        height={VIEWBOX_HEIGHT}
        width={VIEWBOX_WIDTH}
        x="0"
        y="0"
      />
      {backdrop ? (
        <image
          aria-label={backdropAlt}
          height={VIEWBOX_HEIGHT}
          href={backdrop}
          preserveAspectRatio="xMidYMid slice"
          width={VIEWBOX_WIDTH}
          x="0"
          y="0"
        />
      ) : null}
      {regions.map((region) => (
        <RegionShape
          disabled={disabled}
          feedback={feedback}
          isAnswerForCurrent={current?.answerRegionId === region.id}
          isSelected={selectedRegionId === region.id}
          key={region.id}
          onSelect={onSelect}
          region={region}
          showAnswerFlash={feedback === "incorrect"}
        />
      ))}
    </svg>
  );
}

/**
 * Prompt slot. Renders the current question text on top of the map.
 *
 * @public
 */
export const GeographyQuizMapPrompt = ({
  className,
  ref,
  ...rest
}: ComponentPropsWithoutRef<"div"> & React.RefAttributes<HTMLDivElement>) => {
  const { current, phase } = useQuizContext();
  if (phase !== "playing" || !current) return null;
  return (
    <div
      className={cn(
        "absolute inset-x-3 top-3 z-10 rounded-md border bg-background/95 px-3 py-2 text-center text-sm font-medium text-foreground shadow-sm backdrop-blur",
        className,
      )}
      data-quiz-prompt
      ref={ref}
      {...rest}
    >
      {current.prompt}
    </div>
  );
};
GeographyQuizMapPrompt.displayName = "GeographyQuizMapPrompt";

/**
 * Score slot. Renders `correct / total · streak%`.
 *
 * @public
 */
export const GeographyQuizMapScore = ({
  className,
  ref,
  ...rest
}: ComponentPropsWithoutRef<"div"> & React.RefAttributes<HTMLDivElement>) => {
  const { answers, totalQuestions } = useQuizContext();
  const correct = answers.filter((entry) => entry.correct).length;
  const accuracy =
    answers.length === 0 ? 0 : Math.round((correct / answers.length) * 100);
  return (
    <div
      className={cn(
        "absolute right-3 top-3 z-10 rounded-md border bg-background/95 px-2 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur",
        className,
      )}
      data-quiz-score
      ref={ref}
      {...rest}
    >
      {`${correct.toString()} / ${totalQuestions.toString()} · ${accuracy.toString()}%`}
    </div>
  );
};
GeographyQuizMapScore.displayName = "GeographyQuizMapScore";

/**
 * Results slot. Renders the per-question outcome list once the
 * user finishes every question.
 *
 * @public
 */
export const GeographyQuizMapResults = ({
  className,
  ref,
  ...rest
}: ComponentPropsWithoutRef<"div"> & React.RefAttributes<HTMLDivElement>) => {
  const { answers, phase, totalQuestions } = useQuizContext();
  if (phase !== "complete") return null;
  const correct = answers.filter((entry) => entry.correct).length;
  return (
    <div
      className={cn(
        "absolute inset-3 z-20 flex flex-col gap-3 overflow-auto rounded-md border bg-background/95 p-4 text-sm text-foreground shadow-md backdrop-blur",
        className,
      )}
      data-quiz-results
      ref={ref}
      {...rest}
    >
      <h3 className="text-base font-semibold">
        {`Results · ${correct.toString()} / ${totalQuestions.toString()}`}
      </h3>
      <ol className="space-y-1">
        {answers.map((entry) => (
          <li
            className={cn(
              "flex items-center gap-2 rounded-md border px-2 py-1",
              entry.correct
                ? "border-emerald-300 bg-emerald-500/10"
                : "border-red-300 bg-red-500/10",
            )}
            data-answer-correct={entry.correct ? "true" : "false"}
            data-answer-id={entry.question.id}
            key={entry.question.id}
          >
            <span aria-hidden="true">{entry.correct ? "✓" : "✗"}</span>
            <span className="flex-1">{entry.question.prompt}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};
GeographyQuizMapResults.displayName = "GeographyQuizMapResults";

type QuizState = {
  answers: QuizAnswer[];
  feedback?: Feedback;
  questionIndex: number;
  selectedRegionId?: string;
};

function useQuizState(arguments_: {
  onComplete?: (answers: QuizAnswer[]) => void;
  questions: QuizQuestion[];
}): {
  handleSelect: (regionId: string) => void;
  state: QuizState;
} {
  const { onComplete, questions } = arguments_;
  const [state, setState] = useState<QuizState>({
    answers: [],
    feedback: undefined,
    questionIndex: 0,
    selectedRegionId: undefined,
  });

  const handleSelect = useCallback(
    (regionId: string) => {
      setState((current) => {
        if (current.feedback) return current;
        const question = questions[current.questionIndex];
        if (!question) return current;
        const correct = question.answerRegionId === regionId;
        const next: QuizState = {
          ...current,
          answers: [
            ...current.answers,
            { correct, question, selectedRegionId: regionId },
          ],
          feedback: correct ? "correct" : "incorrect",
          selectedRegionId: regionId,
        };
        scheduleAdvance(setState, onComplete, questions);
        return next;
      });
    },
    [onComplete, questions],
  );

  return { handleSelect, state };
}

function scheduleAdvance(
  setState: React.Dispatch<React.SetStateAction<QuizState>>,
  onComplete: ((answers: QuizAnswer[]) => void) | undefined,
  questions: QuizQuestion[],
): void {
  if (typeof window === "undefined") return;
  window.setTimeout(() => {
    setState((current) => {
      const nextIndex = current.questionIndex + 1;
      if (nextIndex >= questions.length) {
        onComplete?.(current.answers);
        return {
          ...current,
          feedback: undefined,
          questionIndex: questions.length,
          selectedRegionId: undefined,
        };
      }
      return {
        ...current,
        feedback: undefined,
        questionIndex: nextIndex,
        selectedRegionId: undefined,
      };
    });
  }, FEEDBACK_DURATION_MS);
}

/**
 * Interactive map quiz. Identify-mode: each question asks the user to
 * click the region matching the prompt. Correct clicks flash green,
 * incorrect clicks flash red and reveal the correct region. After the
 * final question the {@link GeographyQuizMapResults} slot renders the
 * per-question outcome list and `onComplete` fires.
 *
 * Compose with {@link GeographyQuizMapPrompt}, {@link GeographyQuizMapScore},
 * and {@link GeographyQuizMapResults} as children.
 *
 * @example
 * ```tsx
 * <GeographyQuizMap
 *   regions={countries}
 *   questions={[
 *     { id: "q1", prompt: "Click on France", answerRegionId: "FR" },
 *     { id: "q2", prompt: "Click on Germany", answerRegionId: "DE" },
 *   ]}
 *   onComplete={(answers) => console.info(answers)}
 * >
 *   <GeographyQuizMapPrompt />
 *   <GeographyQuizMapScore />
 *   <GeographyQuizMapResults />
 * </GeographyQuizMap>
 * ```
 *
 * @public
 */
export const GeographyQuizMap = (
  props: GeographyQuizMapProps & React.RefAttributes<HTMLElement>,
) => {
  const {
    backdrop,
    backdropAlt,
    children,
    className,
    labels,
    onComplete,
    questions,
    ref,
    regions,
    ...rest
  } = props;
  const titleId = useId();
  const { handleSelect, state } = useQuizState({ onComplete, questions });

  const phase: Phase =
    state.questionIndex >= questions.length ? "complete" : "playing";
  const current = questions[state.questionIndex];

  const regionLabel = labels?.region ?? DEFAULT_LABELS.region;

  const ctx = useMemo<QuizCtx>(
    () => ({
      answers: state.answers,
      current,
      feedback: state.feedback,
      phase,
      questionIndex: state.questionIndex,
      totalQuestions: questions.length,
    }),
    [
      current,
      phase,
      questions.length,
      state.answers,
      state.feedback,
      state.questionIndex,
    ],
  );

  return (
    <QuizContext.Provider value={ctx}>
      <section
        aria-labelledby={titleId}
        className={cn(
          "relative aspect-[2/1] w-full overflow-hidden rounded-2xl border bg-background text-foreground",
          className,
        )}
        ref={ref}
        {...rest}
      >
        <span className="sr-only" id={titleId}>
          {regionLabel}
        </span>
        <Stage
          backdrop={backdrop}
          backdropAlt={backdropAlt}
          current={current}
          disabled={phase === "complete" || Boolean(state.feedback)}
          feedback={state.feedback}
          onSelect={handleSelect}
          regions={regions}
          selectedRegionId={state.selectedRegionId}
        />
        {children}
      </section>
    </QuizContext.Provider>
  );
};
GeographyQuizMap.displayName = "GeographyQuizMap";
