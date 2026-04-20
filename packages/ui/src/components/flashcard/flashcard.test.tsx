import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Flashcard } from "./flashcard";

describe("Flashcard", () => {
  it("reveals the answer when flipped", () => {
    render(
      <Flashcard
        answer="A variable stores a reusable value."
        question="What does a variable do?"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Reveal answer" }));

    expect(
      screen.getByText("A variable stores a reusable value."),
    ).toBeInTheDocument();
  });

  it("calls onFlipChange when toggled", () => {
    const onFlipChange = vi.fn();

    render(
      <Flashcard
        answer="A loop repeats a block of code."
        onFlipChange={onFlipChange}
        question="What is a loop?"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Flip" }));

    expect(onFlipChange).toHaveBeenCalledWith(true);
  });
});
