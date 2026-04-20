import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UsageBreakdown } from "./usage-breakdown";

const items = [
  {
    id: "models",
    label: "Model inference",
    value: 420,
    valueLabel: "420k tokens",
  },
  {
    id: "storage",
    label: "Vector storage",
    value: 160,
    valueLabel: "160 GB",
  },
  {
    id: "events",
    label: "Events API",
    value: 90,
    valueLabel: "90k calls",
  },
];

describe("UsageBreakdown", () => {
  it("renders items ranked by descending value", () => {
    render(<UsageBreakdown items={items} />);

    const labels = screen
      .getAllByText(/Model inference|Vector storage|Events API/)
      .map((element) => element.textContent);

    expect(labels).toEqual(["Model inference", "Vector storage", "Events API"]);
  });

  it("shows relative share details", () => {
    render(<UsageBreakdown items={items} />);

    expect(screen.getByText("63% of total")).toBeInTheDocument();
    expect(screen.getByText("24% of total")).toBeInTheDocument();
  });

  it("renders the empty state when there are no items", () => {
    render(<UsageBreakdown emptyMessage="Nothing to report" items={[]} />);

    expect(screen.getByText("Nothing to report")).toBeInTheDocument();
  });
});
