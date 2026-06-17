import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TiltCard } from "./tilt-card";

describe("TiltCard", () => {
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
    render(<TiltCard>Hover me</TiltCard>);

    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <TiltCard className="custom-class">Card</TiltCard>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
