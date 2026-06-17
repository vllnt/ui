import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ShimmerText } from "./shimmer-text";

describe("ShimmerText", () => {
  it("renders its children", () => {
    const { container } = render(<ShimmerText>Loading</ShimmerText>);

    expect(container.textContent).toContain("Loading");
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <ShimmerText className="custom-class">Loading</ShimmerText>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
