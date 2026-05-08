import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  type RoutingAssignment,
  RoutingAssignmentPanel,
} from "./routing-assignment-panel";

const sample: RoutingAssignment[] = [
  { agent: "researcher", id: "1", load: 0.82, role: "primary" },
  { agent: "researcher-mini", id: "2", load: 0.04, role: "fallback" },
  { agent: "shadow-eval", id: "3", role: "shadow" },
];

describe("RoutingAssignmentPanel", () => {
  it("renders the empty state when no assignments are provided", () => {
    const { container } = render(<RoutingAssignmentPanel assignments={[]} />);

    expect(
      container.querySelector("[data-routing-state='empty']"),
    ).toBeInTheDocument();
    expect(screen.getByText("No assignments")).toBeInTheDocument();
  });

  it("renders one row per assignment with the role chip", () => {
    const { container } = render(
      <RoutingAssignmentPanel assignments={sample} />,
    );

    expect(
      container.querySelectorAll("[data-routing-assignment]"),
    ).toHaveLength(3);
    expect(screen.getByText("Primary")).toBeInTheDocument();
    expect(screen.getByText("Fallback")).toBeInTheDocument();
    expect(screen.getByText("Shadow")).toBeInTheDocument();
  });

  it("invokes onActivate when an interactive row is clicked", () => {
    const handleActivate = vi.fn();
    render(
      <RoutingAssignmentPanel
        assignments={[
          {
            agent: "researcher",
            id: "x",
            onActivate: handleActivate,
            role: "primary",
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(handleActivate).toHaveBeenCalledTimes(1);
  });

  it("renders rows as plain divs when onActivate is omitted", () => {
    render(<RoutingAssignmentPanel assignments={sample} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("clamps load values into the 0..1 range", () => {
    const { container } = render(
      <RoutingAssignmentPanel
        assignments={[{ agent: "x", id: "x", load: 5, role: "primary" }]}
      />,
    );

    const bar = container.querySelector("[style*='width']");
    expect(bar).toHaveAttribute("style", expect.stringContaining("100%"));
  });
});
