import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { stubAnimationFrame } from "../../../__tests__/stub-animation-frame";

import { ScrollProgress } from "./scroll-progress";

describe("ScrollProgress", () => {
  it("renders a zeroed progressbar that merges className", () => {
    const { container } = render(<ScrollProgress className="custom-class" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

describe("ScrollProgress scrolling", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("updates once per frame however many scroll events arrive", () => {
    const frames = stubAnimationFrame();
    const root = document.documentElement;
    vi.spyOn(root, "scrollHeight", "get").mockReturnValue(2000);
    vi.spyOn(root, "clientHeight", "get").mockReturnValue(1000);
    const scrollTop = vi.spyOn(root, "scrollTop", "get").mockReturnValue(0);
    const { unmount } = render(<ScrollProgress />);
    const bar = screen.getByRole("progressbar");

    scrollTop.mockReturnValue(250);
    fireEvent.scroll(window);
    scrollTop.mockReturnValue(500);
    fireEvent.scroll(window);
    expect(frames.pending()).toBe(1);
    expect(bar).toHaveAttribute("aria-valuenow", "0");
    frames.flush();

    expect(bar).toHaveAttribute("aria-valuenow", "50");
    expect(bar.style.width).toBe("50%");

    fireEvent.scroll(window);
    unmount();
    expect(frames.pending()).toBe(0);
  });
});
