import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UnicodeSpinner } from "./unicode-spinner";

describe("UnicodeSpinner", () => {
  it("renders with an accessible loading label", () => {
    render(<UnicodeSpinner />);

    expect(screen.getByRole("status")).toBeVisible();
    expect(
      screen.getByText("Loading", { selector: ".sr-only" }),
    ).toBeInTheDocument();
  });

  it("renders a visible text label when provided", () => {
    render(<UnicodeSpinner animation="scanline" label="Syncing feed" />);

    expect(screen.getByText("Syncing feed")).toBeVisible();
    expect(
      screen.getByText("Loading Syncing feed", { selector: ".sr-only" }),
    ).toBeInTheDocument();
  });

  it("advances frames over time", () => {
    vi.useFakeTimers();

    try {
      const { container } = render(<UnicodeSpinner animation="braille" />);
      const before = container.querySelector(
        '[aria-hidden="true"]',
      )?.textContent;

      act(() => {
        vi.advanceTimersByTime(160);
      });

      const after = container.querySelector(
        '[aria-hidden="true"]',
      )?.textContent;
      expect(after).not.toEqual(before);
    } finally {
      vi.useRealTimers();
    }
  });
});
