import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TextShimmer } from "./text-shimmer";

describe("TextShimmer", () => {
  it("renders its children", () => {
    render(<TextShimmer>Premium</TextShimmer>);

    expect(screen.getByText("Premium")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <TextShimmer className="custom-class">Premium</TextShimmer>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
