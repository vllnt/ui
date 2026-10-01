import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Sparkles } from "./sparkles";

describe("Sparkles", () => {
  it("renders its children and applies a custom class name", () => {
    const { container } = render(
      <Sparkles className="custom-class">Magic</Sparkles>,
    );
    expect(screen.getByText("Magic")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders the requested sparkle count", () => {
    const { container } = render(<Sparkles count={5} />);
    expect(container.querySelectorAll("span")).toHaveLength(5);
  });

  it("keeps the animation name out of inline styles so motion-reduce:animate-none can stop it", () => {
    const { container } = render(<Sparkles count={3} />);
    const animated = [...container.querySelectorAll<HTMLElement>("[aria-hidden] > span")];
    expect(animated.length).toBeGreaterThan(0);
    for (const element of animated) {
      expect(element.getAttribute("style") ?? "").not.toMatch(/animation(-name)?:/);
      expect(element).toHaveClass("motion-reduce:animate-none");
    }
  });
});
