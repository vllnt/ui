import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

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
