import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Toggle } from "./toggle";

describe("Toggle", () => {
  it("applies custom className", () => {
    const { container } = render(<Toggle className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it.each(["default", "lg", "sm"] as const)("renders %s size", (size) => {
    const { container } = render(<Toggle size={size} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it.each(["default", "outline"] as const)("renders %s variant", (variant) => {
    const { container } = render(<Toggle variant={variant} />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it("forwards ref to DOM element", () => {
    const ref = { current: null };
    render(<Toggle ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("is visible when rendered", () => {
    const { container } = render(<Toggle />);
    expect(container.firstChild).toBeVisible();
  });
});
