import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NumberTicker } from "./number-ticker";

describe("NumberTicker", () => {
  it("renders the target value immediately when duration is zero", () => {
    render(<NumberTicker duration={0} value={1250} />);

    expect(screen.getByText("1,250")).toBeVisible();
  });

  it("formats the rendered value", () => {
    render(
      <NumberTicker
        duration={0}
        formatOptions={{ maximumFractionDigits: 1, minimumFractionDigits: 1 }}
        value={42.25}
      />,
    );

    expect(screen.getByText("42.3")).toBeVisible();
  });

  it("respects reduced motion preferences", () => {
    const matchMedia = vi.fn().mockReturnValue({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    });

    vi.stubGlobal("matchMedia", matchMedia);

    render(<NumberTicker duration={2} from={10} value={99} />);

    expect(screen.getByText("99")).toBeVisible();

    vi.unstubAllGlobals();
  });
});
