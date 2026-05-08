import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WorldBreadcrumbs, type WorldCrumb } from "./world-breadcrumbs";

const sample: WorldCrumb[] = [
  { id: "world", kind: "world", label: "Production" },
  { id: "group", kind: "group", label: "Ingest cluster" },
  { id: "run", kind: "run", label: "research-2025" },
];

describe("WorldBreadcrumbs", () => {
  it("renders one entry per crumb", () => {
    const { container } = render(<WorldBreadcrumbs crumbs={sample} />);

    expect(container.querySelectorAll("[data-world-breadcrumb]")).toHaveLength(
      3,
    );
  });

  it("marks the last crumb as active", () => {
    const { container } = render(<WorldBreadcrumbs crumbs={sample} />);

    expect(
      container.querySelector("[data-world-breadcrumb='run']"),
    ).toHaveAttribute("data-world-breadcrumb-active", "true");
  });

  it("invokes onSelect with the activated id for non-last crumbs", () => {
    const handleSelect = vi.fn();
    render(<WorldBreadcrumbs crumbs={sample} onSelect={handleSelect} />);

    fireEvent.click(screen.getByText("Production"));
    expect(handleSelect).toHaveBeenCalledWith("world");
  });

  it("does not invoke onSelect for the last crumb", () => {
    const handleSelect = vi.fn();
    render(<WorldBreadcrumbs crumbs={sample} onSelect={handleSelect} />);

    fireEvent.click(screen.getByText("research-2025"));
    expect(handleSelect).not.toHaveBeenCalled();
  });

  it("renders crumbs as plain spans when no onSelect is provided", () => {
    render(<WorldBreadcrumbs crumbs={sample} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders the empty state when crumbs list is empty", () => {
    const { container } = render(<WorldBreadcrumbs crumbs={[]} />);

    expect(
      container.querySelector("[data-world-breadcrumbs-state='empty']"),
    ).toBeInTheDocument();
  });

  it("renders separators between crumbs", () => {
    const { container } = render(<WorldBreadcrumbs crumbs={sample} />);

    expect(
      container.querySelectorAll("[data-world-breadcrumb-sep]"),
    ).toHaveLength(2);
  });
});
