import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ScrambleText } from "./scramble-text";

describe("ScrambleText", () => {
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

  it("renders an accessible label with the final text", () => {
    render(<ScrambleText text="SECRET" />);

    expect(screen.getByLabelText("SECRET")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <ScrambleText className="custom-class" text="SECRET" />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
