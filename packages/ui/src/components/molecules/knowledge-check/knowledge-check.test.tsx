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

const click = (name: string) => {
  fireEvent.click(screen.getByRole("button", { name }));
};

function answerChoice(label: string) {
  fireEvent.click(screen.getByLabelText(label));
  click("Check");
}

describe("KnowledgeCheck", () => {
  it("renders the title, the first question, and the position counter", () => {
    render(<KnowledgeCheck questions={QUESTIONS} title="Check yourself" />);
    expect(
      screen.getByRole("heading", { level: 3, name: "Check yourself" }),
    ).toBeInTheDocument();
    expect(screen.getByText("What is React?")).toBeInTheDocument();
    expect(screen.getByText("1 of 3")).toBeInTheDocument();
  });

  it("flags an incorrect multiple-choice answer", () => {
    render(<KnowledgeCheck questions={QUESTIONS} />);
    answerChoice("A database");
    expect(screen.getByRole("status")).toHaveTextContent("Try again");
  });

  it("walks every question type to the score summary", () => {
    const onAnswer = vi.fn();
    const onComplete = vi.fn();
    render(
      <KnowledgeCheck
        onAnswer={onAnswer}
        onComplete={onComplete}
        questions={QUESTIONS}
      />,
    );

    answerChoice("A UI library");
    expect(screen.getByRole("status")).toHaveTextContent("Correct");
    click("Next");

    expect(screen.getByText("React is a framework.")).toBeInTheDocument();
    click("False");
    click("Check");
    expect(screen.getByRole("status")).toHaveTextContent("Correct");
    expect(
      screen.getByText("React is a UI library, not a framework."),
    ).toBeInTheDocument();
    click("Next");

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "  USESTATE  " },
    });
    click("Check");
    expect(screen.getByRole("status")).toHaveTextContent("Correct");
    expect(onAnswer).toHaveBeenLastCalledWith({
      correct: true,
      questionId: "state-hook",
      response: "  USESTATE  ",
    });

    click("You scored");
    expect(screen.getByText("3 of 3")).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ correct: 3, total: 3 }),
    );
  });

  it("accepts the exact fill-blank answer", () => {
    const fillBlank = QUESTIONS[2];
    if (!fillBlank) throw new Error("expected a fixture question");
    render(<KnowledgeCheck questions={[fillBlank]} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "useState" },
    });
    click("Check");
    expect(screen.getByRole("status")).toHaveTextContent("Correct");
  });

  it("retry resets the form to the first question", () => {
    const firstQuestion = QUESTIONS[0];
    if (!firstQuestion) throw new Error("expected a fixture question");
    render(<KnowledgeCheck questions={[firstQuestion]} />);
    answerChoice("A UI library");
    click("You scored");
    expect(screen.getByText("1 of 1")).toBeInTheDocument();
    click("Retry");
    expect(screen.getByText("What is React?")).toBeInTheDocument();
  });

  it("Back returns to the previous question", () => {
    render(<KnowledgeCheck questions={QUESTIONS} />);
    answerChoice("A UI library");
    click("Next");
    expect(screen.getByText("React is a framework.")).toBeInTheDocument();
    click("Back");
    expect(screen.getByText("What is React?")).toBeInTheDocument();
  });
});
