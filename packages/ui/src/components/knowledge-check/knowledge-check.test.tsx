import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { KnowledgeCheck, type KnowledgeCheckQuestion } from "./knowledge-check";

const QUESTIONS: KnowledgeCheckQuestion[] = [
  {
    id: "react-purpose",
    options: [
      { correct: true, label: "A UI library", value: "ui" },
      { label: "A database", value: "db" },
    ],
    question: "What is React?",
    type: "multiple-choice",
  },
  {
    answer: false,
    explanation: "React is a UI library, not a framework.",
    id: "react-framework",
    question: "React is a framework.",
    type: "true-false",
  },
  {
    answer: "useState",
    id: "state-hook",
    question: "The hook for state is ___",
    type: "fill-blank",
  },
];

describe("KnowledgeCheck", () => {
  describe("rendering", () => {
    it("renders the title and the first question", () => {
      render(<KnowledgeCheck questions={QUESTIONS} title="Check yourself" />);

      expect(
        screen.getByRole("heading", { level: 3, name: "Check yourself" }),
      ).toBeInTheDocument();
      expect(screen.getByText("What is React?")).toBeInTheDocument();
    });

    it("shows the position counter", () => {
      render(<KnowledgeCheck questions={QUESTIONS} />);

      expect(screen.getByText("1 of 3")).toBeInTheDocument();
    });
  });

  describe("multiple-choice", () => {
    it("checks the answer + flips to the next button", () => {
      render(<KnowledgeCheck questions={QUESTIONS} />);

      fireEvent.click(screen.getByLabelText("A UI library"));
      fireEvent.click(screen.getByRole("button", { name: "Check" }));

      expect(screen.getByRole("status")).toHaveTextContent("Correct");
      expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    });

    it("flags an incorrect choice", () => {
      render(<KnowledgeCheck questions={QUESTIONS} />);

      fireEvent.click(screen.getByLabelText("A database"));
      fireEvent.click(screen.getByRole("button", { name: "Check" }));

      expect(screen.getByRole("status")).toHaveTextContent("Try again");
    });
  });

  describe("true-false", () => {
    it("evaluates the boolean answer", () => {
      render(<KnowledgeCheck questions={QUESTIONS} />);

      fireEvent.click(screen.getByLabelText("A UI library"));
      fireEvent.click(screen.getByRole("button", { name: "Check" }));
      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      expect(screen.getByText("React is a framework.")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "False" }));
      fireEvent.click(screen.getByRole("button", { name: "Check" }));

      expect(screen.getByRole("status")).toHaveTextContent("Correct");
      expect(
        screen.getByText("React is a UI library, not a framework."),
      ).toBeInTheDocument();
    });
  });

  describe("fill-blank", () => {
    it("normalizes case insensitively by default", () => {
      const onAnswer = vi.fn();
      render(<KnowledgeCheck onAnswer={onAnswer} questions={QUESTIONS} />);

      fireEvent.click(screen.getByLabelText("A UI library"));
      fireEvent.click(screen.getByRole("button", { name: "Check" }));
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      fireEvent.click(screen.getByRole("button", { name: "False" }));
      fireEvent.click(screen.getByRole("button", { name: "Check" }));
      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "  USESTATE  " } });
      fireEvent.click(screen.getByRole("button", { name: "Check" }));

      expect(screen.getByRole("status")).toHaveTextContent("Correct");
      expect(onAnswer).toHaveBeenLastCalledWith({
        correct: true,
        questionId: "state-hook",
        response: "  USESTATE  ",
      });
    });
  });

  describe("completion", () => {
    it("shows the score summary on the last question", () => {
      const onComplete = vi.fn();
      render(<KnowledgeCheck onComplete={onComplete} questions={QUESTIONS} />);

      fireEvent.click(screen.getByLabelText("A UI library"));
      fireEvent.click(screen.getByRole("button", { name: "Check" }));
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      fireEvent.click(screen.getByRole("button", { name: "False" }));
      fireEvent.click(screen.getByRole("button", { name: "Check" }));
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "useState" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Check" }));
      fireEvent.click(screen.getByRole("button", { name: "You scored" }));

      expect(screen.getByText("3 of 3")).toBeInTheDocument();
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({ correct: 3, total: 3 }),
      );
    });

    it("retry resets the form to the first question", () => {
      const firstQuestion = QUESTIONS[0];
      if (!firstQuestion) throw new Error("expected a fixture question");
      render(<KnowledgeCheck questions={[firstQuestion]} />);

      fireEvent.click(screen.getByLabelText("A UI library"));
      fireEvent.click(screen.getByRole("button", { name: "Check" }));
      fireEvent.click(screen.getByRole("button", { name: "You scored" }));

      expect(screen.getByText("1 of 1")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Retry" }));
      expect(screen.getByText("What is React?")).toBeInTheDocument();
    });
  });

  describe("navigation", () => {
    it("Back returns to the previous question", () => {
      render(<KnowledgeCheck questions={QUESTIONS} />);

      fireEvent.click(screen.getByLabelText("A UI library"));
      fireEvent.click(screen.getByRole("button", { name: "Check" }));
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      expect(screen.getByText("React is a framework.")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Back" }));
      expect(screen.getByText("What is React?")).toBeInTheDocument();
    });
  });
});
