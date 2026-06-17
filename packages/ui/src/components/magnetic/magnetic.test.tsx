import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Magnetic } from "./magnetic";

describe("Magnetic", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        addEventListener: vi.fn(),
        matches: false,
        removeEventListener: vi.fn(),
      }),
    );
  });

  it("renders its children", () => {
    render(<Magnetic>Pull me</Magnetic>);

    expect(screen.getByText("Pull me")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <Magnetic className="custom-class">Content</Magnetic>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
