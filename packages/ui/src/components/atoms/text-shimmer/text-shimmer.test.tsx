import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TextShimmer } from "./text-shimmer";

describe("TextShimmer", () => {
  it("renders its children and applies a custom class name", () => {
    const { container } = render(
      <TextShimmer className="custom-class">Premium</TextShimmer>,
    );
    expect(screen.getByText("Premium")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
