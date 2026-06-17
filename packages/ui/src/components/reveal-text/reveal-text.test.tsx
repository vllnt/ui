import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RevealText } from "./reveal-text";

describe("RevealText", () => {
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
    render(<RevealText>Headline</RevealText>);

    expect(screen.getByText("Headline")).toBeInTheDocument();
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <RevealText className="custom-class">Headline</RevealText>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
