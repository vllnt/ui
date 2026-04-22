import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ActivityLog } from "./activity-log";

const items = Array.from({ length: 6 }, (_, index) => ({
  action: "updated",
  actor: `Operator ${index + 1}`,
  id: `item-${index + 1}`,
  scope: index % 2 === 0 ? "Workspace" : "Project",
  target: `Dataset ${index + 1}`,
  timestamp: `${index + 1}m ago`,
}));

describe("ActivityLog", () => {
  it("renders the first page of activity entries", () => {
    render(<ActivityLog items={items} pageSize={3} />);

    expect(screen.getByText("Operator 1")).toBeInTheDocument();
    expect(screen.getByText("Operator 3")).toBeInTheDocument();
    expect(screen.queryByText("Operator 4")).not.toBeInTheDocument();
  });

  it("moves to the next page when pagination controls are used", () => {
    render(<ActivityLog items={items} pageSize={3} />);

    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText("Operator 4")).toBeInTheDocument();
    expect(screen.queryByText("Operator 1")).not.toBeInTheDocument();
  });

  it("calls onPageChange when a new page is selected", () => {
    const handlePageChange = vi.fn();
    render(
      <ActivityLog
        items={items}
        onPageChange={handlePageChange}
        page={1}
        pageSize={2}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }));

    expect(handlePageChange).toHaveBeenCalledWith(2);
  });
});
