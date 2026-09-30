import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  type RelationshipEdge,
  RelationshipInspector,
} from "./relationship-inspector";

const sample: RelationshipEdge[] = [
  { direction: "inbound", id: "1", relation: "spawned-by", target: "run-1" },
  { direction: "outbound", id: "2", relation: "emits", target: "summary.md" },
];

describe("RelationshipInspector", () => {
  it("renders the empty state when no edges are provided", () => {
    const { container } = render(<RelationshipInspector edges={[]} />);
    expect(
      container.querySelector("[data-relationship-state='empty']"),
    ).toBeInTheDocument();
    expect(screen.getByText("No relationships")).toBeInTheDocument();
  });

  it("groups plain rows by direction with a relation chip each", () => {
    const { container } = render(<RelationshipInspector edges={sample} />);
    expect(
      container.querySelector("[data-relationship-group='inbound']"),
    ).toBeInTheDocument();
    expect(
      container.querySelector("[data-relationship-group='outbound']"),
    ).toBeInTheDocument();
    expect(screen.getByText("spawned-by")).toBeInTheDocument();
    expect(screen.getByText("emits")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("invokes onActivate when a row is clicked", () => {
    const handleActivate = vi.fn();
    render(
      <RelationshipInspector
        edges={[
          {
            direction: "outbound",
            id: "x",
            onActivate: handleActivate,
            relation: "emits",
            target: "summary.md",
          },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleActivate).toHaveBeenCalledTimes(1);
  });
});
