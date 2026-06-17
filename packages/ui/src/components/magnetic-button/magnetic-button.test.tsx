import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MagneticButton } from "./magnetic-button";

describe("MagneticButton", () => {
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
    render(<MagneticButton>Hover me</MagneticButton>);

    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <MagneticButton className="custom-class">Action</MagneticButton>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
