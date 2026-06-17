import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FloatingNavbar } from "./floating-navbar";

describe("FloatingNavbar", () => {
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
    render(
      <FloatingNavbar>
        <a href="#home">Home</a>
      </FloatingNavbar>,
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(<FloatingNavbar className="custom-class" />);

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
