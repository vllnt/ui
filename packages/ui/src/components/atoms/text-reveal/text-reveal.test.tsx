import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { stubAnimationFrame } from "../../../__tests__/stub-animation-frame";
import { stubMatchMedia } from "../../../__tests__/stub-match-media";

import { TextReveal } from "./text-reveal";

describe("TextReveal", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  it("renders an accessible label with the full text and applies a custom class name", () => {
    const { container } = render(
      <TextReveal className="custom-class">Read this line</TextReveal>,
    );
    expect(screen.getByLabelText("Read this line")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

describe("TextReveal scrolling", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("reads layout once per frame however many scroll events arrive", () => {
    const frames = stubAnimationFrame();
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(1000);
    const layout = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue({
        bottom: 1000,
        height: 0,
        left: 0,
        right: 0,
        toJSON: () => ({}),
        top: 1000,
        width: 0,
        x: 0,
        y: 1000,
      });
    const { container, unmount } = render(<TextReveal>One Two</TextReveal>);
    const words = container.querySelectorAll("span");
    expect(words[1]).toHaveStyle({ opacity: "0.2" });
    layout.mockClear();
    layout.mockReturnValue({
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      toJSON: () => ({}),
      top: 0,
      width: 0,
      x: 0,
      y: 0,
    });

    fireEvent.scroll(window);
    fireEvent.scroll(window);
    fireEvent.scroll(window);
    expect(frames.pending()).toBe(1);
    frames.flush();

    expect(layout).toHaveBeenCalledTimes(1);
    expect(words[1]).toHaveStyle({ opacity: "1" });

    fireEvent.scroll(window);
    unmount();
    expect(frames.pending()).toBe(0);
  });
});
