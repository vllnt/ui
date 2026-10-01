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

  it("renders the kind chip, status dot, title and subtitle when populated", () => {
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
    expect(screen.getByText("research-2025")).toBeInTheDocument();
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

  it("renders an agent title and subtitle without status", () => {
    render(
      <ObjectInspector kind="agent" subtitle="claude-3.7" title="researcher" />,
    );
    expect(screen.getByText("researcher")).toBeInTheDocument();
    expect(screen.getByText("claude-3.7")).toBeInTheDocument();
  });

  it("stops its infinite pulse under prefers-reduced-motion", () => {
    const { container } = render(<ObjectInspector kind="run" status="running" title="run" />);
    const pulsing = [...container.querySelectorAll('[class*="animate-p"], [class*="animate-spin"]')];
    expect(pulsing.length).toBeGreaterThan(0);
    for (const element of pulsing) {
      expect(element.getAttribute("class")).toContain("motion-reduce:animate-none");
    }
  });
});
