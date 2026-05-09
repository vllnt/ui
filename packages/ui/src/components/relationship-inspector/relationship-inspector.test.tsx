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

  it("groups edges by direction", () => {
    const { container } = render(<RelationshipInspector edges={sample} />);

    expect(
      container.querySelector("[data-relationship-group='inbound']"),
    ).toBeInTheDocument();
    expect(
      container.querySelector("[data-relationship-group='outbound']"),
    ).toBeInTheDocument();
  });

  it("renders the relation chip for each row", () => {
    render(<RelationshipInspector edges={sample} />);

    expect(screen.getByText("spawned-by")).toBeInTheDocument();
    expect(screen.getByText("emits")).toBeInTheDocument();
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

    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(handleActivate).toHaveBeenCalledTimes(1);
  });

  it("renders rows as plain divs when onActivate is omitted", () => {
    render(<RelationshipInspector edges={sample} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
