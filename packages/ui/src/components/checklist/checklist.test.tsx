import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Checklist, type ChecklistItem } from "./checklist";

const items: ChecklistItem[] = [
  { id: "a", label: "Step A" },
  { description: "explain", id: "b", label: "Step B" },
  { id: "c", label: "Step C" },
];

describe("Checklist", () => {
  it("renders one entry per item", () => {
    render(<Checklist items={items} />);

    expect(screen.getByText("Step A")).toBeInTheDocument();
    expect(screen.getByText("Step B")).toBeInTheDocument();
    expect(screen.getByText("Step C")).toBeInTheDocument();
  });

  it("renders the optional description", () => {
    render(<Checklist items={items} />);

    expect(screen.getByText("explain")).toBeInTheDocument();
  });

  it("renders the title + progress when provided", () => {
    render(<Checklist items={items} title="Onboarding" />);

    expect(screen.getByText("Onboarding")).toBeInTheDocument();
    expect(screen.getByText(/0\/3/)).toBeInTheDocument();
  });

  it("toggles an item when its row is clicked", () => {
    render(<Checklist items={items} title="t" />);

    fireEvent.click(screen.getByText("Step A"));
    expect(screen.getByText(/1\/3/)).toBeInTheDocument();
  });

  it("invokes onComplete when every item is checked", () => {
    const onComplete = vi.fn();
    render(<Checklist items={items} onComplete={onComplete} title="t" />);

    fireEvent.click(screen.getByText("Step A"));
    fireEvent.click(screen.getByText("Step B"));
    fireEvent.click(screen.getByText("Step C"));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(screen.getByText("All items completed!")).toBeInTheDocument();
  });
});
