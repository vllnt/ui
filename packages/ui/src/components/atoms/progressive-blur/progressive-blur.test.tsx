import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgressiveBlur } from "./progressive-blur";

describe("ProgressiveBlur", () => {
  it("renders the blur stack with a custom class name", () => {
    const { container } = render(<ProgressiveBlur className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders the requested layer count", () => {
    const { container } = render(<ProgressiveBlur layers={3} />);
    expect(container.querySelectorAll(":scope > div > div")).toHaveLength(3);
  });

  it("caps every layer at the blur.glass.lg token, so a large blur prop never exceeds 24 px", () => {
    const { container } = render(<ProgressiveBlur blur={200} layers={2} />);
    const layers = [
      ...container.querySelectorAll<HTMLElement>(":scope > div > div"),
    ];
    expect(layers).toHaveLength(2);
    expect(
      layers
        .map((layer) => layer.style.backdropFilter)
        .filter((filter) => !filter.includes("var(--blur-glass-lg)")),
    ).toEqual([]);
  });

  it("is glass by default and takes material=solid", () => {
    const { container, rerender } = render(<ProgressiveBlur />);
    expect(container.firstChild).toHaveAttribute("data-material", "glass");
    rerender(<ProgressiveBlur material="solid" />);
    expect(container.firstChild).toHaveAttribute("data-material", "solid");
  });
});
