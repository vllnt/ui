import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { stubMatchMedia } from "../../../__tests__/stub-match-media";

import { Typewriter } from "./typewriter";

describe("Typewriter", () => {
  beforeEach(() => {
    vi.useRealTimers();
    stubMatchMedia();
  });

  it("renders an accessible label with the full text and applies a custom class name", () => {
    const { container } = render(
      <Typewriter className="custom-class" text="Hello" />,
    );
    expect(
      screen.getByText("Hello", { selector: ".sr-only" }),
    ).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("preserves typed progress when speed changes", () => {
    vi.useFakeTimers();
    const { container, rerender } = render(
      <Typewriter speed={10} text="Hello" />,
    );
    act(() => {
      vi.runOnlyPendingTimers();
    });
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(container.querySelector("[aria-hidden='true']")).toHaveTextContent(
      "He",
    );
    rerender(<Typewriter speed={20} text="Hello" />);
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(container.querySelector("[aria-hidden='true']")).toHaveTextContent(
      "Hel",
    );
  });

  it("exposes the full text as screen-reader text, not a prohibited aria-label", () => {
    const { container } = render(<Typewriter text="Hello" />);
    expect(container.firstChild).not.toHaveAttribute("aria-label");
    expect(
      screen.getByText("Hello", { selector: ".sr-only" }),
    ).toBeInTheDocument();
  });
});
