import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ShineBorder } from "./shine-border";

describe("ShineBorder", () => {
  it("renders its children and applies a custom class name", () => {
    const { container } = render(
      <ShineBorder className="custom-class">Featured</ShineBorder>,
    );
    expect(screen.getByText("Featured")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("keeps the animation name out of inline styles so motion-reduce:animate-none can stop it", () => {
    const { container } = render(<ShineBorder>Featured</ShineBorder>);
    const animated = [
      ...container.querySelectorAll<HTMLElement>("[aria-hidden]"),
    ];
    expect(animated.length).toBeGreaterThan(0);
    animated.forEach((element) => {
      expect(element.getAttribute("style") ?? "").not.toMatch(
        /animation(-name)?:/,
      );
      expect(element).toHaveClass("motion-reduce:animate-none");
    });
  });
});
