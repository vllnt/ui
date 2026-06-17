import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnimatedList } from "./animated-list";

describe("AnimatedList", () => {
  it("renders its children", () => {
    render(
      <AnimatedList>
        <span>First</span>
        <span>Second</span>
      </AnimatedList>,
    );

    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(<AnimatedList className="custom-class" />);

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
