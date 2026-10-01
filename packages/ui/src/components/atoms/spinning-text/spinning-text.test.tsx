import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SpinningText } from "./spinning-text";

describe("SpinningText", () => {
  it("renders an accessible label and applies a custom class name", () => {
    const { container } = render(
      <SpinningText className="custom-class">orbit</SpinningText>,
    );
    expect(
      screen.getByText("orbit", { selector: ".sr-only" }),
    ).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("exposes the text as screen-reader text, not a prohibited aria-label", () => {
    const { container } = render(<SpinningText>orbit</SpinningText>);
    expect(container.firstChild).not.toHaveAttribute("aria-label");
    expect(
      screen.getByText("orbit", { selector: ".sr-only" }),
    ).toBeInTheDocument();
  });
});
