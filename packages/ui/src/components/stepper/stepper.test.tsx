import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Stepper } from "./stepper";

const steps = [
  { description: "Set your goal and timeline.", id: "goal", title: "Goal" },
  { description: "Collect source material.", id: "collect", title: "Collect" },
  { description: "Practice with feedback.", id: "practice", title: "Practice" },
];

describe("Stepper", () => {
  it("renders the current step and completed steps", () => {
    render(<Stepper currentStep={2} steps={steps} />);

    expect(screen.getByText("Goal")).toBeInTheDocument();
    expect(screen.getByText("Set your goal and timeline.")).toBeInTheDocument();
    expect(screen.getByText("Practice")).toBeInTheDocument();
    expect(screen.getByText("Collect").closest("button")).toHaveTextContent(
      "2",
    );
  });

  it("calls onStepClick when an item is clicked", () => {
    const onStepClick = vi.fn();

    render(<Stepper currentStep={1} onStepClick={onStepClick} steps={steps} />);

    fireEvent.click(screen.getByText("Practice"));

    expect(onStepClick).toHaveBeenCalledWith(steps[2], 2);
  });
});
