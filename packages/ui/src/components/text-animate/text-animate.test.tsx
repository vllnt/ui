import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TextAnimate } from "./text-animate";

describe("TextAnimate", () => {
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

  it("renders the full text content", () => {
    const { container } = render(<TextAnimate>Hello world</TextAnimate>);

    expect(container.textContent).toContain("Hello world");
  });

  it("applies a custom class name", () => {
    const { container } = render(
      <TextAnimate className="custom-class">Hello</TextAnimate>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
