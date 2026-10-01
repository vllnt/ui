import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Particles } from "./particles";

describe("Particles", () => {
  it("renders the default field with a custom class name", () => {
    const { container } = render(<Particles className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders the requested particle count", () => {
    const { container } = render(<Particles count={8} />);
    expect(container.querySelectorAll("span")).toHaveLength(8);
  });

  it("keeps the animation name out of inline styles so motion-reduce:animate-none can stop it", () => {
    const { container } = render(<Particles count={3} />);
    const animated = [...container.querySelectorAll<HTMLElement>(":scope > div > span")];
    expect(animated.length).toBeGreaterThan(0);
    for (const element of animated) {
      expect(element.getAttribute("style") ?? "").not.toMatch(/animation(-name)?:/);
      expect(element).toHaveClass("motion-reduce:animate-none");
    }
  });
});
