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

  it("renders one circle per point with per-point tone or defaultTone fallback", () => {
    const { container } = render(
      <HeatOverlay defaultTone="cool" points={sample} />,
    );
    expect(container.querySelectorAll("[data-heat-point]")).toHaveLength(2);
    expect(container.querySelector("[data-heat-point='a']")).toHaveAttribute(
      "data-heat-tone",
      "danger",
    );
    expect(container.querySelector("[data-heat-point='b']")).toHaveAttribute(
      "data-heat-tone",
      "cool",
    );
  });

  it.each([
    {
      intensity: 100,
      name: "clamps weight when computing radius",
      radius: "100",
      weight: 5,
    },
    {
      intensity: 1,
      name: "floors radius at the minimum sample size",
      radius: "8",
      weight: 0,
    },
  ])("$name", ({ intensity, radius, weight }) => {
    const { container } = render(
      <HeatOverlay
        intensity={intensity}
        points={[{ id: "x", weight, x: 0, y: 0 }]}
      />,
    );
    expect(container.querySelector("[data-heat-point='x']")).toHaveAttribute(
      "r",
      radius,
    );
  });
});
