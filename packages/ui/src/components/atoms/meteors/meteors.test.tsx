import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Meteors } from "./meteors";

describe("Meteors", () => {
  it("renders the default field with a custom class name", () => {
    const { container } = render(<Meteors className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders the requested meteor count", () => {
    const { container } = render(<Meteors count={4} />);
    expect(container.querySelectorAll(":scope > span")).toHaveLength(4);
  });

  it("keeps the animation name out of inline styles so motion-reduce:animate-none can stop it", () => {
    const { container } = render(<Meteors count={3} />);
    const animated = [...container.querySelectorAll<HTMLElement>(":scope > div > span")];
    expect(animated.length).toBeGreaterThan(0);
    for (const element of animated) {
      expect(element.getAttribute("style") ?? "").not.toMatch(/animation(-name)?:/);
      expect(element).toHaveClass("motion-reduce:animate-none");
    }
  });
});
