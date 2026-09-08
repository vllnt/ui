import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Typewriter } from "./typewriter";

describe("Typewriter", () => {
  beforeEach(() => {
    vi.useRealTimers();
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
});
