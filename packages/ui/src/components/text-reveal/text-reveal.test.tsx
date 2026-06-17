import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TextReveal } from "./text-reveal";

describe("TextReveal", () => {
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

  it("renders an accessible label with the full text", () => {
    render(<TextReveal>Read this line</TextReveal>);

    expect(screen.getByLabelText("Read this line")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <TextReveal className="custom-class">Read this</TextReveal>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
