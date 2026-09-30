import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScrollProgress } from "./scroll-progress";

describe("ScrollProgress", () => {
  it("renders a zeroed progressbar that merges className", () => {
    const { container } = render(<ScrollProgress className="custom-class" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
