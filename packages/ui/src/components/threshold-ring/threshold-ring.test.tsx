import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ThresholdRing } from "./threshold-ring";

describe("ThresholdRing", () => {
  it("renders the SVG with tone data attribute", () => {
    const { container } = render(<ThresholdRing tone="warn" value={0.5} />);

    const svg = container.querySelector("[data-threshold-ring]");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("data-threshold-tone", "warn");
  });

  it("clamps value into 0..max", () => {
    const { container } = render(<ThresholdRing max={1} value={5} />);

    const arc = container.querySelector("[data-threshold-ring-arc]");
    const dash = arc?.getAttribute("stroke-dasharray") ?? "";
    const [filled, total] = dash.split(" ").map(Number);
    expect(filled).toBeCloseTo(total ?? 0);
  });

  it("renders the threshold tick when threshold prop is provided", () => {
    const { container } = render(<ThresholdRing threshold={0.7} value={0.5} />);

    expect(
      container.querySelector("[data-threshold-ring-tick]"),
    ).toBeInTheDocument();
  });

  it("omits the threshold tick when threshold is undefined", () => {
    const { container } = render(<ThresholdRing value={0.5} />);

    expect(
      container.querySelector("[data-threshold-ring-tick]"),
    ).not.toBeInTheDocument();
  });

  it("renders the center label when provided", () => {
    const { getByText } = render(
      <ThresholdRing centerLabel="82%" value={0.82} />,
    );

    expect(getByText("82%")).toBeInTheDocument();
  });

  it("falls back to max=1 when given a non-positive max", () => {
    const { container } = render(<ThresholdRing max={0} value={0.5} />);

    const arc = container.querySelector("[data-threshold-ring-arc]");
    const dash = arc?.getAttribute("stroke-dasharray") ?? "";
    const [filled, total] = dash.split(" ").map(Number);
    expect(filled).toBeCloseTo((total ?? 0) * 0.5);
  });
});
