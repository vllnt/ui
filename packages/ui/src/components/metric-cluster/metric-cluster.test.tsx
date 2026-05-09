import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MetricCluster, type MetricClusterEntry } from "./metric-cluster";

const sample: MetricClusterEntry[] = [
  { id: "qps", label: "qps", tone: "success", value: "240" },
  { id: "errs", label: "errs", tone: "danger", value: "14" },
  { id: "p95", label: "p95", value: "180ms" },
];

describe("MetricCluster", () => {
  it("renders one row per metric", () => {
    const { container } = render(
      <MetricCluster metrics={sample} x={0} y={0} />,
    );

    expect(
      container.querySelectorAll("[data-metric-cluster-row]"),
    ).toHaveLength(3);
  });

  it("renders the title when provided", () => {
    render(
      <MetricCluster metrics={sample} title="research-2025" x={0} y={0} />,
    );

    expect(screen.getByText("research-2025")).toBeInTheDocument();
  });

  it("omits the title when not provided", () => {
    const { container } = render(
      <MetricCluster metrics={sample} x={0} y={0} />,
    );

    expect(
      container.querySelector("[data-metric-cluster-title]"),
    ).not.toBeInTheDocument();
  });

  it("positions the cluster using the anchor coords", () => {
    const { container } = render(
      <MetricCluster metrics={sample} x={120} y={80} />,
    );

    expect(container.querySelector("[data-metric-cluster]")).toHaveStyle({
      left: "120px",
      top: "80px",
    });
  });

  it("propagates per-row tone to a data attribute", () => {
    const { container } = render(
      <MetricCluster metrics={sample} x={0} y={0} />,
    );

    expect(
      container.querySelector("[data-metric-cluster-row='errs']"),
    ).toHaveAttribute("data-metric-cluster-tone", "danger");
  });

  it("falls back to neutral tone when omitted", () => {
    const { container } = render(
      <MetricCluster metrics={sample} x={0} y={0} />,
    );

    expect(
      container.querySelector("[data-metric-cluster-row='p95']"),
    ).toHaveAttribute("data-metric-cluster-tone", "neutral");
  });
});
