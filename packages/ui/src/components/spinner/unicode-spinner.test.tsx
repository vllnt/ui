import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UNICODE_SPINNER_ANIMATIONS, UnicodeSpinner } from "./unicode-spinner";

describe("UnicodeSpinner", () => {
  it("exposes the full upstream animation set", () => {
    expect(UNICODE_SPINNER_ANIMATIONS).toHaveLength(59);
    expect(UNICODE_SPINNER_ANIMATIONS).toEqual(
      expect.arrayContaining([
        "braillewave",
        "checkerboard",
        "columns",
        "diagswipe",
        "dna",
        "fillsweep",
        "orbit",
        "pulse",
        "rain",
        "scan",
        "scanline",
        "snake",
        "sparkle",
        "waverows",
        "weather",
        "arrow",
        "braille",
        "braillewave",
        "moon",
        "rolling-line",
        "scanline",
      ]),
    );
  });

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

  it("supports additional upstream presets like orbit", () => {
    render(<UnicodeSpinner animation="orbit" />);

    expect(screen.getByRole("status")).toBeVisible();
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
