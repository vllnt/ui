import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChainOfThought, type ChainOfThoughtStep } from "./chain-of-thought";

const STEPS: ChainOfThoughtStep[] = [
  { status: "complete", title: "Read the file" },
  { status: "active", title: "Apply the edit" },
  { title: "Run the tests" },
];

describe("ChainOfThought", () => {
  it("renders an ordered list with one item per step and merges className", () => {
    const { container } = render(
      <ChainOfThought className="custom-class" steps={STEPS} />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(container.querySelector("ol")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(STEPS.length);
  });

  it("renders titles and descriptions", () => {
    render(
      <ChainOfThought
        steps={[{ description: "loaded index.ts", title: "Read the file" }]}
      />,
    );
    expect(screen.getByText("Read the file")).toBeInTheDocument();
    expect(screen.getByText("loaded index.ts")).toBeInTheDocument();
  });

  it("numbers pending steps", () => {
    render(<ChainOfThought steps={[{ title: "Only step" }]} />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
