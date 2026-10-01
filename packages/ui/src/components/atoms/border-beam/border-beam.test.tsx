import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BorderBeam } from "./border-beam";

describe("BorderBeam", () => {
  it("renders aria-hidden with className and border width", () => {
    const { container } = render(
      <BorderBeam borderWidth={3} className="custom-class" />,
    );
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstChild).toHaveClass("custom-class");
    expect(container.firstChild).toHaveStyle({ padding: "3px" });
  });

  it("keeps the animation name out of inline styles so motion-reduce:animate-none can stop it", () => {
    const { container } = render(<BorderBeam />);
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
