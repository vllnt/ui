import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContextLens } from "./context-lens";

describe("ContextLens", () => {
  it("renders nothing when focus is null", () => {
    const { container } = render(<ContextLens focus={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the SVG layer when focus is provided", () => {
    const { container } = render(
      <ContextLens focus={{ cx: 100, cy: 100, inner: 30, outer: 80 }} />,
    );
    expect(container.querySelector("[data-context-lens]")).toBeInTheDocument();
  });

  it.each([
    {
      inner: -5,
      name: "inner radius to non-negative",
      outer: 50,
      radius: "50",
    },
    {
      inner: 60,
      name: "outer radius to be at least inner",
      outer: 30,
      radius: "60",
    },
  ])("clamps $name", ({ inner, outer, radius }) => {
    const { container } = render(
      <ContextLens focus={{ cx: 0, cy: 0, inner, outer }} />,
    );
    expect(
      container.querySelector("[data-context-lens-gradient]"),
    ).toHaveAttribute("r", radius);
  });

  it("clamps opacity into 0..1", () => {
    const { container } = render(
      <ContextLens
        focus={{ cx: 0, cy: 0, inner: 10, outer: 50 }}
        opacity={5}
      />,
    );
    expect(container.querySelector("[data-context-lens-dim]")).toHaveAttribute(
      "fill-opacity",
      "1",
    );
  });
});
