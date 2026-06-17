import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScrollProgress } from "./scroll-progress";

describe("ScrollProgress", () => {
  it("renders a progressbar starting at zero", () => {
    render(<ScrollProgress />);

    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "0");
  });

  it("applies a custom class name", () => {
    const { container } = render(<ScrollProgress className="custom-class" />);

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
