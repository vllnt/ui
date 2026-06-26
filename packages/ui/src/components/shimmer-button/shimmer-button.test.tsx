import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ShimmerButton } from "./shimmer-button";

describe("ShimmerButton", () => {
  it("renders its children inside a button", () => {
    render(<ShimmerButton>Click me</ShimmerButton>);

    expect(
      screen.getByRole("button", { name: "Click me" }),
    ).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <ShimmerButton className="custom-class">Go</ShimmerButton>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("forwards button attributes", () => {
    render(
      <ShimmerButton disabled type="submit">
        Send
      </ShimmerButton>,
    );

    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });
});
