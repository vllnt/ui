import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Quiz, type QuizOption } from "./quiz";

function keyedOption(option: QuizOption, key: string): QuizOption {
  return Object.assign(option, {
    toString: () => key,
  });
}

const options: QuizOption[] = [
  keyedOption(
    {
      correct: true,
      explanation: "Paris is the capital of France.",
      label: "Paris",
    },
    "paris",
  ),
  keyedOption(
    {
      explanation: "London is the capital of the United Kingdom.",
      label: "London",
    },
    "london",
  ),
];

function renderQuiz(onAnswer = vi.fn()) {
  render(
    <Quiz
      explanation={<p>Paris is correct.</p>}
      hint="Think of the Eiffel Tower."
      onAnswer={onAnswer}
      options={options}
      question="What is the capital of France?"
    />,
  );

  return { onAnswer };
}

describe("Quiz", () => {
  it("renders the question and disables submission until an option is selected", () => {
    renderQuiz();

    expect(
      screen.getByText("What is the capital of France?"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Check Answer" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Paris" }));

    expect(
      screen.getByRole("button", { name: "Check Answer" }),
    ).not.toBeDisabled();
  });

  it("reveals the hint before submission", () => {
    renderQuiz();

    fireEvent.click(screen.getByRole("button", { name: "Show hint" }));

    expect(screen.getByText("Think of the Eiffel Tower.")).toBeInTheDocument();
  });

  it("submits a correct answer and resets state", () => {
    const { onAnswer } = renderQuiz();

    fireEvent.click(screen.getByRole("button", { name: "Paris" }));
    fireEvent.click(screen.getByRole("button", { name: "Check Answer" }));

    expect(onAnswer).toHaveBeenCalledWith(true);
    expect(screen.getByText("Correct!")).toBeInTheDocument();
    expect(screen.getByText("Paris is correct.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Try Again" }));

    expect(screen.getByRole("button", { name: "Check Answer" })).toBeDisabled();
    expect(screen.queryByText("Correct!")).not.toBeInTheDocument();
  });

  it("submits an incorrect answer", () => {
    const { onAnswer } = renderQuiz();

    fireEvent.click(screen.getByRole("button", { name: "London" }));
    fireEvent.click(screen.getByRole("button", { name: "Check Answer" }));

    expect(onAnswer).toHaveBeenCalledWith(false);
    expect(screen.getByText("Not quite right.")).toBeInTheDocument();
    expect(
      screen.getByText("London is the capital of the United Kingdom."),
    ).toBeInTheDocument();
  });
});
