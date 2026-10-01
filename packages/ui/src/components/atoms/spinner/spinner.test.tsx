import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Spinner } from "./spinner";

describe("Spinner", () => {
  it("applies custom className", () => {
    const { container } = render(<Spinner className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("is visible when rendered", () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild).toBeVisible();
  });

  it("keeps spinning, slower, under prefers-reduced-motion as essential loading feedback", () => {
    const { container } = render(<Spinner />);
    const spinner = container.firstElementChild;
    expect(spinner).toHaveAttribute("data-motion", "essential");
    expect(spinner).toHaveClass("motion-reduce:[animation-duration:1.5s]");
  });
});
