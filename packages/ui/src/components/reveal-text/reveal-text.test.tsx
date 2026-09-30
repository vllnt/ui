import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { stubMatchMedia } from "../../__tests__/stub-match-media";

import { RevealText } from "./reveal-text";

describe("RevealText", () => {
  it("renders its children and merges className", () => {
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
    const { container } = render(
      <RevealText className="custom-class">Headline</RevealText>,
    );
    expect(screen.getByText("Headline")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
