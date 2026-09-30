import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { stubMatchMedia } from "../../__tests__/stub-match-media";

import { TextAnimate } from "./text-animate";

describe("TextAnimate", () => {
  beforeEach(() => {
    stubMatchMedia();
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
