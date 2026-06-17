import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Typewriter } from "./typewriter";

describe("Typewriter", () => {
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
    render(<Typewriter text="Hello" />);

    expect(screen.getByLabelText("Hello")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <Typewriter className="custom-class" text="Hi" />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
