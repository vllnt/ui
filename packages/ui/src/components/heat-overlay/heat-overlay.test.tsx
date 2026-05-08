import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeatOverlay, type HeatPoint } from "./heat-overlay";

const sample: HeatPoint[] = [
  { id: "a", tone: "danger", weight: 1, x: 120, y: 80 },
  { id: "b", weight: 0.4, x: 320, y: 220 },
];

describe("HeatOverlay", () => {
  it("renders nothing when points is empty", () => {
    const { container } = render(<HeatOverlay points={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders one circle per point", () => {
    const { container } = render(<HeatOverlay points={sample} />);

    expect(container.querySelectorAll("[data-heat-point]")).toHaveLength(2);
  });

  it("propagates per-point tone to a data attribute", () => {
    const { container } = render(<HeatOverlay points={sample} />);

    expect(container.querySelector("[data-heat-point='a']")).toHaveAttribute(
      "data-heat-tone",
      "danger",
    );
  });

  it("falls back to defaultTone when a point omits its tone", () => {
    const { container } = render(
      <HeatOverlay defaultTone="cool" points={sample} />,
    );

    expect(container.querySelector("[data-heat-point='b']")).toHaveAttribute(
      "data-heat-tone",
      "cool",
    );
  });

  it("clamps weight when computing radius", () => {
    const { container } = render(
      <HeatOverlay
        intensity={100}
        points={[{ id: "x", weight: 5, x: 0, y: 0 }]}
      />,
    );

    expect(container.querySelector("[data-heat-point='x']")).toHaveAttribute(
      "r",
      "100",
    );
  });

  it("floors radius at the minimum sample size", () => {
    const { container } = render(
      <HeatOverlay
        intensity={1}
        points={[{ id: "x", weight: 0, x: 0, y: 0 }]}
      />,
    );

    expect(container.querySelector("[data-heat-point='x']")).toHaveAttribute(
      "r",
      "8",
    );
  });
});
