import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnimatedGridPattern } from "./animated-grid-pattern";

describe("AnimatedGridPattern", () => {
  it("renders the grid", () => {
    const { container } = render(<AnimatedGridPattern />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <AnimatedGridPattern className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders the requested square count", () => {
    const { container } = render(<AnimatedGridPattern squares={6} />);

    expect(container.querySelectorAll("rect.animate-pulse")).toHaveLength(6);
  });
});
