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

const REGIONS: QuizRegion[] = [
  {
    coordinates: [
      [-5, 51],
      [10, 51],
      [10, 41],
      [-5, 41],
      [-5, 51],
    ],
    id: "FR",
    name: "France",
  },
  {
    coordinates: [
      [5, 55],
      [15, 55],
      [15, 47],
      [5, 47],
      [5, 55],
    ],
    id: "DE",
    name: "Germany",
  },
  {
    coordinates: [
      [-9, 44],
      [3, 44],
      [3, 36],
      [-9, 36],
      [-9, 44],
    ],
    id: "ES",
    name: "Spain",
  },
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
  describe("rendering", () => {
    it("renders one region path per entry", () => {
      const { container } = render(
        <GeographyQuizMap questions={QUESTIONS} regions={REGIONS} />,
      );

      expect(
        container.querySelector("[data-region-id='FR']"),
      ).toBeInTheDocument();
      expect(
        container.querySelector("[data-region-id='DE']"),
      ).toBeInTheDocument();
      expect(
        container.querySelector("[data-region-id='ES']"),
      ).toBeInTheDocument();
    });

    it("renders the prompt for the current question", () => {
      render(
        <GeographyQuizMap questions={QUESTIONS} regions={REGIONS}>
          <GeographyQuizMapPrompt />
        </GeographyQuizMap>,
      );

      expect(screen.getByText("Click on France")).toBeInTheDocument();
    });

    it("renders the score slot with running totals", () => {
      render(
        <GeographyQuizMap questions={QUESTIONS} regions={REGIONS}>
          <GeographyQuizMapScore />
        </GeographyQuizMap>,
      );

      expect(screen.getByText("0 / 2 · 0%")).toBeInTheDocument();
    });
  });

  describe("interaction", () => {
    it("marks the answer correct when the right region is clicked", () => {
      const onComplete = vi.fn();
      const { container } = render(
        <GeographyQuizMap
          onComplete={onComplete}
          questions={QUESTIONS}
          regions={REGIONS}
        >
          <GeographyQuizMapScore />
        </GeographyQuizMap>,
      );

      clickRegion(container, "FR");
      expect(container.querySelector("[data-region-id='FR']")).toHaveAttribute(
        "data-state",
        "correct",
      );

      flushAdvance();
      expect(screen.getByText("1 / 2 · 100%")).toBeInTheDocument();
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

    it("advances to the next question after the feedback delay", () => {
      const { container } = render(
        <GeographyQuizMap questions={QUESTIONS} regions={REGIONS}>
          <GeographyQuizMapPrompt />
        </GeographyQuizMap>,
      );

      clickRegion(container, "FR");
      flushAdvance();
      expect(screen.getByText("Click on Germany")).toBeInTheDocument();
    });

    it("ignores clicks while the feedback is showing", () => {
      const { container } = render(
        <GeographyQuizMap questions={QUESTIONS} regions={REGIONS}>
          <GeographyQuizMapScore />
        </GeographyQuizMap>,
      );

      clickRegion(container, "FR");
      clickRegion(container, "DE");
      flushAdvance();
      expect(screen.getByText("1 / 2 · 100%")).toBeInTheDocument();
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
  });

  describe("results", () => {
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

      expect(
        container.querySelector("[data-quiz-results]"),
      ).toBeInTheDocument();
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
});
