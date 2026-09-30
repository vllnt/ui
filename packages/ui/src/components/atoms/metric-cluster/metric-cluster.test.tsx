import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MetricCluster, type MetricClusterEntry } from "./metric-cluster";

const sample: MetricClusterEntry[] = [
  { id: "qps", label: "qps", tone: "success", value: "240" },
  { id: "errs", label: "errs", tone: "danger", value: "14" },
  { id: "p95", label: "p95", value: "180ms" },
];

describe("MetricCluster", () => {
  it("renders one toned row per metric at the anchor coords, without a title", () => {
    const { container } = render(
      <MetricCluster metrics={sample} x={120} y={80} />,
    );
    const row = (id: string) =>
      container.querySelector(`[data-metric-cluster-row='${id}']`);
    expect(
      container.querySelectorAll("[data-metric-cluster-row]"),
    ).toHaveLength(3);
    expect(container.querySelector("[data-metric-cluster]")).toHaveStyle({
      left: "120px",
      top: "80px",
    });
    expect(row("errs")).toHaveAttribute("data-metric-cluster-tone", "danger");
    expect(row("p95")).toHaveAttribute("data-metric-cluster-tone", "neutral");
    expect(
      container.querySelector("[data-metric-cluster-title]"),
    ).not.toBeInTheDocument();
  });

  it("renders the title when provided", () => {
    render(
      <MetricCluster metrics={sample} title="research-2025" x={0} y={0} />,
    );
    expect(screen.getByText("research-2025")).toBeInTheDocument();
  });
});
