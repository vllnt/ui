import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Step, StepByStep } from "./step-by-step";

function renderSteps(interactive = false) {
  render(
    <StepByStep interactive={interactive} title="Setup guide">
      <Step title="Install">
        <p>Install dependencies.</p>
      </Step>
      <Step title="Build">
        <p>Build the package.</p>
      </Step>
    </StepByStep>,
  );
}

describe("StepByStep", () => {
  it("renders non-interactive numbered steps", () => {
    renderSteps();

    expect(
      screen.getByRole("heading", { name: "Setup guide" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Install")).toBeInTheDocument();
    expect(screen.getByText("Build the package.")).toBeInTheDocument();
  });

  it("tracks completed steps in interactive mode", () => {
    renderSteps(true);

    expect(screen.getByText("0/2 completed")).toBeInTheDocument();

    const firstStepButton = screen.getByRole("button", { name: "1" });
    fireEvent.click(firstStepButton);

    expect(screen.getByText("1/2 completed")).toBeInTheDocument();
    expect(screen.getByText("Install")).toHaveClass("line-through");

    fireEvent.click(firstStepButton);

    expect(screen.getByText("0/2 completed")).toBeInTheDocument();
    expect(screen.getByText("Install")).not.toHaveClass("line-through");
  });
});
