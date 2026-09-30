import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WorldBreadcrumbs, type WorldCrumb } from "./world-breadcrumbs";

const sample: WorldCrumb[] = [
  { id: "world", kind: "world", label: "Production" },
  { id: "group", kind: "group", label: "Ingest cluster" },
  { id: "run", kind: "run", label: "research-2025" },
];

describe("WorldBreadcrumbs", () => {
  it("renders one plain entry per crumb with separators and the last crumb active", () => {
    const { container } = render(<WorldBreadcrumbs crumbs={sample} />);
    expect(container.querySelectorAll("[data-world-breadcrumb]")).toHaveLength(
      3,
    );
    expect(
      container.querySelector("[data-world-breadcrumb='run']"),
    ).toHaveAttribute("data-world-breadcrumb-active", "true");
    expect(
      container.querySelectorAll("[data-world-breadcrumb-sep]"),
    ).toHaveLength(2);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("invokes onSelect with the activated id for non-last crumbs only", () => {
    const handleSelect = vi.fn();
    render(<WorldBreadcrumbs crumbs={sample} onSelect={handleSelect} />);
    fireEvent.click(screen.getByText("research-2025"));
    expect(handleSelect).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Production"));
    expect(handleSelect).toHaveBeenCalledWith("world");
  });

  it("renders the empty state when crumbs list is empty", () => {
    const { container } = render(<WorldBreadcrumbs crumbs={[]} />);
    expect(
      container.querySelector("[data-world-breadcrumbs-state='empty']"),
    ).toBeInTheDocument();
  });
});
