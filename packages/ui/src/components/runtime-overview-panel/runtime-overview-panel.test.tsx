import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  type RuntimeMetric,
  RuntimeOverviewPanel,
} from "./runtime-overview-panel";

const sample: RuntimeMetric[] = [
  { id: "runs", label: "Active runs", tone: "success", value: 3 },
  {
    detail: "stable",
    id: "tps",
    label: "Throughput",
    tone: "success",
    trend: "up",
    value: "120 / s",
  },
];

describe("RuntimeOverviewPanel", () => {
  it("renders the empty state when metrics list is empty", () => {
    const { container } = render(<RuntimeOverviewPanel metrics={[]} />);

    expect(
      container.querySelector("[data-runtime-state='empty']"),
    ).toBeInTheDocument();
    expect(screen.getByText("No runtime metrics")).toBeInTheDocument();
  });

  it("renders one tile per metric", () => {
    const { container } = render(<RuntimeOverviewPanel metrics={sample} />);

    expect(container.querySelectorAll("[data-runtime-metric]")).toHaveLength(2);
  });

  it("propagates tone to the tile data attribute", () => {
    const { container } = render(<RuntimeOverviewPanel metrics={sample} />);

    expect(
      container.querySelector("[data-runtime-metric='runs']"),
    ).toHaveAttribute("data-runtime-tone", "success");
  });

  it("renders the optional detail line", () => {
    render(<RuntimeOverviewPanel metrics={sample} />);

    expect(screen.getByText("stable")).toBeInTheDocument();
  });

  it("renders the title", () => {
    render(<RuntimeOverviewPanel metrics={sample} title="Live" />);

    expect(screen.getByText("Live")).toBeInTheDocument();
  });
});
