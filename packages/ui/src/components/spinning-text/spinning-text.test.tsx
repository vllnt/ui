import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SpinningText } from "./spinning-text";

describe("SpinningText", () => {
  it("renders an accessible label", () => {
    render(<SpinningText>orbit</SpinningText>);

    expect(screen.getByLabelText("orbit")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <SpinningText className="custom-class">orbit</SpinningText>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
