import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BlurReveal } from "./blur-reveal";

describe("BlurReveal", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        addEventListener: vi.fn(),
        matches: false,
        removeEventListener: vi.fn(),
      }),
    );
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        disconnect = vi.fn();
        observe = vi.fn();
        takeRecords = vi.fn();
        unobserve = vi.fn();
      },
    );
  });

  it("renders its children", () => {
    render(<BlurReveal>Content</BlurReveal>);

    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <BlurReveal className="custom-class">Content</BlurReveal>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
