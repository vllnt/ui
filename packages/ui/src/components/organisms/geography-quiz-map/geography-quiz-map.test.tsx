import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  GeographyQuizMap,
  GeographyQuizMapPrompt,
  GeographyQuizMapResults,
  GeographyQuizMapScore,
  type QuizQuestion,
  type QuizRegion,
} from "./geography-quiz-map";

function box([west, north, east, south]: [
  number,
  number,
  number,
  number,
]): QuizRegion["coordinates"] {
  return [
    [west, north],
    [east, north],
    [east, south],
    [west, south],
    [west, north],
  ];
}

const REGIONS: QuizRegion[] = [
  { coordinates: box([-5, 51, 10, 41]), id: "FR", name: "France" },
  { coordinates: box([5, 55, 15, 47]), id: "DE", name: "Germany" },
  { coordinates: box([-9, 44, 3, 36]), id: "ES", name: "Spain" },
];

const QUESTIONS: QuizQuestion[] = [
  { answerRegionId: "FR", id: "q1", prompt: "Click on France" },
  { answerRegionId: "DE", id: "q2", prompt: "Click on Germany" },
];

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function flushAdvance(): void {
  act(() => {
    vi.advanceTimersByTime(1000);
  });
}

function clickRegion(container: HTMLElement, id: string): void {
  const node = container.querySelector(`[data-region-id='${id}']`);
  expect(node).not.toBeNull();
  if (node) fireEvent.click(node);
}

describe("GeographyQuizMap", () => {
  it("renders regions, prompt, and score; a correct click scores, ignores extra clicks, and advances", () => {
    const { container } = render(
      <GeographyQuizMap questions={QUESTIONS} regions={REGIONS}>
        <GeographyQuizMapPrompt />
        <GeographyQuizMapScore />
      </GeographyQuizMap>,
    );
    expect(
      container.querySelector("[data-region-id='ES']"),
    ).toBeInTheDocument();
    expect(screen.getByText("Click on France")).toBeInTheDocument();
    expect(screen.getByText("0 / 2 · 0%")).toBeInTheDocument();
    clickRegion(container, "FR");
    expect(container.querySelector("[data-region-id='FR']")).toHaveAttribute(
      "data-state",
      "correct",
    );
    clickRegion(container, "DE");
    flushAdvance();
    expect(screen.getByText("1 / 2 · 100%")).toBeInTheDocument();
    expect(screen.getByText("Click on Germany")).toBeInTheDocument();
  });

  it("marks the answer incorrect and reveals the correct region", () => {
    const { container } = render(
      <GeographyQuizMap questions={QUESTIONS} regions={REGIONS} />,
    );
    clickRegion(container, "ES");
    expect(container.querySelector("[data-region-id='ES']")).toHaveAttribute(
      "data-state",
      "incorrect",
    );
    expect(container.querySelector("[data-region-id='FR']")).toHaveAttribute(
      "data-state",
      "answer",
    );
  });

  it("fires onComplete with the per-question outcome after the last answer", () => {
    const onComplete = vi.fn();
    const { container } = render(
      <GeographyQuizMap
        onComplete={onComplete}
        questions={QUESTIONS}
        regions={REGIONS}
      />,
    );
    clickRegion(container, "FR");
    flushAdvance();
    clickRegion(container, "DE");
    flushAdvance();
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ correct: true, selectedRegionId: "FR" }),
        expect.objectContaining({ correct: true, selectedRegionId: "DE" }),
      ]),
    );
  });

  it("renders the results panel after completion", () => {
    const { container } = render(
      <GeographyQuizMap questions={QUESTIONS} regions={REGIONS}>
        <GeographyQuizMapResults />
      </GeographyQuizMap>,
    );
    clickRegion(container, "FR");
    flushAdvance();
    clickRegion(container, "ES");
    flushAdvance();
    expect(container.querySelector("[data-quiz-results]")).toBeInTheDocument();
    expect(container.querySelector("[data-answer-id='q1']")).toHaveAttribute(
      "data-answer-correct",
      "true",
    );
    expect(container.querySelector("[data-answer-id='q2']")).toHaveAttribute(
      "data-answer-correct",
      "false",
    );
  });
});

describe("GeographyQuizMap feedback timer", () => {
  it("cancels the pending advance when unmounted during feedback", () => {
    const onComplete = vi.fn();
    const { container, unmount } = render(
      <GeographyQuizMap
        onComplete={onComplete}
        questions={[
          QUESTIONS[0] ?? {
            answerRegionId: "FR",
            id: "q1",
            prompt: "Click on France",
          },
        ]}
        regions={REGIONS}
      />,
    );
    clickRegion(container, "FR");
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
    flushAdvance();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
