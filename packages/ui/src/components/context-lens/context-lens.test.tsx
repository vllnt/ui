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

  it("clamps inner radius to non-negative", () => {
    const { container } = render(
      <ContextLens focus={{ cx: 0, cy: 0, inner: -5, outer: 50 }} />,
    );

    const gradient = container.querySelector("[data-context-lens-gradient]");
    expect(gradient).toHaveAttribute("r", "50");
  });

  it("clamps outer radius to be at least inner", () => {
    const { container } = render(
      <ContextLens focus={{ cx: 0, cy: 0, inner: 60, outer: 30 }} />,
    );

    const gradient = container.querySelector("[data-context-lens-gradient]");
    expect(gradient).toHaveAttribute("r", "60");
  });

  it("clamps opacity into 0..1", () => {
    const { container } = render(
      <ContextLens
        focus={{ cx: 0, cy: 0, inner: 10, outer: 50 }}
        opacity={5}
      />,
    );

    const dim = container.querySelector("[data-context-lens-dim]");
    expect(dim).toHaveAttribute("fill-opacity", "1");
  });
});
