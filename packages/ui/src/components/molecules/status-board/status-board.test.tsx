import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StatusBoard, type StatusBoardItem } from "./status-board";

const items: StatusBoardItem[] = [
  {
    description: "API gateway latency and availability.",
    label: "API Gateway",
    meta: "Updated 1m ago",
    status: "healthy",
    value: "99.98%",
  },
  {
    description: "Background queue throughput.",
    label: "Jobs",
    status: "warning",
    value: "4 delayed",
  },
];

describe("StatusBoard", () => {
  it("renders the title, summary, and items", () => {
    render(<StatusBoard items={items} title="Operations" />);
    expect(screen.getByText("Operations")).toBeInTheDocument();
    expect(screen.getByText("API Gateway")).toBeInTheDocument();
    expect(screen.getByText("Jobs")).toBeInTheDocument();
    expect(screen.getByText("1 Healthy")).toBeInTheDocument();
    expect(screen.getByText("1 Warning")).toBeInTheDocument();
  });
});

describe("StatusBoard keys", () => {
  it("renders items sharing a label without duplicate-key errors", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => null);
    render(
      <StatusBoard
        items={[
          { label: "Worker", status: "healthy", value: "eu-1" },
          { label: "Worker", status: "warning", value: "us-1" },
        ]}
        title="Fleet"
      />,
    );
    expect(screen.getAllByText("Worker")).toHaveLength(2);
    expect(screen.getByText("eu-1")).toBeInTheDocument();
    expect(screen.getByText("us-1")).toBeInTheDocument();
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
