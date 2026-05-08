import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ObjectInspector } from "./object-inspector";

describe("ObjectInspector", () => {
  it("renders the empty state when kind is omitted", () => {
    const { container } = render(<ObjectInspector />);

    expect(
      container.querySelector("[data-object-state='empty']"),
    ).toBeInTheDocument();
    expect(screen.getByText("No selection")).toBeInTheDocument();
  });

  it("renders the empty state when title is omitted", () => {
    const { container } = render(<ObjectInspector kind="run" />);

    expect(
      container.querySelector("[data-object-state='empty']"),
    ).toBeInTheDocument();
  });

  it("renders the kind chip + status dot when populated", () => {
    const { container } = render(
      <ObjectInspector
        kind="run"
        status="running"
        subtitle="claude-3.7"
        title="research-2025"
      />,
    );

    expect(container.querySelector("[data-object-kind]")).toHaveAttribute(
      "data-object-kind",
      "run",
    );
    expect(container.querySelector("[data-object-status]")).toHaveAttribute(
      "data-object-status",
      "running",
    );
    expect(screen.getByText("Run")).toBeInTheDocument();
    expect(screen.getByText("Running")).toBeInTheDocument();
  });

  it("renders the title and subtitle", () => {
    render(
      <ObjectInspector kind="agent" subtitle="claude-3.7" title="researcher" />,
    );

    expect(screen.getByText("researcher")).toBeInTheDocument();
    expect(screen.getByText("claude-3.7")).toBeInTheDocument();
  });

  it("renders children inside the body slot", () => {
    render(
      <ObjectInspector kind="run" title="x">
        <p>Body section</p>
      </ObjectInspector>,
    );

    expect(screen.getByText("Body section")).toBeInTheDocument();
  });
});
