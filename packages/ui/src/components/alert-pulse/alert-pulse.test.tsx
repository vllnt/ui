import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AlertPulse } from "./alert-pulse";

describe("AlertPulse", () => {
  it("renders the SVG with severity data attribute", () => {
    const { container } = render(
      <AlertPulse cx={100} cy={100} severity="error" />,
    );

    const svg = container.querySelector("[data-alert-pulse]");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("data-alert-severity", "error");
  });

  it("centers the SVG on the cx/cy point", () => {
    const { container } = render(<AlertPulse cx={200} cy={150} radius={40} />);

    const svg = container.querySelector("[data-alert-pulse]");
    expect(svg).toHaveStyle({ left: `${200 - (40 * 2 + 24) / 2}px` });
    expect(svg).toHaveStyle({ top: `${150 - (40 * 2 + 24) / 2}px` });
  });

  it("clamps radius to a sane minimum", () => {
    const { container } = render(<AlertPulse cx={0} cy={0} radius={2} />);

    const ring = container.querySelector("[data-alert-pulse-ring]");
    expect(ring).toHaveAttribute("r", "6");
  });

  it("applies the animate-ping class by default", () => {
    const { container } = render(<AlertPulse cx={0} cy={0} />);

    const ring = container.querySelector("[data-alert-pulse-ring]");
    expect(ring?.getAttribute("class")).toContain("animate-ping");
  });

  it("omits the animation when reducedMotion is true", () => {
    const { container } = render(<AlertPulse cx={0} cy={0} reducedMotion />);

    const ring = container.querySelector("[data-alert-pulse-ring]");
    expect(ring?.getAttribute("class")).not.toContain("animate-ping");
  });

  it("uses severity name as the default aria-label", () => {
    const { container } = render(<AlertPulse cx={0} cy={0} severity="info" />);

    expect(container.querySelector("[data-alert-pulse]")).toHaveAttribute(
      "aria-label",
      "Info",
    );
  });
});
