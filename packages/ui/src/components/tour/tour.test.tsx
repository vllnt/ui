import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Tour } from "./tour";

const steps = [
  {
    description: "Learn the navigation layout.",
    id: "nav",
    title: "Navigation",
  },
  {
    description: "Find your current progress and objectives.",
    id: "progress",
    title: "Progress",
  },
  {
    description: "Review reflection prompts before finishing.",
    id: "finish",
    title: "Finish",
  },
];

describe("Tour", () => {
  it("moves through steps", () => {
    render(<Tour steps={steps} />);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Progress")).toBeInTheDocument();
  });

  it("calls onComplete on the last step", () => {
    const onComplete = vi.fn();

    render(<Tour defaultStep={2} onComplete={onComplete} steps={steps} />);

    fireEvent.click(screen.getByRole("button", { name: "Finish" }));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
